/**
 * @fileoverview
 * Rendering module for drawing map element: relations on the canvas.
 * 
 * Handles the drawing of the map relations by applying shared render rules imported from 
 * 'render-rules.js'. It processes the members of each relation, specifically ways, and 
 * renders them on the canvas using the defined style rules.
 */
import { renderRules } from './render-rules.js';

/**
 * Applies render rules to a relation to determine its drawing style.
 *
 * @private
 * @param {CanvasRenderingContext2D} ctx - The 2D rendering context of the canvas.
 * @param {Object} relation - The relation object containing tags and member references.
 * @returns {boolean} True if the corresponding way of the relation should be filled based on the render rule.
 */
const applyRelationStyles = (ctx, relation) => {
    const rule = renderRules.find(rule => rule.condition(relation));
    ctx.lineWidth = rule.styles.lineWidth ?? 1;
    ctx.fillStyle = rule.styles.fillStyle;
    ctx.strokeStyle = rule.styles.strokeStyle;
    return rule.styles.shouldFill;
};

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
 * Draws map relations on the canvas.
 *
 * Iterates over an array of relation objects, and for each relation, iterates over its 
 * members. For way-type members, it retrieves the corresponding way, computes its node 
 * coordinates from the nodes map, and draws the way on the canvas. Depending on the 
 * render rule, it either fills or outlines the way if the nodes form a closed path.
 *
 * @param {CanvasRenderingContext2D} ctx - The canvas 2D rendering context.
 * @param {number} canvasHeight - The height of the canvas.
 * @param {Array<Object>} relations - An array of relation objects containing members and tags.
 * @param {Array<Object>} ways - An array of way objects containing node references and tags.
 * @param {Map<string, Object>} nodesMap - A map where keys are node IDs and values are node objects with coordinates.
 */
export const drawRelations = (ctx, canvasHeight, relations, ways, nodesMap) => {
    const sortedRelations = relations
        .map(relation => ({ relation, rule: getRenderRule(relation) }))
        .sort((a, b) => (a.rule?.styles.zIndex ?? 0) - (b.rule?.styles.zIndex ?? 0));

    sortedRelations.forEach(({ relation }) => {
        const shouldFill = applyRelationStyles(ctx, relation);

        relation.members.forEach((member) => {
            if (member.type !== "way") return;

            const way = ways.find((w) => w.id === member.ref);
            if (!way) return;

            const wayNodes = way.nodes.map((ref) => nodesMap.get(ref)).filter(Boolean);
            if (wayNodes.length < 2) return;

            ctx.beginPath();
            ctx.moveTo(wayNodes[0].x, canvasHeight - wayNodes[0].y);
            for (let i = 1; i < wayNodes.length; i++) {
                ctx.lineTo(wayNodes[i].x, canvasHeight - wayNodes[i].y);
            }

            if (shouldFill && isPathClosed(wayNodes)) {
                ctx.closePath();
                ctx.fill();
            }
            ctx.stroke();
        });
    });
};

/**
 * Returns the first matching render rule for a given map element.
 *
 * @param {Object} element - The relation to style.
 * @returns {Object} The matching render rule.
 */
function getRenderRule(element) {
    return renderRules.find(rule => rule.condition(element));
}

/**
 * Updates the toggle button text and active state for relation visibility.
 *
 * @private
 * @param {HTMLElement} button - The toggle button element.
 * @param {boolean} isActive - True if relations are currently visible.
 * @param {string} label - The label to be used in the button text.
 */
function updateToggleButton(button, isActive, label) {
    button.textContent = isActive ? `Hide ${label}` : `Show ${label}`;
    button.classList.toggle("active", isActive);
}

/**
 * Sets up the toggle functionality for displaying map relations.
 *
 * Binds a click event to the provided toggle button to switch the visibility of relations.
 * The current visibility state is stored in localStorage and the renderer is updated accordingly.
 *
 * @param {HTMLElement} toggleBtn - The button element used to toggle relation visibility.
 * @param {Object} renderer - The map renderer instance.
 * @param {IDBDatabase} database - The IndexedDB database instance.
 */
export const setupToggleRelations = (toggleBtn, renderer, database) => {
    const stored = localStorage.getItem("showRelations");
    renderer.showRelations = stored ? stored === "true" : true;
    updateToggleButton(toggleBtn, renderer.showRelations, "Relations");
    renderer.render(database, renderer.showNodes);

    toggleBtn.addEventListener("click", () => {
        renderer.showRelations = !renderer.showRelations;
        localStorage.setItem("showRelations", renderer.showRelations);
        updateToggleButton(toggleBtn, renderer.showRelations, "Relations");
        renderer.render(database, renderer.showNodes);
    });
};
