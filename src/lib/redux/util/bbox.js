// bbox.js
/**
 * @file bbox.js
 * @description 도형의 경계 상자(bounding box) 계산/보조 유틸
 */

// ── 기본 프레임형 사각형
function rect({ x = 0, y = 0, w = 0, h = 0 }) {
    return { x, y, w, h };
}

// ── 프레임형 타원(ellipse) → 이미 x,y,w,h 프레임이 정해져 있을 때
function ellipse({ x = 0, y = 0, w = 0, h = 0 }) {
    return { x, y, w, h };
}

// ── 중심형 타원(cx,cy,rx,ry) → 프레임 bbox로 변환
function ellipseFromCenter({ cx = 0, cy = 0, rx = 0, ry = 0 }) {
    return { x: cx - rx, y: cy - ry, w: rx * 2, h: ry * 2 };
}

// ── 원 (중심 + 반지름)
function circle({ cx = 0, cy = 0, r = 0 }) {
    return { x: cx - r, y: cy - r, w: r * 2, h: r * 2 };
}

// ── 선분(x1,y1)-(x2,y2) → bbox
function line({ x1 = 0, y1 = 0, x2 = 0, y2 = 0 }) {
    const x = Math.min(x1, x2);
    const y = Math.min(y1, y2);
    return { x, y, w: Math.abs(x2 - x1), h: Math.abs(y2 - y1) };
}

// ── 별 포인트 생성(시각화용)
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

// ── [x1,y1,x2,y2,...] → bbox
function fromPoints(pts) {
    if (!pts || pts.length < 2) return null;
    let minX = pts[0],
        minY = pts[1],
        maxX = pts[0],
        maxY = pts[1];
    for (let i = 2; i < pts.length; i += 2) {
        const x = pts[i],
            y = pts[i + 1];
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
    }
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

// ── 점 배열 시어 변환(원점 ox,oy 기준)
function shearPoint(pts, kx, ky, ox, oy) {
    for (let i = 0; i < pts.length; i += 2) {
        const x = pts[i],
            y = pts[i + 1];
        const dx = x - ox,
            dy = y - oy;
        pts[i] = ox + dx + kx * dy;
        pts[i + 1] = oy + dy + ky * dx;
    }
}

// 구버전 호환: eclipse → ellipse 별칭
const eclipse = ellipse;

export const bbox = {
    rect,
    ellipse,
    ellipseFromCenter,
    circle,
    line,
    makeStarPoints,
    point: fromPoints,
    shearPoint,
    // alias
    eclipse,
};
