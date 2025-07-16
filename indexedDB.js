import { parseOSMData } from './parse-data.js';
import { logMessage, MessageScope, MessageOutput } from './log-message.js';

const DB_NAME = 'OSM-DB';
const DB_VERSION = 1;

const STORE_NAMES = Object.freeze({
    NODES: "nodes",
    WAYS: "ways",
    RELATIONS: "relations"
});

const ALL_STORE_NAMES = Object.values(STORE_NAMES);

function createObjectStores(database) {
    for (const storeName of ALL_STORE_NAMES) {
        if (!database.objectStoreNames.contains(storeName)) {
            database.createObjectStore(storeName, { keyPath: 'id' });
        }
    }
    logMessage(MessageScope.INDEXED_DB, MessageOutput.CONSOLE, "OSM data schema updated");
}

function awaitTransactionCompletion(transaction) {
    return new Promise((resolve, reject) => {
        transaction.oncomplete = resolve;
        transaction.onerror = (event) => {
            const errorMessage = `Transaction error: ${event.target.error}`;
            logMessage(MessageScope.INDEXED_DB, MessageOutput.CONSOLE, errorMessage);
            reject(new Error(errorMessage));
        };
    });
}

export async function openDatabase() {
    return new Promise((resolve, reject) => {
        let request;
        try {
            request = window.indexedDB.open(DB_NAME, DB_VERSION);
        } catch (error) {
            const errorMessage = `Failed to open database: ${error.message}`;
            logMessage(MessageScope.INDEXED_DB, MessageOutput.CONSOLE, errorMessage);
            return reject(new Error(errorMessage));
        }

        request.onupgradeneeded = (event) => {
            try {
                const database = event.target.result;
                createObjectStores(database);
            } catch (error) {
                const errorMessage = `Error during upgrade: ${error.message}`;
                logMessage(MessageScope.INDEXED_DB, MessageOutput.CONSOLE, errorMessage);
                reject(new Error(errorMessage));
            }
        };

        request.onsuccess = (event) => {
            logMessage(MessageScope.INDEXED_DB, MessageOutput.CONSOLE, "Connection success");
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            const errorMessage = `Connection error: ${event.target.errorCode || event.target.error}`;
            logMessage(MessageScope.INDEXED_DB, MessageOutput.CONSOLE, errorMessage);
            reject(new Error(errorMessage));
        };
    });
}

export async function storeItems(storeName, items, transform, database) {
    if (!database) {
        const errorMessage = "Database instance is undefined";
        logMessage(MessageScope.INDEXED_DB, MessageOutput.CONSOLE, errorMessage);
        throw new Error(errorMessage);
    }
    try {
        const transaction = database.transaction([storeName], "readwrite");
        const objectStore = transaction.objectStore(storeName);
        logMessage(MessageScope.INDEXED_DB, MessageOutput.CONSOLE, `Storing ${storeName} items..`);

        for (const item of items) {
            let record;
            try {
                record = transform(item);
            } catch (transformError) {
                logMessage(MessageScope.INDEXED_DB, MessageOutput.CONSOLE, `Error transforming item for store ${storeName}: ${transformError}`);
                continue;
            }
            if (record === undefined) {
                logMessage(MessageScope.INDEXED_DB, MessageOutput.CONSOLE, `Transform returned undefined for an item in store ${storeName}. Skipping.`);
                continue;
            }
            objectStore.put(record);
        }

        await awaitTransactionCompletion(transaction);

        logMessage(MessageScope.INDEXED_DB, MessageOutput.CONSOLE, `${storeName} data stored successfully`);
        logMessage(MessageScope.INDEXED_DB, MessageOutput.CONSOLE, `${[...items].length} ${storeName} records processed`);
    } catch (error) {
        const errorMessage = `Error storing ${storeName} data: ${error.message}`;
        logMessage(MessageScope.INDEXED_DB, MessageOutput.CONSOLE, errorMessage);
        throw new Error(errorMessage);
    }
}

export async function parseAndStoreOSMData(xmlString, database) {
    if (!xmlString) {
        const errorMessage = "No XML data provided";
        logMessage(MessageScope.INDEXED_DB, MessageOutput.CONSOLE, errorMessage);
        throw new Error(errorMessage);
    }
    try {
        logMessage(MessageScope.INDEXED_DB, MessageOutput.CONSOLE, "Parsing XML data..");
        const { nodes, ways, relations } = parseOSMData(xmlString);

        await Promise.all([
            storeItems(STORE_NAMES.NODES, nodes, item => item, database),
            storeItems(STORE_NAMES.WAYS, ways, item => item, database),
            storeItems(STORE_NAMES.RELATIONS, relations, item => item, database)
        ]);
    } catch (error) {
        const errorMessage = `Failed to parse and store OSM data: ${error.message}`;
        logMessage(MessageScope.INDEXED_DB, MessageOutput.CONSOLE, errorMessage);
        throw new Error(errorMessage);
    }
}

export { STORE_NAMES };
