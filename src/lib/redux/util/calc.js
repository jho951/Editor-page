// calc.js
const calcBBox = (s) => {
    if (!s) return { x: 0, y: 0, w: 0, h: 0 };

    if (
        s.type === 'rect' ||
        s.type === 'ellipse' ||
        s.type === 'circle' ||
        s.type === 'text' ||
        s.type === 'star'
    ) {
        return { x: s.x ?? 0, y: s.y ?? 0, w: s.w ?? 0, h: s.h ?? 0 };
    }

    if (s.type === 'line') {
        const x0 = s.x ?? 0,
            y0 = s.y ?? 0;
        const x1 = (s.x ?? 0) + (s.w ?? 0);
        const y1 = (s.y ?? 0) + (s.h ?? 0);
        const x = Math.min(x0, x1),
            y = Math.min(y0, y1);
        return { x, y, w: Math.abs(x1 - x0), h: Math.abs(y1 - y0) };
    }

    if (s.type === 'polyline' || s.type === 'polygon' || s.type === 'path') {
        const pts = s.data?.points || [];
        if (pts.length < 2) return { x: s.x ?? 0, y: s.y ?? 0, w: 0, h: 0 };
        let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity;
        for (let i = 0; i < pts.length; i += 2) {
            const x = pts[i],
                y = pts[i + 1];
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
        }
        return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    }

    return s.bbox ?? { x: 0, y: 0, w: 0, h: 0 };
};

// 별 포인트 생성
function makeStarPoints(
    cx,
    cy,
    R,
    rRatio = 0.5,
    n = 5,
    rotateRad = -Math.PI / 2
) {
    const pts = [];
    const step = Math.PI / n;
    for (let i = 0; i < n * 2; i++) {
        const ang = rotateRad + i * step;
        const r = i % 2 === 0 ? R : R * rRatio;
        pts.push(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r);
    }
    return pts;
}

const lineToEndpoints = (s) => ({
    x1: s.x ?? 0,
    y1: s.y ?? 0,
    x2: (s.x ?? 0) + (s.w ?? 0),
    y2: (s.y ?? 0) + (s.h ?? 0),
});
const endpointsToLine = ({ x1 = 0, y1 = 0, x2 = 0, y2 = 0 }) => ({
    x: x1,
    y: y1,
    w: x2 - x1,
    h: y2 - y1,
});

// 반사/시어(점배열)
const reflectX = (x, ox) => 2 * ox - x;
const reflectY = (y, oy) => 2 * oy - y;
const shearPoints = (pts, kx, ky, ox, oy) => {
    for (let i = 0; i < pts.length; i += 2) {
        const x = pts[i],
            y = pts[i + 1];
        const dx = x - ox,
            dy = y - oy;
        pts[i] = ox + dx + kx * dy;
        pts[i + 1] = oy + dy + ky * dx;
    }
};

export {
    calcBBox,
    makeStarPoints,
    lineToEndpoints,
    endpointsToLine,
    reflectX,
    reflectY,
    shearPoints,
};
