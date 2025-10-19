// guide.js
import { deepClone } from './parse';

const coerceSize = (n, fallback) => {
    const v = Number(n);
    if (Number.isFinite(v) && v > 0) return v;
    console.warn(`숫자 오류: '${n}' (변환: ${v}). fallback: ${fallback}`);
    return fallback;
};

const safeParseVectorJson = (v) => {
    if (!v) return null;
    if (typeof v === 'object') return v;
    try {
        return JSON.parse(v);
    } catch {
        return null;
    }
};

/** 현재 리덕스 상태로부터 벡터 스냅샷 구성 */
function makeVectorSnapshot(getState) {
    const s = getState();
    return {
        kind: 'vector',
        canvas: {
            width: s?.canvas?.width ?? 0,
            height: s?.canvas?.height ?? 0,
            background: s?.canvas?.background ?? null,
            grid: s?.canvas?.grid ?? null,
        },
        shapes: deepClone(s?.shape?.list ?? []),
    };
}

/** viewport 스냅샷 */
function makeViewportSnapshot(getState) {
    const vp = getState()?.viewport ?? {};
    return {
        kind: 'viewport',
        zoom: vp.zoom ?? 1,
        pan: { x: vp.pan?.x ?? 0, y: vp.pan?.y ?? 0 },
        rotation: vp.rotation ?? 0,
        fitMode: vp.fitMode ?? null,
    };
}

function clamp(v, a, b) {
    if (v < a) console.warn(`clamp: v(${v}) < a(${a})`);
    if (v > b) console.warn(`clamp: v(${v}) > b(${b})`);
    return Math.max(a, Math.min(b, v));
}

function ensureArray(v) {
    return Array.isArray(v) ? v : v ? [v] : [];
}

function primaryId() {
    return (
        globalThis.crypto?.randomUUID?.() ||
        `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
    );
}

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
