/**
 * @fileoverview 
 * Connection Status module for monitoring and updating the network connectivity status.
 * 
 * The following script listens to the online and offline events of the browser in order 
 * to update the network status displayed on the page, dynamically setting the text of 
 * the element with ID: 'connectionStatus' based on the network status.
 */

import { logMessage, MessageScope, MessageOutput } from './log-message.js';

/**
 * Sets up the network connectivity status monitoring.
 * 
 * This function retrieves the DOM element with the ID 'connectionStatus' and dynamically
 * updates its text content, and attaches event listeners to the 'online' and 'offline' 
 * events, ensuring that the element is updated whenever the connection status changes.
 *
 * @returns {void}
 */
export function setupConnectionStatus() {
    const connectionStatus = document.getElementById('connectionStatus');

    function updateStatus() {
        if (navigator.onLine) {
            connectionStatus.textContent = "[Network]: Online.";
            logMessage(MessageScope.CONNECTION_STATUS, MessageOutput.CONSOLE, "Online");
        } else {
            connectionStatus.textContent = "[Network]: Offline.";
            logMessage(MessageScope.CONNECTION_STATUS, MessageOutput.CONSOLE, "Offline");
        }
    }
    updateStatus();

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
}
