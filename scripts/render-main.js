/**
 * @fileoverview 
 * Main rendering module for translating OSM map data into a visual format.
 * 
 * The following script handles the fetching, processing, and drawing of the OpenStreetMap 
 * data elements, specifically the: nodes, ways, and relations, onto the canvas element 
 * while also updating the UI element counts, managing rendering state, and caching. 
 */

import { drawWays } from './render-ways.js';
import { drawNodes } from './render-nodes.js';
import { renderRules } from './render-rules.js';
import { drawRelations } from './render-relations.js';
import { logMessage, MessageScope, MessageOutput } from './log-message.js';

/**
 * Calculates the bounding coordinates for a collection of nodes.
 *
 * Converts node latitude values using the Mercator projection and determines 
 * the minimum and maximum latitudes and longitudes.
 *
 * @param {Array<Object>} nodes - An array of node objects.
 * @returns {{minLat: number, maxLat: number, minLon: number, maxLon: number}} The computed bounding box.
 */
export function calculateBounds(nodes) {
    const latitudes = nodes.map(node => node.lat);
    const longitudes = nodes.map(node => node.lon);
    return {
        minLat: Math.min(...latitudes),
        maxLat: Math.max(...latitudes),
        minLon: Math.min(...longitudes),
        maxLon: Math.max(...longitudes)
    };
}

/**
 * Updates the on-screen counts of the elements: nodes, ways, and relations.
 *
 * Formats the counts as zero-padded strings with greyed leading zeros 
 * and updates the corresponding DOM elements.
 *
 * @private
 * @param {number} nodesCount - The number of nodes stored in the IndexedDB database.
 * @param {number} waysCount - The number of ways stored in the IndexedDB database.
 * @param {number} relationsCount - The number of relations stored in the IndexedDB database.
 * @returns {void}
 */
function updateCounts(nodesCount, waysCount, relationsCount) {
    const formatCount = count => {
        const string = count.toString().padStart(12, '0');
        const significantStart = string.search(/[1-9]/);
        const greyedZeros = significantStart === -1 ? 12 : significantStart;
        return `<span class="grey">${string.slice(0, greyedZeros)}</span>${string.slice(greyedZeros)}`;
    };

    const nodesCountElement = document.getElementById("nodesCount");
    if (nodesCountElement) nodesCountElement.innerHTML = formatCount(nodesCount);

    const waysCountElement = document.getElementById("waysCount");
    if (waysCountElement) waysCountElement.innerHTML = formatCount(waysCount);

    const relationsCountElement = document.getElementById("relationsCount");
    if (relationsCountElement) relationsCountElement.innerHTML = formatCount(relationsCount);
}

/**
 * Retrieves all records from a specified object store in the IndexedDB databse.
 *
 * Opens a read-only transaction for the given store and returns a promise 
 * that resolves swith all records.
 *
 * @private
 * @param {string} storeName - The name of the object store.
 * @param {IDBDatabase} database - The IndexedDB database instance.
 * @returns {Promise<Array>} A promise resolving to an array of records from the store.
 */
function getObjectStoreData(storeName, database) {
    return new Promise((resolve, reject) => {
        const request = database.transaction([storeName], "readonly")
            .objectStore(storeName)
            .getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Class representing the map renderer.
 *
 * Manages the canvas rendering of map data; handles data fetching from IndexedDB, 
 * coordinate transformation, and a continuous render loop to update the display.
 */
export class MapRenderer {
    /**
     * Creates an instance of MapRenderer.
     *
     * Initialises the canvas context, rendering parameters, caching flags, and display toggles.
     *
     * @param {HTMLCanvasElement} canvas - The canvas element used for rendering the map.
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.ctx.lineWidth = 1;

        this.offsetX = 0;
        this.offsetY = 0;
        this.currentOffsetX = 0;
        this.currentOffsetY = 0;

        this.zoomLevel = 1;
        this.zoomStep = 0.5;

        this.needsRender = false;
        this.isRendering = false;
        this.cacheReady = false;
        this.database = null;

        this.cachedWays = [];
        this.cachedNodes = [];
        this.cachedRelations = [];

        this.showWays = true;
        this.showNodes = false;
        this.showRelations = true;
    }

    /**
     * Clears the canvas.
     *
     * Removes all rendered content from the canvas by clearing its entire drawing context.
     *
     * @returns {void}
     */
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Fetches and caches map data from IndexedDB.
     *
     * Retrieves nodes, ways, and relations from their respective object stores and 
     * updates the internal cache. Logs any errors encountered during the process.
     *
     * @param {IDBDatabase} database - The IndexedDB database instance.
     * @returns {Promise<void>} A promise that resolves when data fetching is complete.
     * @throws {Error} Any errors encountered during data retrieval.
     */
    async fetchData(database) {
        try {
            const [nodes, ways, relations] = await Promise.all([
                getObjectStoreData("nodes", database),
                getObjectStoreData("ways", database),
                getObjectStoreData("relations", database)
            ]);
            this.cachedNodes = nodes;
            this.cachedWays = ways;
            this.cachedRelations = relations;

            this.cacheReady = true;
        } catch (error) {
            logMessage(MessageScope.RENDERER_MAIN, MessageOutput.CONSOLE, `Error fetching data: ${error}`);
            throw error;
        }
    }

    /**
     * Builds a mapping from node IDs to their canvas coordinates.
     *
     * Converts geographic coordinates to canvas positions using normalisation 
     * and applies zoom and pan transformations.
     *
     * @param {Array<Object>} nodes - An array of node objects with 'lat', 'lon', and 'tags'.
     * @param {{minLat: number, maxLat: number, minLon: number, maxLon: number}} bounds - The bounding box for the nodes.
     * @returns {Map<string, Object>} A map where each key is a node ID and the value 
     * is an object containing canvas x, y coordinates and node properties.
     */
    buildNodesMap(nodes) {
        const nodesMap = new Map();

        const latitudes = nodes.map(node => node.lat).sort((latA, latB) => latA - latB);
        const longitudes = nodes.map(node => node.lon).sort((lonA, lonB) => lonA - lonB);

        const trimPercentage = 0.02;
        const startIndex = Math.floor(trimPercentage * latitudes.length);
        const endIndex = Math.ceil((1 - trimPercentage) * latitudes.length);

        const minLat = latitudes[startIndex];
        const maxLat = latitudes[endIndex - 1];

        const minLon = longitudes[startIndex];
        const maxLon = longitudes[endIndex - 1];

        const boundingBoxWidth = maxLon - minLon;
        const boundingBoxHeight = maxLat - minLat;

        const canvasCenterX = this.canvas.width / 2;
        const canvasCenterY = this.canvas.height / 2;

        const scale = Math.min(
            this.canvas.width / boundingBoxWidth,
            this.canvas.height / boundingBoxHeight
        ) * this.zoomLevel;

        const midLon = (minLon + maxLon) / 2;
        const midLat = (minLat + maxLat) / 2;

        nodes.forEach(node => {
            const xCoordinate = ((node.lon - midLon) * scale) + canvasCenterX + this.currentOffsetX;
            const yCoordinate = ((node.lat - midLat) * scale * 1.6) + canvasCenterY + this.currentOffsetY;

            nodesMap.set(node.id, { x: xCoordinate, y: yCoordinate, id: node.id, tags: node.tags });
        });
        return nodesMap;
    }

    /**
     * Renders the map on the canvas.
     *
     * If the data cache is not ready, fetches data from IndexedDB first. Then updates UI 
     * counts, clears the canvas, and draws relations, ways, and nodes based on current 
     * display toggles.
     *
     * @param {IDBDatabase} database - The IndexedDB database instance.
     * @returns {Promise<void>} A promise that resolves when rendering is complete.
     */
    async render(database) {
        if (!database) {
            logMessage(MessageScope.RENDERER_MAIN, MessageOutput.CONSOLE, "Database not initialised");
            return;
        }

        if (!this.cacheReady) {
            this.isRendering = true;
            await this.fetchData(database);
            this.isRendering = false;
        }

        const nodes = this.cachedNodes;
        const ways = this.cachedWays;
        const relations = this.cachedRelations;

        updateCounts(nodes.length, ways.length, relations.length);
        this.clear();

        try {
            const bounds = calculateBounds(nodes);
            const nodesMap = this.buildNodesMap(nodes, bounds);
            const canvasNodes = Array.from(nodesMap.values());

            const getRenderRule = (element) => renderRules.find(rule => rule.condition(element));

            for (let zIndex = 1; zIndex <= 4; zIndex++) {
                if (this.showRelations) {
                    const relationsAtZIndex = relations.filter(relation => getRenderRule(relation)?.styles.zIndex === zIndex);
                    drawRelations(this.ctx, this.canvas.height, relationsAtZIndex, ways, nodesMap);
                }
                if (this.showWays) {
                    const waysAtZIndex = ways.filter(way => getRenderRule(way)?.styles.zIndex === zIndex);
                    drawWays(this.ctx, this.canvas.height, waysAtZIndex, nodesMap);
                }
            }

            if (this.showNodes) {
                drawNodes(this.ctx, this.canvas, canvasNodes, this.zoomLevel);
            }
        } catch (error) {
            logMessage(MessageScope.RENDERER_MAIN, MessageOutput.CONSOLE, `Error rendering canvas: ${error}`);
        }
    }

    /**
     * Starts the continuous render loop.
     *
     * Uses requestAnimationFrame to check if a render is needed and not already 
     * in progress, then triggers rendering and schedules the next frame.
     *
     * @returns {void}
     */
    startRenderLoop() {
        const renderFrame = () => {
            if (this.needsRender && !this.isRendering) {
                this.isRendering = true;
                this.render(this.database).finally(() => {
                    this.isRendering = false;
                });
                this.needsRender = false;
            }
            requestAnimationFrame(renderFrame);
        };
        requestAnimationFrame(renderFrame);
    }
}
