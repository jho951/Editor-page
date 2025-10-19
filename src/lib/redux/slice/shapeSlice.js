import { createSlice } from '@reduxjs/toolkit';
import { REDUCER_NAME } from '../constant/name';
import { DEFAULT } from '../constant/initial';
import {
    calcBBox,
    endpointsToLine,
    lineToEndpoints,
    makeStarPoints,
    reflectX,
    reflectY,
    shearPoints,
} from '../util/calc';
import { genId } from '../../../util/get-id';
import { clamp, ensureArray, getId, normRect } from '../util/guide';

const shapeSlice = createSlice({
    name: REDUCER_NAME.SHAPE,
    initialState: DEFAULT.SHAPE,
    reducers: {
        // 전체 교체(스냅샷 복원 등에 사용)
        replaceAll: (state, { payload }) => {
            state.list = Array.isArray(payload)
                ? payload.map((s) => ({ ...s, bbox: s.bbox ?? calcBBox(s) }))
                : [];
        },

        // 범용 추가(기존 경로와 호환)
        addShape: (state, { payload }) => {
            const s = {
                id: payload.id ?? genId(),
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

        // 삭제
        removeShapes: (state, { payload }) => {
            const ids = ensureArray(payload);
            state.list = state.list.filter((s) => !ids.includes(s.id));
        },

        // 데이터(점/텍스트 등) 갱신
        setShapeData: (state, { payload }) => {
            const it = state.list.find((x) => x.id === payload.id);
            if (!it) return;
            it.data = { ...(it.data || {}), ...(payload.data || {}) };
            it.bbox = calcBBox(it);
        },

        // 스타일 일괄 갱신
        setShapeStyle: (state, { payload }) => {
            const ids = ensureArray(payload.ids);
            for (const it of state.list) {
                if (ids.includes(it.id)) {
                    it.style = {
                        ...(it.style || {}),
                        ...(payload.style || {}),
                    };
                }
            }
        },

        /* ------------------------------- 생성(헤더용) ------------------------------- */

        // 사각형: 드래그 박스 그대로
        addRectFromDrag: (state, { payload }) => {
            const { x0, y0, x1, y1, style } = payload;
            const { x, y, w, h } = normRect(x0, y0, x1, y1);
            const s = {
                id: genId(),
                type: 'rect',
                x,
                y,
                w,
                h,
                style: style ?? { stroke: '#333', fill: null, strokeWidth: 1 },
                data: null,
                matrix: [1, 0, 0, 1, 0, 0],
            };
            s.bbox = calcBBox(s);
            state.list.push(s);
        },

        // 타원(원): 프레임(x,y,w,h)로 저장 (드래그 박스 그대로)
        addEllipseFromDrag: (state, { payload }) => {
            const { x0, y0, x1, y1, style } = payload;
            const { x, y, w, h } = normRect(x0, y0, x1, y1);
            const s = {
                id: genId(),
                type: 'ellipse',
                x,
                y,
                w,
                h,
                style: style ?? { stroke: '#333', fill: null, strokeWidth: 1 },
                data: null,
                matrix: [1, 0, 0, 1, 0, 0],
            };
            s.bbox = calcBBox(s);
            state.list.push(s);
        },

        // 직선: 시작(x1,y1)→끝(x2,y2)로 입력받아 프레임으로 변환
        addLineFromDrag: (state, { payload }) => {
            const { x1, y1, x2, y2, style } = payload;
            const { x, y, w, h } = endpointsToLine({ x1, y1, x2, y2 });
            const s = {
                id: genId(),
                type: 'line',
                x,
                y,
                w,
                h,
                style: style ?? { stroke: '#333', fill: null, strokeWidth: 1 },
                data: null,
                matrix: [1, 0, 0, 1, 0, 0],
            };
            s.bbox = calcBBox(s);
            state.list.push(s);
        },

        // 별 → polygon으로 생성
        addStarFromDrag: (state, { payload }) => {
            const {
                x0,
                y0,
                x1,
                y1,
                spikes = 5,
                innerRatio = 0.5,
                rotateRad,
                style,
            } = payload;
            const { x, y, w, h } = normRect(x0, y0, x1, y1);
            const cx = x + w / 2,
                cy = y + h / 2;
            const R = Math.max(w, h) / 2;
            const pts = makeStarPoints(
                cx,
                cy,
                R,
                innerRatio,
                spikes,
                rotateRad
            );
            const s = {
                id: genId(),
                type: 'polygon',
                x: 0,
                y: 0,
                w: 0,
                h: 0,
                style: style ?? { stroke: '#333', fill: null, strokeWidth: 1 },
                data: { points: pts },
                matrix: [1, 0, 0, 1, 0, 0],
            };
            s.bbox = calcBBox(s);
            state.list.push(s);
        },

        // 다각형: 점 배열
        addPolygon: (state, { payload }) => {
            const { points, style } = payload;
            const s = {
                id: genId(),
                type: 'polygon',
                x: 0,
                y: 0,
                w: 0,
                h: 0,
                style: style ?? { stroke: '#333', fill: null, strokeWidth: 1 },
                data: { points: points.slice() },
                matrix: [1, 0, 0, 1, 0, 0],
            };
            s.bbox = calcBBox(s);
            state.list.push(s);
        },

        // 프리드로우: 점 배열
        addPath: (state, { payload }) => {
            const { points, style } = payload;
            const s = {
                id: genId(),
                type: 'path',
                x: 0,
                y: 0,
                w: 0,
                h: 0,
                style: style ?? { stroke: '#333', fill: null, strokeWidth: 1 },
                data: { points: points.slice() },
                matrix: [1, 0, 0, 1, 0, 0],
            };
            s.bbox = calcBBox(s);
            state.list.push(s);
        },

        // 텍스트(초기치; 렌더에서 실제 w/h 측정 후 setShapeData로 보정 권장)
        addText: (state, { payload }) => {
            const { x, y, text = '', style } = payload;
            const s = {
                id: genId(),
                type: 'text',
                x,
                y,
                w: 0,
                h: 0,
                style: style ?? { fill: '#333' },
                data: { text },
                matrix: [1, 0, 0, 1, 0, 0],
            };
            s.bbox = calcBBox(s);
            state.list.push(s);
        },

        /* --------------------------------- 변형들 --------------------------------- */
        // (A) 이동: 항상 새 배열/새 객체
        translateShapes: (state, { payload }) => {
            const ids = new Set(
                Array.isArray(payload.ids) ? payload.ids : [payload.ids]
            );
            state.list = state.list.map((s) => {
                if (!ids.has(s.id)) return s;
                let next = { ...s };

                if (
                    next.type === 'polyline' ||
                    next.type === 'polygon' ||
                    next.type === 'path'
                ) {
                    const pts = [...(next.data?.points || [])];
                    for (let i = 0; i < pts.length; i += 2) {
                        pts[i] += payload.dx;
                        pts[i + 1] += payload.dy;
                    }
                    next = {
                        ...next,
                        data: { ...(next.data || {}), points: pts },
                    };
                } else {
                    next = {
                        ...next,
                        x: next.x + payload.dx,
                        y: next.y + payload.dy,
                    };
                }

                next.bbox = calcBBox(next);
                return next;
            });
        },

        // (B) 스케일: 항상 새 배열/새 객체
        scaleShapes: (state, { payload }) => {
            const ids = new Set(
                Array.isArray(payload.ids) ? payload.ids : [payload.ids]
            );
            const ox = payload.origin?.x ?? null;
            const oy = payload.origin?.y ?? null;
            const sx = Number(payload.sx ?? 1);
            const sy = Number(payload.sy ?? 1);
            const scalePt = (x, y) =>
                ox != null && oy != null
                    ? [ox + (x - ox) * sx, oy + (y - oy) * sy]
                    : [x * sx, y * sy];

            state.list = state.list.map((s) => {
                if (!ids.has(s.id)) return s;
                let next = { ...s };

                if (
                    next.type === 'polyline' ||
                    next.type === 'polygon' ||
                    next.type === 'path'
                ) {
                    const pts = [...(next.data?.points || [])];
                    for (let i = 0; i < pts.length; i += 2) {
                        const [nx, ny] = scalePt(pts[i], pts[i + 1]);
                        pts[i] = nx;
                        pts[i + 1] = ny;
                    }
                    next = {
                        ...next,
                        data: { ...(next.data || {}), points: pts },
                    };
                } else {
                    let nx = next.x,
                        ny = next.y;
                    if (ox != null && oy != null)
                        [nx, ny] = scalePt(next.x, next.y);
                    else {
                        nx = next.x * sx;
                        ny = next.y * sy;
                    }
                    next = {
                        ...next,
                        x: nx,
                        y: ny,
                        w: next.w * sx,
                        h: next.h * sy,
                    };
                }

                next.bbox = calcBBox(next);
                return next;
            });
        },

        rotateShapes: (state, { payload }) => {
            const ids = ensureArray(payload.ids);
            const deg = Number(payload.deg ?? 0);
            const rad = (deg * Math.PI) / 180;
            const c = Math.cos(rad),
                s = Math.sin(rad);
            const ox = payload.origin?.x ?? null,
                oy = payload.origin?.y ?? null;

            const rot = (x, y) => {
                if (ox == null || oy == null) return [x, y];
                const dx = x - ox,
                    dy = y - oy;
                return [ox + dx * c - dy * s, oy + dx * s + dy * c];
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
                } else if (it.type === 'line') {
                    // 끝점 회전 → 프레임 재설정
                    const { x1, y1, x2, y2 } = lineToEndpoints(it);
                    const A = rot(x1, y1);
                    const B = rot(x2, y2);
                    Object.assign(
                        it,
                        endpointsToLine({
                            x1: A[0],
                            y1: A[1],
                            x2: B[0],
                            y2: B[1],
                        })
                    );
                } else {
                    const [nx, ny] = rot(it.x, it.y);
                    it.x = nx;
                    it.y = ny;
                }
                it.bbox = calcBBox(it);
            }
        },

        // 노드 편집(폴리라인/폴리곤/패스)
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

        // 좌우/상하 반전
        flipHShapes: (state, { payload }) => {
            const ids = ensureArray(getId(payload));
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
                } else if (it.type === 'line') {
                    const { x1, y1, x2, y2 } = lineToEndpoints(it);
                    const A = [reflectX(x1, ox), y1];
                    const B = [reflectX(x2, ox), y2];
                    Object.assign(
                        it,
                        endpointsToLine({
                            x1: A[0],
                            y1: A[1],
                            x2: B[0],
                            y2: B[1],
                        })
                    );
                } else {
                    it.x = 2 * ox - (it.x + it.w);
                }
                it.bbox = calcBBox(it);
            }
        },
        flipVShapes: (state, { payload }) => {
            const ids = ensureArray(getId(payload));
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
                } else if (it.type === 'line') {
                    const { x1, y1, x2, y2 } = lineToEndpoints(it);
                    const A = [x1, reflectY(y1, oy)];
                    const B = [x2, reflectY(y2, oy)];
                    Object.assign(
                        it,
                        endpointsToLine({
                            x1: A[0],
                            y1: A[1],
                            x2: B[0],
                            y2: B[1],
                        })
                    );
                } else {
                    it.y = 2 * oy - (it.y + it.h);
                }
                it.bbox = calcBBox(it);
            }
        },

        // 기울이기
        skewShapes: (state, { payload }) => {
            const ids = ensureArray(getId(payload));
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
                } else if (it.type === 'line') {
                    const pts = Object.values(lineToEndpoints(it));
                    shearPoints(pts, kx, ky, ox, oy);
                    const [x1, y1, x2, y2] = pts;
                    Object.assign(it, endpointsToLine({ x1, y1, x2, y2 }));
                } else {
                    // 프레임형 근사: 꼭짓점 시어 → 새 프레임
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
    replaceAll,
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
    addRectFromDrag,
    addEllipseFromDrag,
    addLineFromDrag,
    addPolygon,
    addPath,
    addStarFromDrag,
    addText,
} = shapeSlice.actions;

export default shapeSlice.reducer;
