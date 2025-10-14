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
