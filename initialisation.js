import { openDatabase } from './indexedDB.js';
import { MapRenderer } from './render-main.js';
import { setupEventListeners } from './event-listeners.js';
import { logMessage, MessageScope, MessageOutput } from './log-message.js';

const CANVAS_ID = "osmCanvas";

export function initialiseRenderer(canvas) {
    return new MapRenderer(canvas);
}

export function initialiseDatabase() {
    return openDatabase();
}

export function initialiseUI() {
    const canvas = initialiseCanvas();
    const renderer = initialiseRenderer(canvas);

    renderer.startRenderLoop();
    return renderer;
}

export function initialiseCanvas() {
    const canvas = document.getElementById(CANVAS_ID);

    if (!canvas) {
        logMessage(MessageScope.INITIALISATION, MessageOutput.CONSOLE, "Canvas element not found");
        throw new Error("Canvas element not found");
    }
    return canvas;
}

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
