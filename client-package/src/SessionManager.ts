import axios from "axios";
import { prettyPrintJson, uuidv4 } from "./helpers/index.js";

import { WebSocket as WebSocketNode } from 'ws';

import { isNode, isBrowser } from 'browser-or-node';
import sdwebui, { Client } from "node-sd-webui";

const wsURL = 'ws://localhost:8080/';//'wss://api.genai.network/';
export type InferenceServerType = 'automatic' | 'voltaml';

export type SessionManagerOptions = {
  inferenceServerUrl?: string;
  inferenceServerType?: InferenceServerType;
};

/**
 * SessionManager is responsible for managing the websocket connection to the server.
 */
export class SessionManager {
  private DefualtInferenceServerUrl = 'http://127.0.0.1:7860';
  private _inferenceServerUrl: string;
  private _inferenceServerType: InferenceServerType;
  private _automaticClient: Client;

  constructor(options?: SessionManagerOptions) {
    this._inferenceServerUrl = options?.inferenceServerUrl ?? this.DefualtInferenceServerUrl;
    this._inferenceServerType = options?.inferenceServerType ?? 'automatic';
    this._automaticClient = sdwebui({apiUrl: this._inferenceServerUrl});

    this.setupSession();
  }

  async setupSession() {
    const localNode: string = uuidv4();
    
    let ws: WebSocket | WebSocketNode;

    if (isNode) {
      ws = new WebSocketNode(wsURL);
    } else {
      ws = new WebSocket(wsURL);
    }
      
    const onSocketOpen = () => {
      ws.send(JSON.stringify({ type: 'greetings', node_id: localNode }));
      console.log('WebSocket connection opened');
    };

    const onSocketMessage = async (eventData: any) => {
      const { model, size, prompt, request_id} = eventData;

      switch (this._inferenceServerType) {
        case 'automatic':
          this._automaticClient
            .txt2img({
              prompt: prompt,
              steps: 20,
            })
            .then(({ images }) => {
              ws.send(JSON.stringify({ type: 'result', status: 'ready', request_id, result_url: images[0] }));
            })
            .catch((err) => {
              ws.send(JSON.stringify({ type: 'error', status: 'error', request_id, error: err }));
            })

          break;
        case 'voltaml':
          const generation = await axios.post(`${this._inferenceServerUrl}/generate/txt2img`, {
            backend: 'PyTorch',
            autoload: false,
            data: {
              id: uuidv4(),
              prompt: prompt,
              negative_prompt: "ugly, bad quality, low resolution, worst quality, bad anatomy",
              width: 512,
              height: 512,
              steps: 30,
              guidance_scale: 8,
              seed: Math.floor(Math.random() * 1000000000),
              batch_size: 1,
              batch_count: 1,
              scheduler: 5,
              self_attention_scale: 0
            },
            model: 'stabilityai/stable-diffusion-2-1' //SD2.1-base 
          });

          console.log(generation.data.images[0]);
          break;
      }
    };

    // Add a listener for the 'close' event
    const onSocketClose = () => {
      console.log('WebSocket connection closed');
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
