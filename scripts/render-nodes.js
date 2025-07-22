/**
 * @fileoverview 
 * Show Nodes module for rendering map nodes on the canvas and toggling their display.
 * 
 * The following script provides the functionality to draw all of the nodes as small arcs 
 * on the canvas, and to setup a toggle button to either show or hide the nodes.  Drawing
 * parameters are calculated based on the current zoom level and canvas dimensions.
 * 
 */

/**
 * The default radius for drawing the nodes on the canvas.
 * @constant {number}
 * @default 1
 */
const NODE_RADIUS = 1;

/**
 * The stroke colour used for drawing the nodes.
 * @constant {string}
 * @default "#399cc6"
 */
const NODE_COLOUR = "#399cc6";

/**
 * Calculates the parameters of the arc for a given node to be drawn on the canvas.
 * 
 * Converts the coordinates of the node into canvas coordinates by inverting the y-axis,
 * scales the radius of the node according to the current zoom level.
 *
 * @private
 * @param {Object} node - The node object containing the x and y coordinates.
 * @param {HTMLCanvasElement} canvas - The canvas element used for drawing logic.
 * @param {number} zoomLevel - The current zoom level to scale the node radius.
 * @returns {{x: number, y: number, radius: number, startAngle: number, endAngle: number}}
 *  An object containing the x and y coordinates, the scaled radius, and the start 
 *  and end angles for the arc.
 */
const calculateArcParameters = (node, canvas, zoomLevel) => {
    const x = node.x;
    const y = canvas.height - node.y;
    const radius = NODE_RADIUS * zoomLevel;
    return { x, y, radius, startAngle: 0, endAngle: Math.PI * 2 };
};

/**
 * Draws the nodes on the canvas.
 * 
 * Iterates over an array of node objects, calculates the appropriate arc parameters for 
 * each node based on the current zoom level and canvas dimensions, and draws each node.
 *
 * @param {CanvasRenderingContext2D} ctx - The 2D rendering context of the canvas element.
 * @param {HTMLCanvasElement} canvas - The canvas element where the nodes are drawn.
 * @param {Array<Object>} nodes - An array of node objects for x and y coordinates.
 * @param {number} zoomLevel - The zoom level used to scale the node sizes.
 */
export const drawNodes = (ctx, canvas, nodes, zoomLevel) => {
    ctx.strokeStyle = NODE_COLOUR;

    nodes.forEach(node => {
        const { x, y, radius, startAngle, endAngle } = calculateArcParameters(node, canvas, zoomLevel);
        ctx.beginPath();
        ctx.arc(x, y, radius, startAngle, endAngle);
        ctx.stroke();
    });
};

/**
 * Sets up the toggle functionality for displaying the nodes on the canvas.
 * 
 * Configures a toggle button to switch node display on or off, reads initial state from 
 * localStorage, updates the showNodes flag, adjusts button text, and re-renders canvas.
 *
 * @param {HTMLElement} toggleBtn - The button element that toggles node visibility.
 * @param {Object} renderer - The renderer object responsible for drawing on the canvas.
 * @param {IDBDatabase} database - The IndexedDB database instance containing map data.
 */
export const setupToggleNodes = (toggleBtn, renderer, database) => {
    const storedShowNodes = localStorage.getItem("showNodes");

    renderer.showNodes = storedShowNodes ? storedShowNodes === "true" : false;
    updateToggleButton(toggleBtn, renderer.showNodes);
    renderer.render(database, renderer.showNodes);

    toggleBtn.addEventListener("click", () => {
        renderer.showNodes = !renderer.showNodes;
        localStorage.setItem("showNodes", renderer.showNodes);
        updateToggleButton(toggleBtn, renderer.showNodes);
        renderer.render(database, renderer.showNodes);
    });
};


/**
 * Updates the appearance of the button based on the current state of node visibility.
 * 
 * When the nodes are shown, the button text is set to 'Hide Nodes' and the 'active' CSS 
 * class is added, which updates and persists the new background colour.  When the nodes 
 * are hidden, the button text becomes 'Show Nodes' and the 'active' class is removed.
 *
 * @private
 * @param {HTMLElement} button - The toggle button element.
 * @param {boolean} showNodes - The current state indicating if the nodes are displayed.
 */
function updateToggleButton(button, showNodes) {
    if (showNodes) {
        button.textContent = "Hide Nodes";
        button.classList.add("active");
    } else {
        button.textContent = "Show Nodes";
        button.classList.remove("active");
    }
}
