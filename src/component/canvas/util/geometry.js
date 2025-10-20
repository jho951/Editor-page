const dist2 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function computeBBox(points) {
    let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
    for (const p of points) {
        if (!p) continue;
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
    }
    if (!Number.isFinite(minX) || !Number.isFinite(minY)) return null;
    return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY };
}

function normalizePath(points, bbox) {
    const { minX, minY, w, h } = bbox;
    const safeW = w || 1,
        safeH = h || 1;
    return points.map((p) => ({
        u: (p.x - minX) / safeW,
        v: (p.y - minY) / safeH,
    }));
}

function denormPath(pathUV, x, y, w, h) {
    return pathUV.map((q) => ({ x: x + q.u * w, y: y + q.v * h }));
}

export { dist2, computeBBox, normalizePath, denormPath };
