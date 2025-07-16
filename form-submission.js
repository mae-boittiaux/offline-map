import { parseAndStoreOSMData } from './indexedDB.js';
import { validateInputs } from './input-validation.js';
import { logMessage, MessageScope, MessageOutput } from './log-message.js';

function extractBoundingBox(fields) {
    return {
        minLon: parseFloat(fields.minLon.value),
        minLat: parseFloat(fields.minLat.value),
        maxLon: parseFloat(fields.maxLon.value),
        maxLat: parseFloat(fields.maxLat.value)
    };
}

export function setupFormSubmission(form, status, database, toggleRender, inputFields, renderer) {
    form.onsubmit = handleFormSubmit;

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

function buildUrl(minLon, minLat, maxLon, maxLat) {
    return `https://api.openstreetmap.org/api/0.6/map?bbox=${minLon},${minLat},${maxLon},${maxLat}`;
}

function resetRendererCache(renderer) {
    renderer.cachedWays = [];
    renderer.cachedNodes = [];
    renderer.cachedRelations = [];
    renderer.cacheReady = false;
}

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
