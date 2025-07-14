import { logMessage, MessageScope, MessageOutput } from './log-message.js';

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
