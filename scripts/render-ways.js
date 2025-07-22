/**
 * @fileoverview
 * Rendering module for drawing the map element: ways on the canvas.
 * 
 * Handles the drawing of the ways through applying shared render rules imported from 
 * 'render-rules.js'. It defines functions to style the ways, render them on the canvas, 
 * and set up a toggle mechanism for showing or hiding the ways.
 */
import { renderRules } from './render-rules.js';

/**
 * Determines if a given set of nodes forms a closed path.
 *
 * @private
 * @param {Array<Object>} nodes - An array of node objects with x and y coordinates.
 * @returns {boolean} True if the first and last nodes have identical coordinates.
 */
const isPathClosed = (nodes) => {
    const { x: startX, y: startY } = nodes[0];
    const { x: endX, y: endY } = nodes[nodes.length - 1];
    return startX === endX && startY === endY;
};

/**
 * Draws map ways on the canvas.
 *
 * Iterates through an array of way objects, applies the appropriate render style 
 * based on shared rules, and renders the ways on the canvas context.
 *
 * @param {CanvasRenderingContext2D} ctx - The canvas 2D rendering context.
 * @param {number} canvasHeight - The height of the canvas.
 * @param {Array<Object>} ways - An array of way objects containing node references and tags.
 * @param {Map<string, Object>} nodesMap - A map where keys are node IDs and values are node objects with coordinates.
 */
export const drawWays = (ctx, canvasHeight, ways, nodesMap) => {
    const sortedWays = ways
        .map(way => ({ way, rule: getRenderRule(way) }))
        .sort((a, b) => (a.rule?.styles.zIndex ?? 0) - (b.rule?.styles.zIndex ?? 0));

    sortedWays.forEach(({ way, rule }) => {
        const nodes = way.nodes.map(ref => nodesMap.get(ref)).filter(Boolean);
        if (nodes.length < 2) return;

        const {
            strokeStyle = "#000",
            fillStyle = "",
            lineWidth = 1,
            shouldFill = false,
            hasCasing = false
        } = rule.styles;

        if (hasCasing) {
            ctx.beginPath();
            ctx.moveTo(nodes[0].x, canvasHeight - nodes[0].y);
            for (let i = 1; i < nodes.length; i++) {
                ctx.lineTo(nodes[i].x, canvasHeight - nodes[i].y);
            }
            ctx.lineWidth = lineWidth * 1.2;
            ctx.strokeStyle = rule.styles.casingStrokeStyle ?? "#333";
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.moveTo(nodes[0].x, canvasHeight - nodes[0].y);
        for (let i = 1; i < nodes.length; i++) {
            ctx.lineTo(nodes[i].x, canvasHeight - nodes[i].y);
        }

        if (shouldFill && isPathClosed(nodes)) {
            ctx.closePath();
            ctx.fillStyle = fillStyle;
            ctx.fill();
        }

        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeStyle;
        ctx.stroke();
    });
};

/**
 * Returns the first matching render rule for a given map element.
 *
 * @param {Object} element - The OSM element way to style.
 * @returns {Object} The matching render rule.
 */
function getRenderRule(element) {
    return renderRules.find(rule => rule.condition(element));
}

/**
 * Sets up the toggle functionality for displaying ways on the map.
 *
 * Binds a click event to the provided toggle button to switch the display of ways on or off.
 * The current state is stored in localStorage, and the renderer is updated accordingly.
 *
 * @param {HTMLElement} toggleBtn - The button element used to toggle way visibility.
 * @param {Object} renderer - The map renderer instance.
 * @param {IDBDatabase} database - The IndexedDB database instance.
 */
export const setupToggleWays = (toggleBtn, renderer, database) => {
    const storedValue = localStorage.getItem("showWays");
    renderer.showWays = storedValue ? storedValue === "true" : true;

    updateToggleButton(toggleBtn, renderer.showWays, "Ways");
    renderer.render(database, renderer.showNodes);

    toggleBtn.addEventListener("click", () => {
        renderer.showWays = !renderer.showWays;
        localStorage.setItem("showWays", renderer.showWays);
        updateToggleButton(toggleBtn, renderer.showWays, "Ways");
        renderer.render(database, renderer.showNodes);
    });
};

/**
 * Updates the toggle button appearance based on its active state.
 *
 * @private
 * @param {HTMLElement} button - The toggle button element.
 * @param {boolean} isActive - The current active state.
 * @param {string} label - The label used to update the button text.
 */
const updateToggleButton = (button, isActive, label) => {
    button.textContent = isActive ? `Hide ${label}` : `Show ${label}`;
    button.classList.toggle("active", isActive);
};
