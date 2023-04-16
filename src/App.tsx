
import "./App.css";
import { useEffect, useState } from 'react';
import { Command } from '@tauri-apps/api/shell'
import { invoke } from "@tauri-apps/api";
function App() {


  const [messages, setMessages] = useState([]);

  useEffect(() => {

      // Create a new WebSocket connection
  
      const node = 'node-id-random-tauri';
  
      const ws = new WebSocket('ws://localhost:8080');
  
      // Add a listener for the 'open' event
      ws.addEventListener('open', (event) => {
        ws.send(JSON.stringify({ type: 'greetings', node_id: node }));
        console.log('WebSocket connection opened');
      });
  
      // Add a listener for the 'message' event
      ws.addEventListener('message', async (event) => {
        console.log('Received message:', event.data);
        try {
          executeShellCommand('ls -la')
        } catch (beepError) {
          console.log(beepError)
        }
      });
  
      // Add a listener for the 'close' event
      ws.addEventListener('close', (event) => {
        console.log('WebSocket connection closed');
      });
  
      // Clean up the WebSocket connection when the component unmounts
      return () => {
        ws.close();
      };

  }, [])


  const executeShellCommand = async (command: string) => {
    try {
      
      const cmd = new Command('ls', ['-la']);

      cmd.on('error', (error) => alert(`command error: "${error}"`))

    cmd.stdout.on('data', (line) => alert(`command stdout: "${line}"`))
    cmd.stderr.on('data', (line) => alert(`command stderr: "${line}"`))
      cmd.spawn();
    } catch (error) {
      console.error(error); // log any errors to the console
    }
  };
  const beep = async () => {
    try {
      await invoke('notification', {
        title: 'Beep!',
        body: 'This is a beep notification',
      });
    } catch (error) {
      console.error(error);
    }
  };
 
  return (
    <div className="container">
      <div>Hello World3f</div>
    </div>
  );
}

export default App;
