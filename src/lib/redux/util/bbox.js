/**
 * @file bbox.js
 * @author YJH
 * @description 도형의 경계 상자(bounding box) 계산 유틸리티 함수 모음
 */

/**
 * @description 사각형 경계 상자(bounding box)를 계산하는 유틸리티 함수
 * @param {object} s - 사각형 도형 객체
 * @returns {object} 경계 상자 {x, y, w, h}
 */
function rect({ x = 0, y = 0, w = 0, h = 0 }) {
    return { x, y, w, h };
}

/**
 * @description 원 경계 상자(bounding box)를 계산하는 유틸리티 함수
 * @param {object} s - 원 도형 객체
 * @returns {object} 경계 상자 {x, y, w, h}
 * @throws {Error} 지원되지 않는 도형 타입
 * @author YJH
 */

/**
 * @description 타원 경계 상자(bounding box)를 계산하는 유틸리티 함수
 * @param {object} s - 타원 도형 객체
 * @returns {object} 경계 상자 {x, y, w, h}
 * @throws {Error} 지원되지 않는 도형 타입
 */
function eclipse({ x = 0, y = 0, w = 0, h = 0 }) {
    return {
        x: x - w / 2,
        y: y - h / 2,
        w,
        h,
    };
}

/**
 * @description 선분 경계 상자(bounding box)를 계산하는 유틸리티 함수
 * @param {object} s - 선분 도형 객체
 * @returns {object} 경계 상자 {x, y, w, h}
 * @throws {Error} 지원되지 않는 도형 타입
 */
function line({ x1 = 0, y1 = 0, x2 = 0, y2 = 0 }) {
    const x = Math.min(x1, x2);
    const y = Math.min(y1, y2);
    return { x, y, w: Math.abs(x2 - x1), h: Math.abs(y2 - y1) };
}

/**
 * @description 별 경계 상자(bounding box)를 계산하는 유틸리티 함수
 * @param {object} s - 선분 도형 객체
 * @returns {object} 경계 상자 {x, y, w, h}
 * @throws {Error} 지원되지 않는 도형 타입
 */
function star(cx, cy, R, rRatio = 0.5, n = 5, rotateRad = -Math.PI / 2) {
    const pts = [];
    const step = Math.PI / n;
    for (let i = 0; i < n * 2; i++) {
        const ang = rotateRad + i * step;
        const r = i % 2 === 0 ? R : R * rRatio;
        pts.push(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r);
    }
    return pts;
}

/**
 * @description 점들의 경계 상자(bounding box)를 계산하는 유틸리티 함수
 * @param {number[]} pts - 점 좌표 배열 [x1, y1, x2, y2, ...]
 * @returns {object|null} 경계 상자 {x, y, w, h} 또는 null (점이 없을 경우)
 * @throws {Error} 지원되지 않는 도형 타입
 */
const point = (pts) => {
    if (!pts || pts.length < 2) return null;
    let minX = pts[0];
    let minY = pts[1];
    let maxX = pts[0];
    let maxY = pts[1];
    for (let i = 2, n = pts.length; i < n; i += 2) {
        const px = pts[i],
            py = pts[i + 1];
        if (px < minX) minX = px;
        if (py < minY) minY = py;
        if (px > maxX) maxX = px;
        if (py > maxY) maxY = py;
    }
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
};

function shearPoint(pts, kx, ky, ox, oy) {
    for (let i = 0; i < pts.length; i += 2) {
        const x = pts[i],
            y = pts[i + 1];
        const dx = x - ox,
            dy = y - oy;
        const nx = ox + dx + kx * dy;
        const ny = oy + dy + ky * dx;
        pts[i] = nx;
        pts[i + 1] = ny;
    }
}

export const bbox = {
    rect,
    eclipse,
    line,
    star,
    point,
    shearPoint,
};
