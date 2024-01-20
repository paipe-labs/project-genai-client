import { parseSessionManagerOptions, SessionManager } from './SessionManager.js';

const sessionManagerOptions = parseSessionManagerOptions();
const sessionManager = new SessionManager(sessionManagerOptions);
