/**
 * @fileoverview 
 * Main application entry point for the final-implementation.
 * 
 * The following script waits for the DOM to be fully loaded before initialising the 
 * application.  It then imports the necessary modules to set up the canvas rendering, 
 * the IndexedDB database, the event listeners, and then registers the Service Worker.
 */

import { initialiseApp } from './initialisation.js';
import { registerServiceWorker } from './registration.js';
import { setupConnectionStatus } from './connection-status.js';

/**
 * Event listener for the DOMContentLoaded event.
 * 
 * When the DOM content has been fully loaded, this callback function initialises the 
 * application by calling initialiseApp(), and then registers the Service Worker via 
 * the registerServiceWorker() function.
 *
 * @listens Document#DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', async () => {
    await initialiseApp();
    registerServiceWorker();
    setupConnectionStatus();
});
