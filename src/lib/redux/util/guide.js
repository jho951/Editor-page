import { deepClone } from './parse';

/**
 * @file guide.js
 * @author YJH
 * @description 양수인 경우 숫자 반환, 그 외의 경우 fallback 반환하며 경고 로그를 남김
 * @param {number|string} n - 확인할 값
 * @param {number} fallback - 유효하지 않을 때 반환할 값
 * @returns {number} - 유효한 양수 또는 fallback 값
 */
const coerceSize = (n, fallback) => {
    const v = Number(n);
    if (Number.isFinite(v) && v > 0) {
        return v;
    } else {
        console.warn(
            `숫자 오류: '${n}' (변환할 값: ${v}). 오류로 인해 반환할 값: ${fallback}`
        );
        return fallback;
    }
};

/**
 * @file safeParseVectorJson.js
 * @author YJH
 * @description vectorJson 안전 파서 (문자열/객체 대응)
 * @param {string|object} v - vectorJson (문자열 또는 객체)
 * @returns {object|null} 파싱된 객체 또는 null
 */
const safeParseVectorJson = (v) => {
    if (!v) return null;
    if (typeof v === 'object') return v;
    try {
        return JSON.parse(v);
    } catch {
        return null;
    }
};

function makeVectorSnapshot(getState) {
    const { vector } = getState().doc; // 네 상태 구조에 맞춰 수정
    const { width, height, shapes, order, styleIndex } = vector;
    return {
        kind: 'vector',
        width,
        height,
        shapes: deepClone(shapes),
        order: order ? [...order] : undefined,
        styleIndex: styleIndex ? deepClone(styleIndex) : undefined,
    };
}

function makeViewportSnapshot(getState) {
    const { viewport } = getState();
    const { zoom, pan, fitMode } = viewport;
    return {
        kind: 'viewport',
        zoom,
        pan: { x: pan.x, y: pan.y },
        fitMode: fitMode ?? null,
    };
}

/**
 * @file clamp.js
 * @author YJH
 * @description 값을 a와 b 사이로 제한
 * @param {number} v - 제한할 값
 * @param {number} a - 최소값
 * @param {number} b - 최대값
 * @returns {number} 제한된 값
 */
function clamp(v, a, b) {
    if (v < a) {
        console.log(`제한할 값 (v: ${v})이 최소값 (a: ${a})보다 작습니다.`);
    }
    if (v > b) {
        console.log(`제한할 값 (v: ${v})이 최대값 (b: ${b})보다 큽니다.`);
    }
    return Math.max(a, Math.min(b, v));
}

/**
 * @description
 *
 *
 */
function ensureArray(v) {
    return Array.isArray(v) ? v : v ? [v] : [];
}

/**
 * @description
 */
function primaryId() {
    return globalThis.crypto?.randomUUID?.();
}

/**
 *
 */
function getId(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.ids)) return payload.ids;
    if (payload?.id) return [payload.id];
    return ensureArray(payload);
}

const normRect = (x0, y0, x1, y1) => {
    const x = Math.min(x0, x1);
    const y = Math.min(y0, y1);
    const w = Math.abs(x1 - x0);
    const h = Math.abs(y1 - y0);
    return { x, y, w, h };
};

function takePayload(payload) {
    return payload && payload.history != null ? payload.history : payload;
}

export {
    coerceSize,
    safeParseVectorJson,
    makeVectorSnapshot,
    makeViewportSnapshot,
    clamp,
    ensureArray,
    primaryId,
    getId,
    normRect,
    takePayload,
};
