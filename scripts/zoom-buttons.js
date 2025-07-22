/**
 * @fileoverview 
 * Zoom Buttons module for controlling the maps zoom in and zoom out functionalities.
 * 
 * The following script handles the zoom in and zoom out operations by updating the 
 * zoom level of the renderer, persisting it to localStorage, triggering a re-render of 
 * the map display, and enforcing predefined minimum and maximum zoom values.
 * 
 */

/**
 * The maximum zoom level allowed for the map.
 * @constant {number}
 */
const MAX_ZOOM_LEVEL = 6;

/**
 * The minimum zoom level allowed for the map.
 * @constant {number}
 */
const MIN_ZOOM_LEVEL = 0.4;

/**
 * The key used for storing the zoom level in localStorage.
 * @constant {string}
 */
const STORAGE_KEY_ZOOM_LEVEL = "zoomLevel";

/**
 * Updates the zoom level of the renderer sand triggers a re-render of the map.
 * 
 * Sets the zoom level of the renderer to the new value, persists the value in local 
 * storage, and then calls the render method of the renderer to update the map display.
 *
 * @private
 * @param {Object} renderer - The renderer object responsible for drawing the map.
 * @param {IDBDatabase} database - The IndexedDB database instance containing map data.
 * @param {number} newZoomLevel - The new zoom level to be applied.
 * @returns {void}
 */
function updateZoom(renderer, database, newZoomLevel) {
    renderer.zoomLevel = newZoomLevel;
    localStorage.setItem(STORAGE_KEY_ZOOM_LEVEL, renderer.zoomLevel);
    renderer.render(database, renderer.showNodes);
}

/**
 * Sets up the zoom in and zoom out button event listeners.
 * 
 * Attaches click event listeners to the provided zoom in and zoom out buttons that, when 
 * clicked, update the zoom level of the renderer by adding or subtracting the zoom step.
 *
 * @param {HTMLElement} zoomInBtn - The button element used to zoom in.
 * @param {HTMLElement} zoomOutBtn - The button element used to zoom out.
 * @param {Object} renderer - The renderer object that handles map rendering.
 * @param {IDBDatabase} database - The IndexedDB database instance containing map data.
 * @returns {void}
 */
export function setupZoomButtons(zoomInBtn, zoomOutBtn, renderer, database) {
    zoomInBtn.addEventListener("click", () => {
        const newZoomLevel = Math.min(renderer.zoomLevel + renderer.zoomStep, MAX_ZOOM_LEVEL);
        updateZoom(renderer, database, newZoomLevel);
    });

    zoomOutBtn.addEventListener("click", () => {
        const newZoomLevel = Math.max(renderer.zoomLevel - renderer.zoomStep, MIN_ZOOM_LEVEL);
        updateZoom(renderer, database, newZoomLevel);
    });
}
