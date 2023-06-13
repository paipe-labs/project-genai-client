var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define("helpers/uuid", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.uuidv4 = void 0;
    function uuidv4() {
        let uuid = "";
        for (let i = 0; i < 32; i++) {
            if (i === 8 || i === 12 || i === 16 || i === 20) {
                uuid += "-";
            }
            const randomDigit = (Math.random() * 16) | 0;
            if (i === 12) {
                uuid += "4";
            }
            else if (i === 16) {
                uuid += (randomDigit & 3) | 8;
            }
            else {
                uuid += randomDigit.toString(16);
            }
        }
        return uuid;
    }
    exports.uuidv4 = uuidv4;
});
define("helpers/prettyPrint", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.prettyPrintJson = void 0;
    function prettyPrintJson(jsonString) {
        try {
            const jsonObject = JSON.parse(jsonString);
            const prettyJsonString = JSON.stringify(jsonObject, null, 2);
            return prettyJsonString;
        }
        catch (error) {
            console.error(error);
            return jsonString;
        }
    }
    exports.prettyPrintJson = prettyPrintJson;
});
define("helpers/index", ["require", "exports", "helpers/uuid", "helpers/prettyPrint"], function (require, exports, uuid_1, prettyPrint_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.prettyPrintJson = exports.uuidv4 = void 0;
    Object.defineProperty(exports, "uuidv4", { enumerable: true, get: function () { return uuid_1.uuidv4; } });
    Object.defineProperty(exports, "prettyPrintJson", { enumerable: true, get: function () { return prettyPrint_1.prettyPrintJson; } });
});
define("SessionManager", ["require", "exports", "axios", "helpers/index", "ws"], function (require, exports, axios_1, helpers_1, ws_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SessionManager = void 0;
    axios_1 = __importDefault(axios_1);
    class SessionManager {
        DefualtApiAddress = 'http://127.0.0.1:5003/api';
        constructor() {
            this.setupSession();
        }
        async setupSession() {
            const localNode = (0, helpers_1.uuidv4)();
            const websocketUri = await getWebsocketConnectionEndpoint();
            console.log('Websocket URI:', websocketUri);
            const wsURL = 'wss://orca-app-feq22.ondigitalocean.app/';
            const ws = new ws_1.WebSocket(wsURL);
            ws.addEventListener('open', (event) => {
                ws.send(JSON.stringify({ type: 'greetings', node_id: localNode }));
                console.log('WebSocket connection opened');
            });
            ws.addEventListener('message', async (event) => {
                const messageString = (0, helpers_1.prettyPrintJson)(JSON.stringify(event.data));
                const { model, size, prompt } = JSON.parse(event.data.toString());
                switch (model) {
                    case 'SD2.1-base':
                        const generation = await axios_1.default.post(`${this.DefualtApiAddress}/generate/txt2img`, {
                            backend: 'PyTorch',
                            autoload: false,
                            data: {
                                id: (0, helpers_1.uuidv4)(),
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
            ws.addEventListener('close', (event) => {
                console.log('WebSocket connection closed');
            });
        }
    }
    exports.SessionManager = SessionManager;
    const getWebsocketConnectionEndpoint = async () => {
        const request = await axios_1.default.post('https://orca-app-feq22.ondigitalocean.app/v1/client/hello');
        if (request.data.ok === true) {
            return request.data.url;
        }
    };
});
define("index", ["require", "exports", "SessionManager"], function (require, exports, SessionManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SessionManager = void 0;
    Object.defineProperty(exports, "SessionManager", { enumerable: true, get: function () { return SessionManager_1.SessionManager; } });
});
define("run", ["require", "exports", "SessionManager"], function (require, exports, SessionManager_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const sessionManager = new SessionManager_2.SessionManager();
    console.log('Node client started');
});
