import { logMessage, MessageScope, MessageOutput } from './log-message.js';

const CACHE_NAME = 'final-implementation-cache-v1';

const URLS_TO_CACHE = [
    './',
    './main.js',
    './style.css',
    './index.html',
    './favicon.ico',
    './log-message.js',
    './registration.js',
    './service-worker.js',
    './connection-status.js'
];

self.addEventListener('install', event => {
    logMessage(MessageScope.SERVICE_WORKER, MessageOutput.CONSOLE, "Installing service worker..");
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            try {
                await cache.addAll(URLS_TO_CACHE);
                logMessage(MessageScope.SERVICE_WORKER, MessageOutput.CONSOLE, "Resources cached successfully");
            } catch (error) {
                logMessage(MessageScope.SERVICE_WORKER, MessageOutput.CONSOLE, `Failed to cache resources: ${error}`);
            }
            await self.skipWaiting();
        })()
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            const cachedResponse = await cache.match(event.request);
            const networkPromise = fetch(event.request)
                .then(networkResponse => {
                    if (networkResponse && networkResponse.status === 200) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                })
                .catch(error => {
                    logMessage(MessageScope.SERVICE_WORKER, MessageOutput.CONSOLE, `Network request failed: ${error}`);
                });
            return cachedResponse || networkPromise;
        })()
    );
});

self.addEventListener('activate', event => {
    logMessage(MessageScope.SERVICE_WORKER, MessageOutput.CONSOLE, "Activating service worker..");
    event.waitUntil(
        (async () => {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        logMessage(MessageScope.SERVICE_WORKER, MessageOutput.CONSOLE, `Deleting old cache: ${cache}`);
                        return caches.delete(cache);
                    }
                })
            );
            await self.clients.claim();
        })()
    );
});
