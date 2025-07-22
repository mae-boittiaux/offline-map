/**
 * @fileoverview
 * Clear Data module for resetting the data state and UI of the application.
 * 
 * The following script handles the clearing of all of the OSM map data stored in the 
 * IndexedDB database, the resetting of the renderer state of the canvas, the wiping of 
 * localStorage values, and updating the user interface to reflect the change to data.
 * 
 */

import { STORE_NAMES } from './indexedDB.js';
import { logMessage, MessageScope, MessageOutput } from './log-message.js';

/**
 * The array of object store names to be cleared within the database.
 * @constant {string[]}
 * 
 */
const ALL_STORE_NAMES = Object.values(STORE_NAMES);

/**
 * Resets the internal state of the renderer object to default pan and zoom values.
 * 
 * Modifies the coordinate offsets and zoom level of the renderer to restore to its 
 * initial state.  This does not affect the visual canvas map or any cached data.
 *
 * @param {Object} renderer - The renderer instance to be reset.
 * 
 */
export function resetRendererState(renderer) {
    renderer.offsetX = 0;
    renderer.offsetY = 0;
    renderer.zoomLevel = 1;
    renderer.currentOffsetX = 0;
    renderer.currentOffsetY = 0;
}

/**
 * Clears the visual canvas of the renderer and removes any cached elements and flags.
 * 
 * Erases the current map render, clears any in-memory representations of OSM elements:
 * nodes, ways, and relations, and resets the state flags of the renderer.
 *
 * @param {Object} renderer - The renderer instance whose cache should be cleared.
 * 
 */
export function clearRendererCache(renderer) {
    renderer.clear();

    // reset cached OSM element data
    renderer.cachedWays = [];
    renderer.cachedNodes = [];
    renderer.cachedRelations = [];

    // reset rendering state flags
    renderer.cacheReady = false;
    renderer.needsRender = false;
}

/**
 * Clears the persistent zoom level and pan offsets from localStorage.
 * 
 * This function removes the stored values for `offsetX`, `offsetY`, and `zoomLevel`,
 * ensuring that subsequent sessions do not restore previous canvas positions.
 * 
 */
export function clearLocalStorage() {
    localStorage.removeItem("offsetX");
    localStorage.removeItem("offsetY");
    localStorage.removeItem("zoomLevel");
}

/**
 * Resets the node, way, and relation count indicators in the user interface.
 * 
 * Updates the innerHTML of the DOM elements for displaying entity counts, replacing their
 * content with a zero-padded placeholder using greyed styling to reflect count emptiness.
 * 
 */
export function resetDataCountUI() {
    const zeroCount = '<span class="grey">000000000000</span>';

    const elements = {
        nodes: document.getElementById("nodesCount"),
        ways: document.getElementById("waysCount"),
        relations: document.getElementById("relationsCount")
    };

    for (const key in elements) {
        if (elements[key]) elements[key].innerHTML = zeroCount;
    }
}

/**
 * Binds the clear-data button to the full reset workflow.
 * 
 * When the associated button is clicked, the function clears the database, resets the 
 * renderer, clears the localStorage, and updates the UI counts.
 *
 * @param {HTMLButtonElement} clearDataBtn - The button triggering the clear operation.
 * @param {IDBDatabase} database - The IndexedDB database instance to clear.
 * @param {Object} renderer - The canvas renderer instance to reset.
 * 
 */
export function setupClearDataButton(clearDataBtn, database, renderer) {
    clearDataBtn.addEventListener("click", async () => {
        try {
            await clearDatabase(database);

            resetRendererState(renderer);
            clearRendererCache(renderer);

            resetDataCountUI();
            clearLocalStorage();

            logMessage(MessageScope.CLEAR_DATA, MessageOutput.BOTH, "Data cleared successfully");
        } catch (error) {
            logMessage(MessageScope.CLEAR_DATA, MessageOutput.BOTH, `Error clearing data: ${error.message}`);
        }
    });
}

/**
 * Wraps a database transaction in a Promise for asynchronous handling.
 * 
 * Resolves when the transaction completes successfully, or rejects on error.
 *
 * @private
 * @param {IDBTransaction} transaction - The IndexedDB transaction to monitor.
 * @returns {Promise<void>} A promise that resolves or rejects based on the transaction result.
 * 
 */
function transactionPromise(transaction) {
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => {
            const errorMessage = event.target.error;
            logMessage(MessageScope.CLEAR_DATA, MessageOutput.CONSOLE, errorMessage);
            reject(new Error(errorMessage));
        };
    });
}

/**
 * Clears all records from the configured object stores in the database.
 * 
 * Opens a readwrite transaction for all relevant stores and issues `.clear()` on each. 
 * Wraps the transaction in a Promise to await completion.
 *
 * @param {IDBDatabase} database - The IndexedDB instance containing the data stores.
 * @returns {Promise<void>} A promise that resolves once all stores are cleared.
 * @throws {Error} If the database instance is not provided or the operation fails.
 * 
 */
export async function clearDatabase(database) {
    if (!database) {
        const errorMessage = "Database instance is undefined"
        logMessage(MessageScope.CLEAR_DATA, MessageOutput.CONSOLE, errorMessage);
        throw new Error(errorMessage);
    };

    const transaction = database.transaction(ALL_STORE_NAMES, "readwrite");
    ALL_STORE_NAMES.forEach(store => transaction.objectStore(store).clear());
    await transactionPromise(transaction);

    logMessage(MessageScope.CLEAR_DATA, MessageOutput.CONSOLE, "Data stores cleared successfully");
}
