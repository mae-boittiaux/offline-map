/**
 * @fileoverview 
 * Mouse events module for handling panning interactions on the canvas.
 * 
 * The following module provides the functionality which enables panning of the map 
 * by listening to any mouse events on the canvas element. The panning movement is 
 * throttled to allow for more efficient rendering and improved user experience.
 */

/**
 * Sets up the mouse event listeners to enable panning functionality on the canvas.
 *
 * This function attaches event listeners for the "mousedown", "mousemove", "mouseup", 
 * and "mouseleave" events on the canvas. The mouse movement is throttled in order to 
 * limit the frequency of panning updates, updating the offset properties accordingly.
 * 
 * @param {HTMLCanvasElement} canvas - The canvas element to attach mouse event listeners.
 * @param {Object} renderer - The renderer object that manages the canvas rendering.
 * @returns {{cleanup: Function}} An object containing a cleanup function to remove the attached event listeners.
 */
export const setupPanning = (canvas, renderer) => {
    let isPanning = false;
    let startX = 0, startY = 0;

    /**
     * Updates the current offset based on the provided values and flags for re-rendering.
     *
     * @private
     * @param {number} dx - The change in the x-coordinate.
     * @param {number} dy - The change in the y-coordinate.
     */
    const updateCurrentOffset = (dx, dy) => {
        renderer.currentOffsetX = renderer.offsetX + dx;
        renderer.currentOffsetY = renderer.offsetY - dy;
        renderer.needsRender = true;
    };

    /**
     * Stores the current offset values from the renderer and persists them to localStorage.
     *
     * @private
     */
    const storeCurrentOffset = () => {
        renderer.offsetX = renderer.currentOffsetX;
        renderer.offsetY = renderer.currentOffsetY;
        localStorage.setItem("offsetX", renderer.offsetX);
        localStorage.setItem("offsetY", renderer.offsetY);
    };

    /**
     * Mouse down event handler that initiates the panning process.
     *
     * @private
     * @param {MouseEvent} event - The mouse down event.
     */
    const onMouseDown = (event) => {
        isPanning = true;
        startX = event.clientX;
        startY = event.clientY;
    };

    /**
     * Mouse move event handler that updates the offset of the renderer if panning active.
     *
     * @private
     * @param {MouseEvent} event - The mouse move event.
     */
    const onMouseMove = (event) => {
        if (!isPanning) return;
        const dx = event.clientX - startX;
        const dy = event.clientY - startY;
        updateCurrentOffset(dx, dy);
    };

    /* 
     * Throttle onMouseMove to run at most once every 50ms - in order to improve 
     * performance by reducing the frequency of updates during rapid mouse movements.
     */
    const throttledMouseMove = throttle(onMouseMove, 50);

    /**
     * Mouse up event handler that ends the panning process and stores the final offset.
     *
     * @private
     */
    const onMouseUp = () => {
        if (!isPanning) return;
        isPanning = false;
        storeCurrentOffset();
    };

    /**
     * Attach the mouse event-listeners to the canvas element:
     *  - "mousedown": Starts the panning process by calling onMouseDown.
     *  - "mousemove": Updates the panning using the throttled onMouseMove handler.
     *  - "mouseup": Ends the panning process by calling onMouseUp.
     *  - "mouseleave": Also ends the panning process when the mouse leaves the canvas.
     */
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", throttledMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mouseleave", onMouseUp);

    /**
     * Removes all the mouse event listeners from the canvas.
     *
     * @private
     */
    const cleanup = () => {
        canvas.removeEventListener("mousedown", onMouseDown);
        canvas.removeEventListener("mousemove", throttledMouseMove);
        canvas.removeEventListener("mouseup", onMouseUp);
        canvas.removeEventListener("mouseleave", onMouseUp);
    };

    return { cleanup };
};

/**
 * Creates a throttled version of the provided function that only executes at most once
 * every specified delay.
 *
 * @private
 * @param {Function} func - The function to throttle.
 * @param {number} delay - The delay in milliseconds between allowed function executions.
 * @returns {Function} A throttled version of the input function.
 */
const throttle = (func, delay) => {
    let lastCall = 0;
    return function (...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            func.apply(this, args);
        }
    };
};
