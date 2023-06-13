import axios from "axios";
import { prettyPrintJson, uuidv4 } from "./helpers";
import { WebSocket } from 'ws';

/**
 * SessionManager is responsible for managing the websocket connection to the server.
 */
export class SessionManager {
    private DefualtApiAddress = 'http://127.0.0.1:5003/api';
    
    constructor() {
        this.setupSession();
    }

    async setupSession() {
        const localNode: string = uuidv4();
      
      const websocketUri = await getWebsocketConnectionEndpoint();
      console.log('Websocket URI:', websocketUri);
      const wsURL = 'wss://orca-app-feq22.ondigitalocean.app/'
      const ws = new WebSocket(wsURL);

      ws.addEventListener('open', (event) => {
        ws.send(JSON.stringify({ type: 'greetings', node_id: localNode }));
        console.log('WebSocket connection opened');
      });
    
      ws.addEventListener('message', async (event) => {
        const messageString = prettyPrintJson(JSON.stringify(event.data));
        const {model, size, prompt} = JSON.parse(event.data.toString());

        switch (model) {
          case 'SD2.1-base':
            const generation = await axios.post(`${this.DefualtApiAddress}/generate/txt2img`, {
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
              model: 'stabilityai/stable-diffusion-2-1'
            });

            console.log(generation.data.images[0]);
            break;

        }
      });
    
      // Add a listener for the 'close' event
      ws.addEventListener('close', (event) => {
        console.log('WebSocket connection closed');
      });
    } 
    
}

const getWebsocketConnectionEndpoint = async () => {
    const request = await axios.post('https://orca-app-feq22.ondigitalocean.app/v1/client/hello');
    if (request.data.ok === true) {
      return request.data.url;
    }
  }
      