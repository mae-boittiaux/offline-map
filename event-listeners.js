/**
 * @fileoverview 
 * Event Listeners module for user interface interaction binding.
 * 
 * This module configures all of the event-driven functionalities, including map 
 * interaction, input validation, form submission, and data control in order to ensure 
 * that the user interface elements and the canvas are responsive and state-aware.
 * 
 */

import { setupPanning } from './mouse-events.js';
import { setupToggleWays } from './render-ways.js';
import { setupToggleNodes } from './render-nodes.js';
import { setupZoomButtons } from './zoom-buttons.js';
import { setupClearDataButton } from './clear-data.js';
import { setupFormSubmission } from './form-submission.js';
import { setupToggleRelations } from './render-relations.js';

/**
 * Sets up all of the event listeners for the UI components.
 *
 * This function is called during initialisation to bind the relevant canvas and 
 * interface controls to their associated behaviours.
 *
 * @param {MapRenderer} renderer - The canvas renderer instance responsible for drawing.
 * @param {IDBDatabase} database - The IndexedDB instance containing the map data.
 * @returns {void}
 */
export function setupEventListeners(renderer, database) {
    const canvas = renderer.canvas;

    const elements = cacheElements({
        // Form and status
        form: "#lon-lat-form",
        status: "#status",
        minLon: "#min-lon",
        minLat: "#min-lat",
        maxLon: "#max-lon",
        maxLat: "#max-lat",

        // UI Buttons
        zoomInBtn: "#zoomIn",
        zoomOutBtn: "#zoomOut",
        clearDataBtn: "#clearData",
        toggleWaysBtn: "#toggleWays",
        toggleNodesBtn: "#toggleNodes",
        toggleRelationsBtn: "#toggleRelations",
        randomBoundingBoxBtn: "#randomBoundingBox"
    });

    setupPanning(canvas, renderer);
    setupForm(elements, renderer, database);
    setupUIControls(elements, renderer, database);
    setupRandomButton(elements.randomBoundingBoxBtn, {
        minLon: elements.minLon,
        minLat: elements.minLat,
        maxLon: elements.maxLon,
        maxLat: elements.maxLat
    });
}

/**
 * Sets up the input form submission event handler.
 * 
 * Configures the bounding box form to load OSM data by binding the submit event, 
 * validating inputs, fetching OSM XML, and triggering parsing, storage, and re-rendering.
 *
 * @param {Object<string, HTMLElement>} elements - Cached DOM elements used in the form.
 * @param {MapRenderer} renderer - The canvas renderer used to render map elements.
 * @param {IDBDatabase} database - The database instance used to store parsed OSM data.
 * @returns {void}
 */
function setupForm(elements, renderer, database) {
    const toggleRender = () => renderer.render(database, renderer.showNodes);
    const inputFields = {
        minLon: elements.minLon,
        minLat: elements.minLat,
        maxLon: elements.maxLon,
        maxLat: elements.maxLat
    };

    setupFormSubmission(elements.form, elements.status, database, toggleRender, inputFields, renderer);
}

/**
 * Sets up UI control buttons for node toggling, zoom operations, and clearing data.
 * 
 * Connects the provided buttons to their handlers, allowing the user to manipulate the map
 * view and data. Each control interacts with both the renderer and data store as needed.
 *
 * @param {Object<string, HTMLElement>} elements - The cached UI control elements.
 * @param {MapRenderer} renderer - The canvas renderer instance.
 * @param {IDBDatabase} database - The IndexedDB instance.
 * @returns {void}
 */
function setupUIControls(elements, renderer, database) {
    setupToggleWays(elements.toggleWaysBtn, renderer, database);
    setupToggleNodes(elements.toggleNodesBtn, renderer, database);
    setupClearDataButton(elements.clearDataBtn, database, renderer);
    setupToggleRelations(elements.toggleRelationsBtn, renderer, database);
    setupZoomButtons(elements.zoomInBtn, elements.zoomOutBtn, renderer, database);
}

/**
 * Caches DOM elements based on a selector map for efficient retrieval.
 * 
 * Accepts a mapping of logical keys to CSS selectors, queries the DOM, and returns an object
 * of matched elements. Acts as a centralised reference to streamline element handling.
 *
 * @param {Object<string, string>} selectors - A map of keys to CSS selector strings.
 * @returns {Object<string, HTMLElement>} - An object of queried DOM elements keyed by name.
 */
function cacheElements(selectors) {
    const elements = {};
    for (const key in selectors) {
        elements[key] = document.querySelector(selectors[key]);
    }

    return elements;
}

/**
 * Sets up the event handler for the "Random" bounding box button.
 * 
 * Configures the random bounding box button to populate the input fields with one of 
 * several predefined coordinate sets. Each option is used once per cycle; once all have 
 * been used, the list resets and starts again.
 *
 * @param {HTMLButtonElement} button - The DOM button element that triggers the action.
 * @param {Object<string, HTMLInputElement>} fields - An object containing the input fields. 
 * @returns {void}
 */
function setupRandomButton(button, fields) {
    const originalOptions = [
        { minLon: -0.7780766, minLat: 52.0379866, maxLon: -0.7422423, maxLat: 52.0503396 },
        { minLon: -0.5227089, minLat: 51.4826925, maxLon: -0.4510403, maxLat: 51.5077007 },
        { minLon: -0.5784988, minLat: 51.3882804, maxLon: -0.5068302, maxLat: 51.4133404 },
        { minLon: -0.1740432, minLat: 51.5213613, maxLon: -0.1382089, maxLat: 51.5338566 },
        { minLon: -2.5979018, minLat: 51.4221724, maxLon: -2.5620675, maxLat: 51.4346948 },
        { minLon: -3.2200022, minLat: 55.9513507, maxLon: -3.2000002, maxLat: 55.9599726 },
    ];
    let tempOptions = [...originalOptions];

    button.addEventListener("click", () => {
        if (tempOptions.length === 0) {
            tempOptions = [...originalOptions];
        }

        const index = Math.floor(Math.random() * tempOptions.length);
        const selected = tempOptions.splice(index, 1)[0];

        fields.minLon.value = selected.minLon;
        fields.minLat.value = selected.minLat;
        fields.maxLon.value = selected.maxLon;
        fields.maxLat.value = selected.maxLat;
    });
}
