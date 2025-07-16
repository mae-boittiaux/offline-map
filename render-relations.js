import { renderRules } from './render-rules.js';

const applyRelationStyles = (ctx, relation) => {
    const rule = renderRules.find(rule => rule.condition(relation));

    ctx.lineWidth = rule.styles.lineWidth ?? 1;
    ctx.fillStyle = rule.styles.fillStyle;
    ctx.strokeStyle = rule.styles.strokeStyle;

    return rule.styles.shouldFill;
};

const isPathClosed = (nodes) => {
    const { x: startX, y: startY } = nodes[0];
    const { x: endX, y: endY } = nodes[nodes.length - 1];
    return startX === endX && startY === endY;
};

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

function getRenderRule(element) {
    return renderRules.find(rule => rule.condition(element));
}

function updateToggleButton(button, isActive, label) {
    button.textContent = isActive ? `Hide ${label}` : `Show ${label}`;
    button.classList.toggle("active", isActive);
}

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
