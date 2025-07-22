/**
 * @fileoverview
 * IndexedDB implementation for the OSM data storage and retrieval.
 * 
 * This module handles the initialisation of the IndexedDB database, the creation of the 
 * object stores for nodes, ways, and relations, the functions to parse and store the OSM 
 * XML data, and the helper functions for wrapping database transactions in promises.
 */
import { parseOSMData } from './parse-data.js';
import { logMessage, MessageScope, MessageOutput } from './log-message.js';

/**
 * The name of the IndexedDB database used for storing the OpenStreetMap data.
 * @constant {string}
 */
const DB_NAME = 'OSM-DB';

/**
 * The version number of the IndexedDB database schema.
 * @constant {number}
 */
const DB_VERSION = 1;

/**
 * An object representing the names of the object stores used for storing the OSM data.
 * @constant {Object}
 * @property {string} NODES - The name of the object store for storing node data.
 * @property {string} WAYS - The name of the object store for storing way data.
 * @property {string} RELATIONS - The name of the object store for storing relation data.
 */
const STORE_NAMES = Object.freeze({
    NODES: "nodes",
    WAYS: "ways",
    RELATIONS: "relations"
});

/**
 * An array containing all of the object store names extracted from the STORE_NAMES constant.
 * @constant {Array<string>}
 */
const ALL_STORE_NAMES = Object.values(STORE_NAMES);

/**
 * Creates object stores in the provided IndexedDB database if they do not already exist.
 *
 * @private
 * @param {IDBDatabase} database - The IndexedDB database instance.
 * @returns {void}
 */
function createObjectStores(database) {
    for (const storeName of ALL_STORE_NAMES) {
        if (!database.objectStoreNames.contains(storeName)) {
            database.createObjectStore(storeName, { keyPath: 'id' });
        }
    }
    logMessage(MessageScope.INDEXED_DB, MessageOutput.CONSOLE, "OSM data schema updated");
}

/**
 * Wraps an IndexedDB transaction in a promise that resolves when the transaction completes.
 *
 * @private
 * @param {IDBTransaction} transaction - The transaction to monitor.
 * @returns {Promise<void>} A promise that resolves when the transaction completes successfully.
 */
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

/**
 * Opens the IndexedDB database for the application.
 *
 * @returns {Promise<IDBDatabase>} A promise that resolves to the opened database instance.
 */
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

/**
 * Stores the given items in the specified object store of the database.
 *
 * @param {string} storeName - The name of the object store.
 * @param {Iterable} items - The items to store.
 * @param {Function} transform - A function to transform each item before storage.
 * @param {IDBDatabase} database - The database instance.
 * @returns {Promise<void>} A promise that resolves when the items have been stored.
 * @throws {Error} If the database instance is undefined or if storing fails.
 */
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

/**
 * Parses the provided OSM XML data and stores the parsed nodes, ways, and relations in the database.
 *
 * @param {string} xmlString - The XML string representing OSM data.
 * @param {IDBDatabase} database - The database instance.
 * @returns {Promise<void>} A promise that resolves when parsing and storage are complete.
 * @throws {Error} If no XML data is provided or if parsing/storing fails.
 */
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
