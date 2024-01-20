import axios from "axios";
import { prettyPrintJson, uuidv4 } from "./helpers/index.js";

import { WebSocket as WebSocketNode } from 'ws';

import { Command, Option } from 'commander';
import { isNode } from 'browser-or-node';
import { Task, TaskResult, TaskZod } from "./types.js";
import { TasksManager } from "./TasksManager.js";
import { InferenceServer } from "./InferenceServer/InferenceServer.js";
import { AutomaticInferenceServer } from "./InferenceServer/AutomaticInferenceServer.js";
import { VoltaMLInferenceServer } from "./InferenceServer/VoltaMLInferenceServer.js";
import { TestInferenceServer } from "./InferenceServer/TestInferenceServer.js";
import { ComfyUIInferenceServer } from "./InferenceServer/ComfyUIInferenceServer.js";

export type InferenceServerType = 'automatic' | 'voltaml' | 'test' | 'comfyUI';

export type SessionManagerOptions = {
  mainServerWebSocketUrl: string;
  inferenceServerUrl?: string;
  inferenceServerType?: InferenceServerType;
};

export function parseSessionManagerOptions(): SessionManagerOptions {
  const program = new Command();

  program
    .addOption(new Option('-c, --connect <url>', 'main server webSocket url').default('ws://server:8080/'))
    .addOption(new Option('-i, --inference-server <type>', 'inference server type').choices(['automatic', 'voltaml', 'test', 'comfyUI']).default('test'));

  program.parse(process.argv);

  const options = program.opts();
  return { mainServerWebSocketUrl: options.connect, inferenceServerType: options.inferenceServer };
}

/**
 * SessionManager is responsible for managing the websocket connection to the server.
 */
export class SessionManager {
  private _inferenceServerUrl?: string;
  private _mainServerWebSocketUrl: string;
  private _tasksManager: TasksManager;
  private _inferenceServer: InferenceServer;
  private _ws: WebSocket | WebSocketNode;

  constructor(options: SessionManagerOptions) {
    const { inferenceServerUrl, mainServerWebSocketUrl, inferenceServerType } = options;

    this._inferenceServerUrl = inferenceServerUrl;
    this._mainServerWebSocketUrl = mainServerWebSocketUrl;

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

    if (isNode) {
      this._ws = new WebSocketNode(this._mainServerWebSocketUrl);
    } else {
      this._ws = new WebSocket(this._mainServerWebSocketUrl);
    }

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
    const { _ws: ws } = this;

    const onSocketOpen = () => {
      ws.send(JSON.stringify({ type: 'register', node_id: uuidv4() }));
      console.log('WebSocket connection opened');
    };

    const onSocketMessage = async (taskData: Task) => {
      const isParsed = TaskZod.safeParse(taskData).success;

      if (!isParsed)
        return console.log('Invalid task data:', taskData);

      const { taskId } = taskData;

      this._tasksManager.executeTask(taskData).then((result) => {
        this.sendTaskResult({ type: 'result', status: 'ready', taskId: taskId, resultsUrl: result.imagesUrls });
      }).catch((error) => {
        ws.send(JSON.stringify({ type: 'error', status: 'error', taskId: taskId, error: JSON.stringify(error) }));
      });

    };

    // Add a listener for the 'close' event
    const onSocketClose = () => {
      console.log('WebSocket connection closed, trying to reconnect...');

      if (isNode) {
        this._ws = new WebSocketNode(this._mainServerWebSocketUrl);
      } else {
        this._ws = new WebSocket(this._mainServerWebSocketUrl);
      }

      this.setupSession();
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

  private sendTaskResult(taskResult: TaskResult) {
    this._ws.send(JSON.stringify(taskResult));
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
