import { logMessage, MessageScope, MessageOutput } from './log-message.js';

export function setupConnectionStatus() {
    const connectionStatus = document.getElementById('connectionStatus');

    function updateStatus() {
        if (navigator.onLine) {
            connectionStatus.textContent = "[Network]: Online";
            logMessage(MessageScope.CONNECTION_STATUS, MessageOutput.CONSOLE, "Online");
        } else {
            connectionStatus.textContent = "[Network]: Offline";
            logMessage(MessageScope.CONNECTION_STATUS, MessageOutput.CONSOLE, "Offline");
        }
    }
    updateStatus();

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
}
