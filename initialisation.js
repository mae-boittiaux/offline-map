/**
 * @fileoverview 
 * Initialisation implementation used within the main module.
 *
 * This module provides the functionality for setting-up the core components of the 
 * application, and setting-up the event listeners for the user interactions.  The 
 * initialiseApp() function combines these functions to boot the application.
 */

import { openDatabase } from './indexedDB.js';
import { MapRenderer } from './render-main.js';
import { setupEventListeners } from './event-listeners.js';
import { logMessage, MessageScope, MessageOutput } from './log-message.js';

/**
 * The ID of the canvas element used for rendering the map.
 * @constant {string}
 */
const CANVAS_ID = "osmCanvas";

/**
 * Creates and returns an instance of MapRenderer for the provided canvas element.
 *
 * @param {HTMLCanvasElement} canvas - The canvas element used for rendering the map.
 * @returns {MapRenderer} An instance of MapRenderer.
 */
export function initialiseRenderer(canvas) {
    return new MapRenderer(canvas);
}

/**
 * Opens the IndexedDB database for the application.
 *
 * @returns {Promise<IDBDatabase>} A promise that resolves to the IndexedDB database instance.
 */
export function initialiseDatabase() {
    return openDatabase();
}

/**
 * Initialises the user interface components by setting up the canvas and renderer.
 *
 * @returns {MapRenderer} An instance of MapRenderer with an active render loop.
 */
export function initialiseUI() {
    const canvas = initialiseCanvas();
    const renderer = initialiseRenderer(canvas);

    renderer.startRenderLoop();
    return renderer;
}

/**
 * Retrieves the canvas element from the DOM using the predefined CANVAS_ID.
 *
 * @returns {HTMLCanvasElement} The canvas element used for map rendering.
 * @throws {Error} If the canvas element is not found in the DOM.
 */
export function initialiseCanvas() {
    const canvas = document.getElementById(CANVAS_ID);

    if (!canvas) {
        logMessage(MessageScope.INITIALISATION, MessageOutput.CONSOLE, "Canvas element not found");
        throw new Error("Canvas element not found");
    }
    return canvas;
}

/**
 * Restores the canvas state: zoom level and pan offsets from localStorage, if available.
 *
 * @param {MapRenderer} renderer - The instance of MapRenderer to update.
 */
function restoreCanvasState(renderer) {
    const savedZoom = localStorage.getItem("zoomLevel");

    if (savedZoom !== null) {
        logMessage(MessageScope.INITIALISATION, MessageOutput.CONSOLE, `Restored zoom level: ${savedZoom}`);
        renderer.zoomLevel = parseFloat(savedZoom);
    } else {
        renderer.zoomLevel = 2.0;
    }

    const savedOffsetX = localStorage.getItem("offsetX");
    const savedOffsetY = localStorage.getItem("offsetY");

    if (savedOffsetX !== null) {
        renderer.offsetX = parseFloat(savedOffsetX);
        renderer.currentOffsetX = parseFloat(savedOffsetX);
    }
    if (savedOffsetY !== null) {
        renderer.offsetY = parseFloat(savedOffsetY);
        renderer.currentOffsetY = parseFloat(savedOffsetY);
    }
}

/**
 * Initialises the application by setting up the UI, database, and event listeners.
 *
 * @async
 * @returns {Promise<{renderer: MapRenderer, database: IDBDatabase} | null>}
 *  A promise that resolves to an object with the renderer and database, 
 *  or null if initialisation fails.
 */
export async function initialiseApp() {
    try {
        const renderer = initialiseUI();
        const database = await initialiseDatabase();

        renderer.database = database;

        restoreCanvasState(renderer);
        setupEventListeners(renderer, database);

        renderer.render(database, false);

        logMessage(MessageScope.INITIALISATION, MessageOutput.CONSOLE, "Application initialised successfully");
        return { renderer, database };
    } catch (error) {
        logMessage(MessageScope.INITIALISATION, MessageOutput.CONSOLE, `Initialisation error: ${error}`);
        return null;
    }
}
