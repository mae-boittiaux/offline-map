const NODE_RADIUS = 1;
const NODE_COLOUR = "#399cc6";

const calculateArcParameters = (node, canvas, zoomLevel) => {
    const x = node.x;
    const y = canvas.height - node.y;
    const radius = NODE_RADIUS * zoomLevel;
    return { x, y, radius, startAngle: 0, endAngle: Math.PI * 2 };
};

export const drawNodes = (ctx, canvas, nodes, zoomLevel) => {
    ctx.strokeStyle = NODE_COLOUR;

    nodes.forEach(node => {
        const { x, y, radius, startAngle, endAngle } = calculateArcParameters(node, canvas, zoomLevel);
        ctx.beginPath();
        ctx.arc(x, y, radius, startAngle, endAngle);
        ctx.stroke();
    });
};

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

function updateToggleButton(button, showNodes) {
    if (showNodes) {
        button.textContent = "Hide Nodes";
        button.classList.add("active");
    } else {
        button.textContent = "Show Nodes";
        button.classList.remove("active");
    }
}
