import { registerServiceWorker } from './registration.js';
import { setupConnectionStatus } from './connection-status.js';

document.addEventListener('DOMContentLoaded', async () => {
    registerServiceWorker();
    setupConnectionStatus();
});
