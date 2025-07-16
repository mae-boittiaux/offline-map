export const setupPanning = (canvas, renderer) => {
    let isPanning = false;
    let startX = 0, startY = 0;

    const updateCurrentOffset = (dx, dy) => {
        renderer.currentOffsetX = renderer.offsetX + dx;
        renderer.currentOffsetY = renderer.offsetY - dy;
        renderer.needsRender = true;
    };

    const storeCurrentOffset = () => {
        renderer.offsetX = renderer.currentOffsetX;
        renderer.offsetY = renderer.currentOffsetY;
        localStorage.setItem("offsetX", renderer.offsetX);
        localStorage.setItem("offsetY", renderer.offsetY);
    };

    const onMouseDown = (event) => {
        isPanning = true;
        startX = event.clientX;
        startY = event.clientY;
    };

    const onMouseMove = (event) => {
        if (!isPanning) return;
        const dx = event.clientX - startX;
        const dy = event.clientY - startY;
        updateCurrentOffset(dx, dy);
    };

    const throttledMouseMove = throttle(onMouseMove, 50);

    const onMouseUp = () => {
        if (!isPanning) return;
        isPanning = false;
        storeCurrentOffset();
    };

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", throttledMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mouseleave", onMouseUp);

    const cleanup = () => {
        canvas.removeEventListener("mousedown", onMouseDown);
        canvas.removeEventListener("mousemove", throttledMouseMove);
        canvas.removeEventListener("mouseup", onMouseUp);
        canvas.removeEventListener("mouseleave", onMouseUp);
    };

    return { cleanup };
};

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
