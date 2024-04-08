import ReconnectingWebSocket from 'reconnecting-websocket';
import { WebSocket } from 'ws';

export async function waitForWebSocketConnection(webSocketUrl: string): Promise<void> {
    const ws = new ReconnectingWebSocket(webSocketUrl, [], { WebSocket: WebSocket });
    return new Promise(function(resolve) {
        const webSocketConnectionRetry = setInterval(
            function () {
                console.log('Waiting for WebSocket connection:', webSocketUrl)
                if (ws.readyState === 1) {
                    console.log('WebSocket connection ready:', webSocketUrl)
                    ws.close();
                    clearInterval(webSocketConnectionRetry);
                    resolve();
                }
            },
            1000
        );
    })
}
