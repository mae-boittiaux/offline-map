import { initialiseApp } from './initialisation.js';
import { registerServiceWorker } from './registration.js';
import { setupConnectionStatus } from './connection-status.js';

document.addEventListener('DOMContentLoaded', async () => {
    await initialiseApp();
    registerServiceWorker();
    setupConnectionStatus();
});
