
import "./App.css";
import { useEffect, useState } from 'react';
import { Command } from '@tauri-apps/api/shell'
import { invoke } from "@tauri-apps/api";
import axios, { AxiosResponse } from "axios";
import uuidv4 from './helpers/uuid.js'
import prettyPrintJson from "./helpers/prettyPrint";
function App() {


  const [messages, setMessages] = useState<string[]>([]);
  const [id, setId] = useState<string>('Not assigned');
  const [wsUrl, setWsUrl] = useState<string>('Not assigned');
  const [isConnectionOpen, setConnectionOpen] = useState<boolean>(false);

  useEffect(() => {

    // Create a new WebSocket connection

    const setup = async () => {

      const localNode:string = uuidv4();
      setId(localNode);
      const websocketUri = await getWebsocketConnectionEndpoint();
      setWsUrl(websocketUri);
      const ws = new WebSocket(websocketUri);

      ws.addEventListener('open', (event) => {
        ws.send(JSON.stringify({ type: 'greetings', node_id: localNode }));
        console.log('WebSocket connection opened');
        setConnectionOpen(true);
      });
    
      ws.addEventListener('message', async (event) => {
        const messageString = prettyPrintJson(JSON.stringify(event.data));
        const newMessages = messages;
        newMessages.push(messageString);
        setMessages(newMessages);
      });
    
      // Add a listener for the 'close' event
      ws.addEventListener('close', (event) => {
        console.log('WebSocket connection closed');
        setConnectionOpen(false);
      });
      

      return () => {
        ws.close();
      };

    }


  
    setup();

  }, []);

  
  const getWebsocketConnectionEndpoint = async () => {
    const request = await axios.post('https://genai.edenvr.link/v1/client/hello');
    if (request.data.ok === true) {
      return request.data.url;
    }
  }

  const executeShellCommand = async (command: string) => {
    try {
      await new Promise(async (resolve) => {
        const cmd = new Command('ls', ['-la']);
        cmd.on('error', (error) => alert(`command error: "${error}"`))
        cmd.stdout.on('data', (line) => {
          resolve(line);
        })
        cmd.stderr.on('data', (line) => {
          resolve(line);
        })
        cmd.spawn();
      })
      return true;
    } catch (error) {
      console.error(error); // log any errors to the console
      return false;
    }
  };
 
  return (
    <div className="container">
      <div className='content'>
      <div>GenAI --- DEMO</div>
      <div className='status'>node-id: {id}</div>
      <div className='status'>ws-url: {wsUrl}</div>
      <div className='status'>connection: {isConnectionOpen ? 'connected' : 'disconnected'}</div>
      {messages.map((ms, idx) => {
        return <div className='message' id={'message'+idx}>{(ms)}</div>
      })}
      </div>
    </div>
  );
}

export default App;
