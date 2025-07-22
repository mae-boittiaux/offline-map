/**
 * @fileoverview 
 * Handles the registration of the Service Worker.
 * 
 * The following module exports a function that registers the Service Worker for the 
 * application.  It verifies if there is browser support for Service Workers, and then 
 * logs the registration status to the console.
 */

import { logMessage, MessageScope, MessageOutput } from './log-message.js';

/**
 * Registers the Service Worker for the application.
 * 
 * Checks for Service Worker support in the current browser environment; if supported, 
 * attempts to register the Service Worker from './service-worker.js'. Upon successful 
 * registration, it logs the registration scope; otherwise, it logs an error.
 *
 * @returns {Promise<void>} A promise that resolves when the Service Worker registration 
 *                          process completes.
 */
export async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('./service-worker.js', { type: 'module' });
            logMessage(MessageScope.SERVICE_WORKER, MessageOutput.CONSOLE, `Registered with scope: ${registration.scope}`);
        } catch (error) {
            logMessage(MessageScope.SERVICE_WORKER, MessageOutput.CONSOLE, `Registration failed: ${error}`);
        }
    }
}
