/**
 * @fileoverview 
 * Service Worker implementation for the offline caching and network request handling.
 * 
 * The following script handles the caching of the application resources during the 
 * Service Worker installation phase, intercepts network requests to serve the cached 
 * responses when available, and cleans up the outdated caches during activation.
 */
import { logMessage, MessageScope, MessageOutput } from './log-message.js';

/**
 * The name of the cache used for storing application resources for offline access.
 * @constant {string}
 */
const CACHE_NAME = 'final-implementation-cache-v1';

/**
 * An array of URLs representing the resources to be cached during the installation phase 
 * of the Service Worker.  These resources include all other scripts, stylesheets, HTML, 
 * and images necessary for the full offline functionality.
 * @constant {string[]}
 */
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

/**
 * Handles the 'install' event of the Service Worker.
 * 
 * During the installation phase, the Service Worker opens the designated cache and adds 
 * all the prespecified resources.  This process ensures that the assets are available 
 * for offline access.
 *
 * @listens ExtendableEvent#install
 * @param {ExtendableEvent} event - The install event, triggered when the Service Worker 
 *                                  is being installed.
 */
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

/**
 * Handles the 'fetch' event of the Service Worker.
 * 
 * This event listener intercepts all of the network requests. It attempts to serve a 
 * cached response for the request, but if no cached version is available, it falls back 
 * to fetching the resource from the network.
 *
 * @listens FetchEvent#fetch
 * @param {FetchEvent} event - The fetch event, triggered for each network request.
 */
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

/**
 * Handles the 'activate' event of the Service Worker.
 * 
 * During the activation phase, the handler ensures that any outdated caches (i.e., 
 * caches not matching the current cache name) are removed. This helps in maintaining 
 * only the latest set of cached assets.
 *
 * @listens ExtendableEvent#activate
 * @param {ExtendableEvent} event - The activate event, triggered when the service worker 
 *                                  is activated.
 */
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
