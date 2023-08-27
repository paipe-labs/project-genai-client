import axios from "axios";
import { uuidv4 } from "./helpers/index.js";
import { WebSocket as WebSocketNode } from 'ws';
import { isNode } from 'browser-or-node';
import { TaskZod } from "./types.js";
import { TasksManager } from "./TasksManager.js";
import { AutomaticInferenceServer } from "./InferenceServer/AutomaticInferenceServer.js";
import { VoltaMLInferenceServer } from "./InferenceServer/VoltaMLInferenceServer.js";
const wsURL = 'ws://localhost:8080/';
export class SessionManager {
    _inferenceServerUrl;
    _tasksManager;
    _inferenceServer;
    _ws;
    constructor(options) {
        this._inferenceServerUrl = options?.inferenceServerUrl;
        const inferenceServerType = options?.inferenceServerType ?? 'automatic';
        switch (inferenceServerType) {
            case 'automatic':
                this._inferenceServer = new AutomaticInferenceServer({ inferenceServerUrl: this._inferenceServerUrl });
                break;
            case 'voltaml':
                this._inferenceServer = new VoltaMLInferenceServer({ inferenceServerUrl: this._inferenceServerUrl });
                break;
        }
        this._tasksManager = new TasksManager(this._inferenceServer);
        if (isNode) {
            this._ws = new WebSocketNode(wsURL);
        }
        else {
            this._ws = new WebSocket(wsURL);
        }
        this.setupSession();
    }
    async setupSession() {
        const { _ws: ws } = this;
        const onSocketOpen = () => {
            ws.send(JSON.stringify({ type: 'greetings', node_id: uuidv4() }));
            console.log('WebSocket connection opened');
        };
        const onSocketMessage = async (taskData) => {
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
        const onSocketClose = () => {
            console.log('WebSocket connection closed');
        };
        if (isWebSocketNode(ws)) {
            ws.on('open', onSocketOpen);
            ws.on('message', (rawMessage) => onSocketMessage(JSON.parse(rawMessage.toString())));
            ws.on('close', onSocketClose);
        }
        else {
            ws.addEventListener('open', onSocketOpen);
            ws.addEventListener('message', (event) => onSocketMessage(JSON.parse(event.data.toString())));
            ws.addEventListener('close', onSocketClose);
        }
    }
    sendTaskResult(taskResult) {
        this._ws.send(JSON.stringify(taskResult));
    }
}
export const getWebsocketConnectionEndpoint = async () => {
    const request = await axios.post('https://api.genai.network/v1/client/hello');
    if (request.data.ok === true) {
        return request.data.url;
    }
};
export function isWebSocketNode(ws) {
    return ws.on !== undefined && ws.off !== undefined;
}
