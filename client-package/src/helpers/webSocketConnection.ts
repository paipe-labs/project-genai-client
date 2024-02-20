import ReconnectingWebSocket from 'reconnecting-websocket';
import { WebSocket } from 'ws';

export async function waitForWebSocketConnection(webSocketUrl: string): Promise<void> {
    const ws = new ReconnectingWebSocket(webSocketUrl, [], { WebSocket: WebSocket });
    return new Promise(function(resolve) {
        const webSocketConnectionRetry = setInterval(
            function () {
                if (ws.readyState === 1) {
                    ws.close();
                    clearInterval(webSocketConnectionRetry);
                    resolve();
                }
            },
            1000
        );
    })
}
