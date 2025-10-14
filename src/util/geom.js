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
