const MAX_ZOOM_LEVEL = 6;
const MIN_ZOOM_LEVEL = 0.4;

const STORAGE_KEY_ZOOM_LEVEL = "zoomLevel";

function updateZoom(renderer, database, newZoomLevel) {
    renderer.zoomLevel = newZoomLevel;
    localStorage.setItem(STORAGE_KEY_ZOOM_LEVEL, renderer.zoomLevel);
    renderer.render(database, renderer.showNodes);
}

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
