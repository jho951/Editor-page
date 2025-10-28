/**
 * 두 점(a, b) 사이의 유클리드 거리 제곱을 계산합니다.
 * 입력: a, b - {x, y} 속성을 가진 객체 (2차원 점)
 * 출력: 두 점 사이 거리의 제곱
 */
const dist2 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

/**
 * 주어진 점들의 배열을 둘러싸는 최소 경계 상자를 계산합니다.
 * 경계 상자는 모든 점을 포함하는 가장 작은 직사각형입니다.
 * @param {Array<{x: number, y: number}>} points - 2차원 점 배열
 * @returns {{minX: number, minY: number, maxX: number, maxY: number, w: number, h: number} | null} 경계 상자 객체 (min/max 좌표 및 너비/높이) 없으면 null
 */
function computeBBox(points) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    // 배열의 모든 점을 순회하며 최소/최대 x, y 좌표를 찾습니다.
    for (const p of points) {
        if (!p) continue; // null 또는 undefined 점은 건너뜁니다.
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
    }

    // 유효한 경계가 설정되지 않았다면 (예: 빈 배열이거나 유효한 점이 없는 경우)
    if (!Number.isFinite(minX) || !Number.isFinite(minY)) return null;

    // 계산된 경계 좌표와 너비(w), 높이(h)를 포함하는 객체를 반환합니다.
    return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY };
}

/**
 * 주어진 2차원 경로(점들의 배열)를 경계 상자를 기준으로 정규화합니다.
 * 정규화된 좌표는 경계 상자 내에서 0과 1 사이의 값(u, v)을 가집니다.
 *
 * @param {Array<{x: number, y: number}>} points - 정규화할 2차원 점들의 배열입니다.
 * @param {{minX: number, minY: number, w: number, h: number}} bbox - 이전에 계산된 경계 상자 객체입니다.
 * @returns {Array<{u: number, v: number}>} 정규화된 (u, v) 좌표를 가진 점들의 배열입니다.
 */
function normalizePath(points, bbox) {
    const { minX, minY, w, h } = bbox;
    // 너비/높이가 0일 경우, 나누기 오류를 방지하기 위해 1로 설정합니다.
    const safeW = w || 1,
        safeH = h || 1;

    // 각 점을 (x, y)에서 정규화된 (u, v) 좌표로 변환합니다.
    return points.map((p) => ({
        // u = (현재 x - 최소 x) / 너비
        u: (p.x - minX) / safeW,
        // v = (현재 y - 최소 y) / 높이
        v: (p.y - minY) / safeH,
    }));
}

/**
 * 정규화된 경로(UV 좌표)를 주어진 위치 및 크기(Bounding Box)로 역정규화합니다.
 * 이는 정규화된 경로를 특정 위치와 크기를 가진 2차원 공간으로 변환(재매핑)하는 과정입니다.
 *
 * @param {Array<{u: number, v: number}>} pathUV - 정규화된 (u, v) 좌표를 가진 점들의 배열입니다.
 * @param {number} x - 새로운 경계 상자의 시작 x 좌표입니다.
 * @param {number} y - 새로운 경계 상자의 시작 y 좌표입니다.
 * @param {number} w - 새로운 경계 상자의 너비입니다.
 * @param {number} h - 새로운 경계 상자의 높이입니다.
 * @returns {Array<{x: number, y: number}>} 역정규화된 (x, y) 좌표를 가진 점들의 배열입니다.
 */
function denormPath(pathUV, x, y, w, h) {
    // 각 정규화된 점을 (u, v)에서 새로운 (x, y) 좌표로 변환합니다.
    return pathUV.map((q) => ({
        // x = 시작 x + (u * 너비)
        x: x + q.u * w,
        // y = 시작 y + (v * 높이)
        y: y + q.v * h,
    }));
}

/**
 * 점 P와 선분 AB 사이의 최소 거리를 계산합니다.
 *
 * @param {{x: number, y: number}} P - 거리를 측정할 점입니다.
 * @param {{x: number, y: number}} A - 선분의 시작점입니다.
 * @param {{x: number, y: number}} B - 선분의 끝점입니다.
 * @returns {{d: number, t: number, H: {x: number, y: number}}}
 * d: 점 P에서 선분 AB까지의 최소 거리.
 * t: 선분 AB 위에서 P에 가장 가까운 점 H의 위치 매개변수
 * H: 선분 AB 위에서 P에 가장 가까운 점
 */
function distPointToSegment(P, A, B) {
    // A 또는 B가 없으면 무한대 거리를 반환합니다. H는 유효한 점을 따릅니다.
    if (!A || !B) return { d: Infinity, t: 0, H: A || B };

    // 선분 AB의 벡터 (v)
    const vx = B.x - A.x,
        vy = B.y - A.y;
    // 점 P에서 시작점 A로 향하는 벡터 (w)
    const wx = P.x - A.x,
        wy = P.y - A.y;

    // 선분 AB의 길이 제곱 (v.v)
    const vv = vx * vx + vy * vy;

    // 점 P에 가장 가까운 선분 상의 점 H를 찾기 위한 매개변수 t를 계산합니다.
    // t = (w.v) / (v.v) 로 0과 1 사이로 제한됩니다.
    // t = 0은 가장 가까운 점이 A라는 의미, t = 1은 B라는 의미입니다.
    const t = vv === 0 ? 0 : Math.max(0, Math.min(1, (wx * vx + wy * vy) / vv));

    // 선분 상에서 P에 가장 가까운 점 H의 좌표를 계산합니다 (H = A + t * v).
    const H = { x: A.x + t * vx, y: A.y + t * vy };

    // P와 H 사이의 거리(d)를 계산합니다.
    const dx = P.x - H.x,
        dy = P.y - H.y;
    return { d: Math.hypot(dx, dy), t, H };
}

// 이 모듈에서 정의된 함수들을 외부에서 사용할 수 있도록 내보냅니다.
export { dist2, computeBBox, normalizePath, denormPath, distPointToSegment };
