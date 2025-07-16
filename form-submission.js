/**
 * @fileoverview
 * Form Submission module for handling OSM bounding box input and data loading.
 * 
 * Configures the form submission handler responsible for fetching OSM XML data based on 
 * user-provided coordinate bounds. It validates input, constructs the API request, parses
 * and stores the result, and triggers a canvas re-render to display the updated data.
 */
import { parseAndStoreOSMData } from './indexedDB.js';
import { validateInputs } from './input-validation.js';
import { logMessage, MessageScope, MessageOutput } from './log-message.js';

/**
 * Extracts bounding box coordinate values from the input fields.
 * 
 * Reads and parses the numerical values from the input elements representing
 * the minimum and maximum longitude and latitude.
 *
 * @param {Object<string, HTMLInputElement>} fields - Input field elements keyed by coordinate type.
 * @returns {{minLon: number, minLat: number, maxLon: number, maxLat: number}} The parsed coordinate values.
 */
function extractBoundingBox(fields) {
    return {
        minLon: parseFloat(fields.minLon.value),
        minLat: parseFloat(fields.minLat.value),
        maxLon: parseFloat(fields.maxLon.value),
        maxLat: parseFloat(fields.maxLat.value)
    };
}

/**
 * Sets up the event handler for form submission.
 * 
 * Handles form submission by validating input, loading OSM data, updating storage
 * and cache, and triggering re-rendering.
 * 
 * @param {HTMLFormElement} form - The form element to bind the submission event to.
 * @param {HTMLElement} status - The DOM element where status messages are displayed.
 * @param {IDBDatabase} database - The IndexedDB instance for data storage.
 * @param {Function} toggleRender - Callback to trigger a canvas render after loading.
 * @param {Object<string, HTMLInputElement>} inputFields - Input elements for bounding box values.
 * @param {Object} renderer - The canvas renderer instance for map rendering.
 */
export function setupFormSubmission(form, status, database, toggleRender, inputFields, renderer) {
    form.onsubmit = handleFormSubmit;

    /**
     * Handles the submit event for the bounding box form.
     * 
     * Validates the inputs, builds the request URL, loads the OSM XML, resets the renderer 
     * cache, applies default toggle selection if needed, and triggers re-rendering.
     *
     * @private
     * @param {SubmitEvent} event - The submit event triggered by the form.
     */
    async function handleFormSubmit(event) {
        event.preventDefault();

        if (renderer.cachedNodes.length > 0 || renderer.cachedWays.length > 0 || renderer.cachedRelations.length > 0) {
            const message = "Clear the current map before loading a new one";
            logMessage(MessageScope.FORM, MessageOutput.BOTH, message);
            return;
        }

        const { minLon, minLat, maxLon, maxLat } = extractBoundingBox(inputFields);

        const fields = {
            minLon: inputFields.minLon,
            minLat: inputFields.minLat,
            maxLon: inputFields.maxLon,
            maxLat: inputFields.maxLat
        };

        if (!validateInputs(minLon, minLat, maxLon, maxLat, status, fields)) return;

        logMessage(MessageScope.FORM, MessageOutput.STATUS, "Loading data ..");

        const url = buildUrl(minLon, minLat, maxLon, maxLat);

        try {
            await fetchAndStoreOsmData(url, database);

            resetRendererCache(renderer);
            autoSelectDefaultToggles(renderer);

            renderer.zoomLevel = 2.0;
            renderer.offsetX = 0;
            renderer.offsetY = 0;
            renderer.currentOffsetX = 0;
            renderer.currentOffsetY = 0;

            localStorage.setItem("zoomLevel", "2.0");
            localStorage.setItem("offsetX", "0");
            localStorage.setItem("offsetY", "0");

            logMessage(MessageScope.FORM, MessageOutput.BOTH, "Data loaded successfully");
            toggleRender();
        } catch (error) {
            logMessage(MessageScope.FORM, MessageOutput.BOTH, `Error loading data: ${error.message}`);
        }
    }
}

/**
 * Helper function to auto-select default toggles for ways and relations.
 * 
 * If none of the toggles (nodes, ways, and relations) are active, it sets the ways 
 * and relations toggles to active, updates localStorage, and updates the UI buttons.
 *
 * @param {Object} renderer - The canvas renderer instance.
 */
function autoSelectDefaultToggles(renderer) {
    if (!renderer.showNodes && !renderer.showWays && !renderer.showRelations) {
        renderer.showWays = true;
        renderer.showRelations = true;
        localStorage.setItem("showWays", "true");
        localStorage.setItem("showRelations", "true");

        const toggleWaysBtn = document.getElementById("toggleWays");
        if (toggleWaysBtn) {
            toggleWaysBtn.textContent = "Hide Ways";
            toggleWaysBtn.classList.add("active");
        }

        const toggleRelationsBtn = document.getElementById("toggleRelations");
        if (toggleRelationsBtn) {
            toggleRelationsBtn.textContent = "Hide Relations";
            toggleRelationsBtn.classList.add("active");
        }
    }
}

/**
 * Constructs the OpenStreetMap API URL from bounding box coordinates.
 * 
 * Builds a request string for the `/api/0.6/map` endpoint using the specified
 * minimum and maximum longitude and latitude values.
 *
 * @param {number} minLon - Minimum longitude.
 * @param {number} minLat - Minimum latitude.
 * @param {number} maxLon - Maximum longitude.
 * @param {number} maxLat - Maximum latitude.
 * @returns {string} The fully constructed API request URL.
 */
function buildUrl(minLon, minLat, maxLon, maxLat) {
    return `https://api.openstreetmap.org/api/0.6/map?bbox=${minLon},${minLat},${maxLon},${maxLat}`;
}

/**
 * Resets the internal cache of the renderer of OSM elements.
 * 
 * Clears the in-memory arrays of nodes, ways, and relations, and resets the 
 * cache-ready flag to indicate new data must be loaded before rendering.
 *
 * @param {Object} renderer - The renderer instance whose cache should be reset.
 */
function resetRendererCache(renderer) {
    renderer.cachedWays = [];
    renderer.cachedNodes = [];
    renderer.cachedRelations = [];
    renderer.cacheReady = false;
}

/**
 * Fetches OSM XML data from the specified URL and stores it in IndexedDB.
 * 
 * Performs a fetch call to the given URL, converts the response to text, and passes
 * it to the OSM parser and storage handler. Logs any errors encountered.
 *
 * @param {string} url - The OSM API URL to fetch.
 * @param {IDBDatabase} database - The database instance for storing parsed data.
 * @throws {Error} If the network response is not OK or data processing fails.
 */
async function fetchAndStoreOsmData(url, database) {
    logMessage(MessageScope.FORM, MessageOutput.CONSOLE, "Fetching OSM XML data");

    const response = await fetch(url);
    if (!response.ok) {
        logMessage(MessageScope.FORM, MessageOutput.CONSOLE, `${response.status}`);
        throw new Error(response.status);
    }

    const data = await response.text();
    await parseAndStoreOSMData(data, database);
}
