function drawEllipsePath(ctx, x, y, w, h) {
    const cx = x + w / 2,
        cy = y + h / 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, Math.abs(w / 2), Math.abs(h / 2), 0, 0, Math.PI * 2);
}

function drawPolygonPath(ctx, x, y, w, h, sides = 5) {
    const cx = x + w / 2,
        cy = y + h / 2;
    const r = Math.min(Math.abs(w / 2), Math.abs(h / 2));
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / sides;
        const px = cx + r * Math.cos(a);
        const py = cy + r * Math.sin(a);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
}

function drawStarPath(ctx, x, y, w, h, points = 5, innerRatio = 0.5) {
    const cx = x + w / 2,
        cy = y + h / 2;
    const rOuter = Math.min(Math.abs(w / 2), Math.abs(h / 2));
    const rInner = rOuter * innerRatio;
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? rOuter : rInner;
        const a = -Math.PI / 2 + (i * Math.PI) / points;
        const px = cx + r * Math.cos(a);
        const py = cy + r * Math.sin(a);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
}

function drawLinePath(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y + h);
}

function strokePath(ctx, pts) {
    if (!pts || pts.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
}

export {
    drawEllipsePath,
    drawPolygonPath,
    drawStarPath,
    drawLinePath,
    strokePath,
};
