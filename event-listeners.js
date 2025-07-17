import { setupPanning } from './mouse-events.js';
import { setupToggleWays } from './render-ways.js';
import { setupToggleNodes } from './render-nodes.js';
import { setupZoomButtons } from './zoom-buttons.js';
import { setupClearDataButton } from './clear-data.js';
import { setupFormSubmission } from './form-submission.js';
import { setupToggleRelations } from './render-relations.js';

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

function setupUIControls(elements, renderer, database) {
    setupToggleWays(elements.toggleWaysBtn, renderer, database);
    setupToggleNodes(elements.toggleNodesBtn, renderer, database);
    setupClearDataButton(elements.clearDataBtn, database, renderer);
    setupToggleRelations(elements.toggleRelationsBtn, renderer, database);
    setupZoomButtons(elements.zoomInBtn, elements.zoomOutBtn, renderer, database);
}

function cacheElements(selectors) {
    const elements = {};
    for (const key in selectors) {
        elements[key] = document.querySelector(selectors[key]);
    }

    return elements;
}

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
