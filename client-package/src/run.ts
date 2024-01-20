import { parseSessionManagerOptions, SessionManager } from './SessionManager.js';

<<<<<<< HEAD
const sessionManager = new SessionManager({ inferenceServerType: 'comfyUI' });
=======
const sessionManagerOptions = parseSessionManagerOptions();
const sessionManager = new SessionManager(sessionManagerOptions);
>>>>>>> origin/main
