import { renderRules } from './render-rules.js';

const isPathClosed = (nodes) => {
    const { x: startX, y: startY } = nodes[0];
    const { x: endX, y: endY } = nodes[nodes.length - 1];
    return startX === endX && startY === endY;
};

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

function getRenderRule(element) {
    return renderRules.find(rule => rule.condition(element));
}

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

const updateToggleButton = (button, isActive, label) => {
    button.textContent = isActive ? `Hide ${label}` : `Show ${label}`;
    button.classList.toggle("active", isActive);
};
