import { createSlice } from '@reduxjs/toolkit';

const ensureArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const genId = () =>
    globalThis.crypto?.randomUUID?.() ||
    `s_${Math.random().toString(36).slice(2, 9)}`;

// ───────────────────────────────────────────────
// bbox 계산
const calcBBox = (s) => {
    if (
        s.type === 'rect' ||
        s.type === 'ellipse' ||
        s.type === 'circle' ||
        s.type === 'text'
    ) {
        return { x: s.x, y: s.y, w: s.w, h: s.h };
    }
    if (s.type === 'line') {
        const x0 = s.x,
            y0 = s.y,
            x1 = s.x + s.w,
            y1 = s.y + s.h;
        const x = Math.min(x0, x1),
            y = Math.min(y0, y1);
        return { x, y, w: Math.abs(x1 - x0), h: Math.abs(y1 - y0) };
    }
    if (s.type === 'star') {
        return { x: s.x, y: s.y, w: s.w, h: s.h };
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

// ───────────────────────────────────────────────
// flip / skew 헬퍼
const reflectX = (x, ox) => 2 * ox - x;
const reflectY = (y, oy) => 2 * oy - y;

const getIds = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.ids)) return payload.ids;
    if (payload?.id) return [payload.id];
    return ensureArray(payload);
};

// poly류 좌표에 선형 shear 적용
const shearPoints = (pts, kx, ky, ox, oy) => {
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
};

// ───────────────────────────────────────────────

const initialState = { list: [] };

const shapeSlice = createSlice({
    name: 'shapes',
    initialState,
    reducers: {
        replaceAllShapes: (state, { payload }) => {
            state.list = Array.isArray(payload)
                ? payload.map((s) => ({ ...s, bbox: s.bbox ?? calcBBox(s) }))
                : [];
        },
        addShape: (state, { payload }) => {
            const id = payload.id ?? genId();
            const s = {
                id,
                type: payload.type,
                x: payload.x ?? 0,
                y: payload.y ?? 0,
                w: payload.w ?? 0,
                h: payload.h ?? 0,
                style: payload.style ?? {
                    stroke: '#333',
                    fill: null,
                    strokeWidth: 1,
                },
                data: payload.data ?? null,
                matrix: payload.matrix ?? [1, 0, 0, 1, 0, 0],
            };
            s.bbox = calcBBox(s);
            state.list.push(s);
        },
        removeShapes: (state, { payload }) => {
            const ids = ensureArray(payload);
            state.list = state.list.filter((s) => !ids.includes(s.id));
        },
        setShapeData: (state, { payload }) => {
            const it = state.list.find((x) => x.id === payload.id);
            if (!it) return;
            it.data = { ...(it.data || {}), ...(payload.data || {}) };
            it.bbox = calcBBox(it);
        },
        setShapeStyle: (state, { payload }) => {
            const ids = ensureArray(payload.ids);
            for (const it of state.list) {
                if (ids.includes(it.id))
                    it.style = {
                        ...(it.style || {}),
                        ...(payload.style || {}),
                    };
            }
        },
        translateShapes: (state, { payload }) => {
            const ids = ensureArray(payload.ids);
            for (const it of state.list) {
                if (!ids.includes(it.id)) continue;
                if (
                    it.type === 'polyline' ||
                    it.type === 'polygon' ||
                    it.type === 'path'
                ) {
                    const pts = it.data?.points || [];
                    for (let i = 0; i < pts.length; i += 2) {
                        pts[i] += payload.dx;
                        pts[i + 1] += payload.dy;
                    }
                    it.data.points = pts;
                } else {
                    it.x += payload.dx;
                    it.y += payload.dy;
                }
                it.bbox = calcBBox(it);
            }
        },
        scaleShapes: (state, { payload }) => {
            const ids = ensureArray(payload.ids);
            const ox = payload.origin?.x ?? null,
                oy = payload.origin?.y ?? null;
            const sx = Number(payload.sx ?? 1),
                sy = Number(payload.sy ?? 1);
            for (const it of state.list) {
                if (!ids.includes(it.id)) continue;
                if (
                    it.type === 'polyline' ||
                    it.type === 'polygon' ||
                    it.type === 'path'
                ) {
                    const pts = it.data?.points || [];
                    if (ox != null && oy != null) {
                        for (let i = 0; i < pts.length; i += 2) {
                            pts[i] = ox + (pts[i] - ox) * sx;
                            pts[i + 1] = oy + (pts[i + 1] - oy) * sy;
                        }
                    } else {
                        for (let i = 0; i < pts.length; i += 2) {
                            pts[i] *= sx;
                            pts[i + 1] *= sy;
                        }
                    }
                    it.data.points = pts;
                } else {
                    if (ox != null && oy != null) {
                        it.x = ox + (it.x - ox) * sx;
                        it.y = oy + (it.y - oy) * sy;
                    }
                    it.w *= sx;
                    it.h *= sy;
                }
                it.bbox = calcBBox(it);
            }
        },
        rotateShapes: (state, { payload }) => {
            const ids = ensureArray(payload.ids);
            const deg = Number(payload.deg ?? 0);
            const rad = (deg * Math.PI) / 180;
            const cos = Math.cos(rad),
                sin = Math.sin(rad);
            const ox = payload.origin?.x ?? null,
                oy = payload.origin?.y ?? null;
            const rot = (x, y) => {
                if (ox == null || oy == null) return [x, y];
                const dx = x - ox,
                    dy = y - oy;
                return [ox + dx * cos - dy * sin, oy + dx * sin + dy * cos];
            };
            for (const it of state.list) {
                if (!ids.includes(it.id)) continue;
                if (
                    it.type === 'polyline' ||
                    it.type === 'polygon' ||
                    it.type === 'path'
                ) {
                    const pts = it.data?.points || [];
                    for (let i = 0; i < pts.length; i += 2) {
                        const [nx, ny] = rot(pts[i], pts[i + 1]);
                        pts[i] = nx;
                        pts[i + 1] = ny;
                    }
                    it.data.points = pts;
                } else {
                    const [nx, ny] = rot(it.x, it.y);
                    it.x = nx;
                    it.y = ny;
                }
                it.bbox = calcBBox(it);
            }
        },

        // ───────────────────────────────────────────────
        // 폴리(라인/곤/프리드로우) 노드 편집
        updatePolylineNode: (state, { payload }) => {
            const it = state.list.find((x) => x.id === payload.id);
            if (!it) return;
            const pts = it.data?.points || [];
            const i = clamp(payload.index * 2, 0, Math.max(0, pts.length - 2));
            pts[i] = payload.x;
            pts[i + 1] = payload.y;
            it.data.points = pts;
            it.bbox = calcBBox(it);
        },
        insertPolylineNode: (state, { payload }) => {
            const it = state.list.find((x) => x.id === payload.id);
            if (!it) return;
            const pts = it.data?.points || [];
            const i = clamp(payload.index * 2 + 2, 0, pts.length);
            pts.splice(i, 0, payload.x, payload.y);
            it.data.points = pts;
            it.bbox = calcBBox(it);
        },
        deletePolylineNode: (state, { payload }) => {
            const it = state.list.find((x) => x.id === payload.id);
            if (!it) return;
            const pts = it.data?.points || [];
            if (pts.length <= 4) return; // 최소 2점 보존
            const i = clamp(payload.index * 2, 0, pts.length - 2);
            pts.splice(i, 2);
            it.data.points = pts;
            it.bbox = calcBBox(it);
        },

        // ───────────────────────────────────────────────
        // 🔴 추가: flip / skew (미들웨어 호환용)
        flipHShapes: (state, { payload }) => {
            const ids = getIds(payload);
            for (const it of state.list) {
                if (!ids.includes(it.id)) continue;
                const bb = calcBBox(it);
                const ox = payload?.origin?.x ?? bb.x + bb.w / 2;

                if (
                    it.type === 'polyline' ||
                    it.type === 'polygon' ||
                    it.type === 'path'
                ) {
                    const pts = it.data?.points || [];
                    for (let i = 0; i < pts.length; i += 2)
                        pts[i] = reflectX(pts[i], ox);
                    it.data.points = pts;
                } else {
                    // x' = 2*ox - (x + w)
                    it.x = 2 * ox - (it.x + it.w);
                }
                it.bbox = calcBBox(it);
            }
        },
        flipVShapes: (state, { payload }) => {
            const ids = getIds(payload);
            for (const it of state.list) {
                if (!ids.includes(it.id)) continue;
                const bb = calcBBox(it);
                const oy = payload?.origin?.y ?? bb.y + bb.h / 2;

                if (
                    it.type === 'polyline' ||
                    it.type === 'polygon' ||
                    it.type === 'path'
                ) {
                    const pts = it.data?.points || [];
                    for (let i = 0; i < pts.length; i += 2)
                        pts[i + 1] = reflectY(pts[i + 1], oy);
                    it.data.points = pts;
                } else {
                    // y' = 2*oy - (y + h)
                    it.y = 2 * oy - (it.y + it.h);
                }
                it.bbox = calcBBox(it);
            }
        },
        skewShapes: (state, { payload }) => {
            const ids = getIds(payload);
            const kx = Number(payload?.kx ?? 0);
            const ky = Number(payload?.ky ?? 0);
            for (const it of state.list) {
                if (!ids.includes(it.id)) continue;
                const bb = calcBBox(it);
                const ox = payload?.origin?.x ?? bb.x + bb.w / 2;
                const oy = payload?.origin?.y ?? bb.y + bb.h / 2;

                if (
                    it.type === 'polyline' ||
                    it.type === 'polygon' ||
                    it.type === 'path'
                ) {
                    const pts = it.data?.points || [];
                    shearPoints(pts, kx, ky, ox, oy);
                    it.data.points = pts;
                } else {
                    // 사각형류는 꼭짓점 기준 근사 bbox 재산정
                    const tl = { x: it.x, y: it.y };
                    const tr = { x: it.x + it.w, y: it.y };
                    const bl = { x: it.x, y: it.y + it.h };
                    const br = { x: it.x + it.w, y: it.y + it.h };
                    const tx = (p) => {
                        const dx = p.x - ox,
                            dy = p.y - oy;
                        return { x: ox + dx + kx * dy, y: oy + dy + ky * dx };
                    };
                    const T = [tx(tl), tx(tr), tx(bl), tx(br)];
                    const minX = Math.min(...T.map((p) => p.x));
                    const maxX = Math.max(...T.map((p) => p.x));
                    const minY = Math.min(...T.map((p) => p.y));
                    const maxY = Math.max(...T.map((p) => p.y));
                    it.x = minX;
                    it.y = minY;
                    it.w = maxX - minX;
                    it.h = maxY - minY;
                }
                it.bbox = calcBBox(it);
            }
        },
    },
});

export const {
    replaceAllShapes,
    addShape,
    removeShapes,
    setShapeData,
    setShapeStyle,
    translateShapes,
    scaleShapes,
    rotateShapes,
    updatePolylineNode,
    insertPolylineNode,
    deletePolylineNode,
    flipHShapes,
    flipVShapes,
    skewShapes,
} = shapeSlice.actions;

export default shapeSlice.reducer;
