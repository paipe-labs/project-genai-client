import axios from "axios";
import * as si from 'systeminformation';
import { waitForWebSocketConnection, uuidv4 } from "./helpers/index.js";

import { WebSocket as WebSocketNode } from 'ws';

import { Command, Option } from 'commander';
import { isNode } from 'browser-or-node';
import { Task, TaskResult, TaskZod } from "./types.js";
import { TasksManager } from "./TasksManager.js";

import { InferenceServer } from "./InferenceServer/InferenceServer.js";
import { AutomaticInferenceServer } from "./InferenceServer/AutomaticInferenceServer.js";
import { VoltaMLInferenceServer } from "./InferenceServer/VoltaMLInferenceServer.js";
import { ComfyUIInferenceServer } from "./InferenceServer/ComfyUIInferenceServer.js";
import { TestInferenceServer } from "./InferenceServer/TestInferenceServer.js";

export type InferenceServerType = 'automatic' | 'voltaml' | 'comfyUI' | 'test';

type NodeMetadata = {
  models: string[],
  gpuType: string,
  // gpuMemory: number,
  nCPU: number,
  RAM: number
}

export type SessionManagerOptions = {
  backendServerWebSocketUrl: string;
  inferenceServerUrl?: string;
  inferenceServerType?: InferenceServerType;

  // client node metadata
  nodeMetadata?: NodeMetadata;
};

export function parseSessionManagerOptions(): SessionManagerOptions {
  const program = new Command();

  program
    .addOption(new Option('-b, --backend <url>', 'backend server webSocket url'))
    .addOption(new Option('-i, --inference <url>', 'inference server url'))
    .addOption(new Option('-t, --type <type>', 'inference server type').choices(['automatic', 'voltaml', 'comfyUI', 'test']))

    .addOption(new Option('--models <models...>', 'downloaded models').default([] as string[]));

  program.parse(process.argv);
  const options = program.opts();

  var metadata = {} as NodeMetadata;
  si.graphics().then(data => metadata.gpuType=data.controllers[0].model).catch(err => console.error(err));
  si.cpu().then(data => metadata.nCPU=data.cores).catch(err => console.error(err));
  si.mem().then(data => metadata.RAM=data.available).catch(err => console.error(err));
  
  metadata.models = options.models;
  return { backendServerWebSocketUrl: options.backend, inferenceServerUrl: options.inference, inferenceServerType: options.type, nodeMetadata: metadata};
}

/**
 * SessionManager is responsible for managing the websocket connection to the server.
 */
export class SessionManager {
  private _inferenceServerUrl?: string;
  private _backendServerWebSocketUrl: string;
  private _tasksManager: TasksManager;
  private _inferenceServer: InferenceServer;
  private _ws?: WebSocket | WebSocketNode;
  private _nodeId: string;
  
  // client node metadata
  private _nodeMetadata?: NodeMetadata;

  constructor(options: SessionManagerOptions) {
    const { backendServerWebSocketUrl, inferenceServerUrl, inferenceServerType, nodeMetadata } = options;

    this._inferenceServerUrl = inferenceServerUrl;
    this._backendServerWebSocketUrl = backendServerWebSocketUrl;
    this._nodeId = uuidv4();
    this._nodeMetadata = nodeMetadata;

    switch (inferenceServerType) {
      case 'automatic':
        this._inferenceServer = new AutomaticInferenceServer({ inferenceServerUrl });
        break;
      case 'voltaml':
        this._inferenceServer = new VoltaMLInferenceServer({ inferenceServerUrl });
        break;
      case 'comfyUI':
        this._inferenceServer = new ComfyUIInferenceServer({ inferenceServerUrl });
        break;
      default:
        this._inferenceServer = new TestInferenceServer();
        break;
    }

    this._tasksManager = new TasksManager(this._inferenceServer);

    this.setupSession();
  }

  public sendTestTask(taskData: Task) {
    const isParsed = TaskZod.safeParse(taskData).success;

    if (!isParsed)
      return console.log('Invalid task data:', taskData);

    this._tasksManager.executeTask(taskData).then((result) => {
      console.log('result', result);
    }).catch((error) => {
      console.log('Failed to execute task', error);
    });

  }

  private async setupSession() {
    await this._inferenceServer.setupInferenceSession();
    await this.setupServerSession();
  }

  private async setupServerSession() {
    await waitForWebSocketConnection(this._backendServerWebSocketUrl);

    if (isNode) {
      this._ws = new WebSocketNode(this._backendServerWebSocketUrl);
    } else {
      this._ws = new WebSocket(this._backendServerWebSocketUrl);
    }
    const { _ws: ws } = this;

    const onSocketOpen = () => {

      ws.send(JSON.stringify({
                type: 'register',
                node_id: this._nodeId,
                metadata: {
                    models: this._nodeMetadata?.models,
                    gpu_type: this._nodeMetadata?.gpuType,
                    ncpu: this._nodeMetadata?.nCPU,
                    ram: this._nodeMetadata?.RAM,
                }
            }));
      console.log('Server WebSocket connection opened');
    };

    const onSocketMessage = async (taskData: Task) => {
      const isParsed = TaskZod.safeParse(taskData).success;

      if (!isParsed)
        return console.log('Invalid task data:', taskData);

      const { taskId } = taskData;

      this._tasksManager.executeTask(taskData).then((result) => {
        ws.send(JSON.stringify({ type: 'result', status: 'ready', taskId: taskId, resultsUrl: result.imagesUrls }));
      }).catch((error) => {
        ws.send(JSON.stringify({ type: 'error', status: 'error', taskId: taskId, error: JSON.stringify(error) }));
      });

    };

    // Add a listener for the 'close' event
    const onSocketClose = () => {
      console.log('WebSocket connection closed, trying to reconnect...');
      this.setupServerSession();
    };

    if (isWebSocketNode(ws)) {
      ws.on('open', onSocketOpen);
      ws.on('message', (rawMessage) => onSocketMessage(JSON.parse(rawMessage.toString())));
      ws.on('close', onSocketClose);
    } else {
      ws.addEventListener('open', onSocketOpen);
      ws.addEventListener('message', (event) => onSocketMessage(JSON.parse(event.data.toString())));
      ws.addEventListener('close', onSocketClose);
    }
  }
}

export const getWebsocketConnectionEndpoint = async () => {
  const request = await axios.post('https://api.genai.network/v1/client/hello');
  if (request.data.ok === true) {
    return request.data.url;
  }
}

export function isWebSocketNode(ws: WebSocket | WebSocketNode): ws is WebSocketNode {
  return (ws as WebSocketNode).on !== undefined && (ws as WebSocketNode).off !== undefined;
}
