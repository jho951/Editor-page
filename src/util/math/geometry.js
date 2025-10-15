export function rectFromPoints(x0, y0, x1, y1) {
    const x = Math.min(x0, x1);
    const y = Math.min(y0, y1);
    const w = Math.abs(x1 - x0);
    const h = Math.abs(y1 - y0);
    return { x, y, w, h };
}
export function bboxOfPoints(points) {
    let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
    for (let i = 0; i < points.length; i += 2) {
        const x = points[i],
            y = points[i + 1];
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
    }
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

export function centerOf({ x, y, w, h }) {
    return { cx: x + w / 2, cy: y + h / 2 };
}

export function simplifyRDP(points, epsilon = 1.2) {
    if (points.length <= 4) return points.slice();
    const pts = [];
    for (let i = 0; i < points.length; i += 2)
        pts.push({ x: points[i], y: points[i + 1] });
    const keep = new Array(pts.length).fill(false);
    keep[0] = keep[pts.length - 1] = true;
    function distance(p, a, b) {
        const A = p.x - a.x,
            B = p.y - a.y;
        const C = b.x - a.x,
            D = b.y - a.y;
        const dot = A * C + B * D;
        const lenSq = C * C + D * D || 1;
        const t = Math.max(0, Math.min(1, dot / lenSq));
        const px = a.x + C * t,
            py = a.y + D * t;
        const dx = p.x - px,
            dy = p.y - py;
        return Math.sqrt(dx * dx + dy * dy);
    }
    function rdp(a, b) {
        let maxD = -1,
            idx = -1;
        for (let i = a + 1; i < b; i++) {
            const d = distance(pts[i], pts[a], pts[b]);
            if (d > maxD) {
                maxD = d;
                idx = i;
            }
        }
        if (maxD > epsilon) {
            keep[idx] = true;
            rdp(a, idx);
            rdp(idx, b);
        }
    }
    rdp(0, pts.length - 1);
    const out = [];
    for (let i = 0; i < pts.length; i++)
        if (keep[i]) {
            out.push(pts[i].x, pts[i].y);
        }
    return out;
}
