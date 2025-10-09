// 공용 유틸
const EPS = 0.5;

export function bboxOfPoints(points, strokeWidth = 0) {
    let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
    for (const p of points || []) {
        if (!p) continue;
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
    }
    if (minX === Infinity) return { x: 0, y: 0, w: 0, h: 0 };
    const pad = (strokeWidth || 0) / 2 + 1;
    return {
        x: minX - pad,
        y: minY - pad,
        w: maxX - minX + pad * 2,
        h: maxY - minY + pad * 2,
    };
}

export function drawStrokeFill(ctx, pathDrawer, { stroke, fill }) {
    ctx.save();
    ctx.beginPath();
    pathDrawer(ctx);
    if (fill && fill.color && (fill.opacity ?? 1) > 0) {
        ctx.globalAlpha = fill.opacity ?? 1;
        ctx.fillStyle = fill.color;
        ctx.fill();
    }
    if (
        stroke &&
        stroke.color &&
        (stroke.opacity ?? 1) > 0 &&
        (stroke.width ?? 0) > 0
    ) {
        ctx.globalAlpha = stroke.opacity ?? 1;
        ctx.lineWidth = stroke.width ?? 2;
        ctx.setLineDash(stroke.dash || []);
        ctx.strokeStyle = stroke.color;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.stroke();
    }
    ctx.restore();
}

export function hitTestPolyline(points, x, y, width = 2) {
    const r = Math.max(4, (width || 2) / 1.6);
    const r2 = r * r;
    for (let i = 1; i < (points?.length || 0); i++) {
        const a = points[i - 1],
            b = points[i];
        const abx = b.x - a.x,
            aby = b.y - a.y;
        const apx = x - a.x,
            apy = y - a.y;
        const denom = abx * abx + aby * aby + EPS;
        const t = Math.max(0, Math.min(1, (abx * apx + aby * apy) / denom));
        const px = a.x + abx * t,
            py = a.y + aby * t;
        const dx = x - px,
            dy = y - py;
        if (dx * dx + dy * dy <= r2) return true;
    }
    return false;
}

export function translatePoints(points, dx, dy) {
    return (points || []).map((p) => ({ x: p.x + dx, y: p.y + dy }));
}
