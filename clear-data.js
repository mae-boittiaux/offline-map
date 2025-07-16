import { STORE_NAMES } from './indexedDB.js';
import { logMessage, MessageScope, MessageOutput } from './log-message.js';

const ALL_STORE_NAMES = Object.values(STORE_NAMES);

export function resetRendererState(renderer) {
    renderer.offsetX = 0;
    renderer.offsetY = 0;
    renderer.zoomLevel = 1;
    renderer.currentOffsetX = 0;
    renderer.currentOffsetY = 0;
}

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

export function clearLocalStorage() {
    localStorage.removeItem("offsetX");
    localStorage.removeItem("offsetY");
    localStorage.removeItem("zoomLevel");
}

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
