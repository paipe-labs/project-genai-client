import { WebSocket as WebSocketNode } from 'ws';
export type InferenceServerType = 'automatic' | 'voltaml';
export type SessionManagerOptions = {
    inferenceServerUrl?: string;
    inferenceServerType?: InferenceServerType;
};
export declare class SessionManager {
    private _inferenceServerUrl?;
    private _tasksManager;
    private _inferenceServer;
    private _ws;
    constructor(options?: SessionManagerOptions);
    private setupSession;
    private sendTaskResult;
}
export declare const getWebsocketConnectionEndpoint: () => Promise<any>;
export declare function isWebSocketNode(ws: WebSocket | WebSocketNode): ws is WebSocketNode;
