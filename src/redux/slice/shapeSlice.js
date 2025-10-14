import { createSlice, nanoid } from '@reduxjs/toolkit';
import {
    multiply,
    translate,
    rotate as R,
    scale as S,
    skewX as KX,
    skewY as KY,
    around,
} from '../../util/matrix';

// 간단한 bbox 유틸 (rect/ellipse/line 등에서 사용).
// 실제 앱에서는 실제 좌표/points로부터 bbox를 계산하도록 교체 가능.
const getBBox = (shape) => {
    if (shape.bbox) return shape.bbox;
    // fallback: rect-like
    const { x = 0, y = 0, w = 0, h = 0 } = shape;
    return { x, y, w, h };
};

const initialState = {
    // 예: {id,type, x,y,w,h, style, matrix:[a,b,c,d,e,f], bbox?}
    list: [],
};

const applyMatrixToShape = (shape, M) => {
    // 행렬 합성: shape.matrix = shape.matrix * M
    const cur = shape.matrix || [1, 0, 0, 1, 0, 0];
    const next = multiply(cur, M);
    shape.matrix = next;
};

const shapeSlice = createSlice({
    name: 'shapes',
    initialState,
    reducers: {
        addShape: {
            prepare: (partial) => ({
                payload: {
                    id: nanoid(),
                    type: partial.type || 'rect',
                    x: partial.x ?? 0,
                    y: partial.y ?? 0,
                    w: partial.w ?? 0,
                    h: partial.h ?? 0,
                    style: partial.style || {
                        stroke: '#333',
                        fill: '#fff',
                        strokeWidth: 2,
                    },
                    matrix: partial.matrix || [1, 0, 0, 1, 0, 0],
                    bbox: partial.bbox || null,
                    data: partial.data || null,
                },
            }),
            reducer: (s, { payload }) => {
                s.list.push(payload);
            },
        },
        setShapeStyle: (s, { payload }) => {
            const { ids = [], style = {} } = payload || {};
            s.list.forEach((sh) => {
                if (ids.includes(sh.id)) Object.assign(sh.style, style);
            });
        },
        translateShapes: (s, { payload }) => {
            const { ids = [], dx = 0, dy = 0 } = payload || {};
            const T = translate(dx, dy);
            s.list.forEach((sh) => {
                if (ids.includes(sh.id)) applyMatrixToShape(sh, T);
            });
        },
        rotateShapes: (s, { payload }) => {
            const { ids = [], deg = 90 } = payload || {};
            s.list.forEach((sh) => {
                if (!ids.includes(sh.id)) return;
                const { x, y, w, h } = getBBox(sh);
                const mx = x + w / 2,
                    my = y + h / 2;
                const M = around(mx, my, R(deg));
                applyMatrixToShape(sh, M);
            });
        },
        flipHShapes: (s, { payload }) => {
            const { ids = [] } = payload || {};
            s.list.forEach((sh) => {
                if (!ids.includes(sh.id)) return;
                const { x, y, w, h } = getBBox(sh);
                const mx = x + w / 2,
                    my = y + h / 2;
                const M = around(mx, my, S(-1, 1));
                applyMatrixToShape(sh, M);
            });
        },
        flipVShapes: (s, { payload }) => {
            const { ids = [] } = payload || {};
            s.list.forEach((sh) => {
                if (!ids.includes(sh.id)) return;
                const { x, y, w, h } = getBBox(sh);
                const mx = x + w / 2,
                    my = y + h / 2;
                const M = around(mx, my, S(1, -1));
                applyMatrixToShape(sh, M);
            });
        },
        skewShapes: (s, { payload }) => {
            const { ids = [], xDeg = 0, yDeg = 0 } = payload || {};
            s.list.forEach((sh) => {
                if (!ids.includes(sh.id)) return;
                const { x, y, w, h } = getBBox(sh);
                const mx = x + w / 2,
                    my = y + h / 2;
                // KX, KY 순서 합성(필요 시 조정)
                const M = around(mx, my, multiply(KX(xDeg), KY(yDeg)));
                applyMatrixToShape(sh, M);
            });
        },
        scaleShapes: (s, { payload }) => {
            const { ids = [], sx = 1, sy = 1 } = payload || {};
            s.list.forEach((sh) => {
                if (!ids.includes(sh.id)) return;
                const { x, y, w, h } = getBBox(sh);
                const mx = x + w / 2,
                    my = y + h / 2;
                const M = around(mx, my, S(sx, sy));
                applyMatrixToShape(sh, M);
            });
        },
        // undo/redo에서 상태 통째로 교체할 때 사용
        replaceAllShapes: (s, { payload }) => {
            s.list = Array.isArray(payload) ? payload : [];
        },
    },
});

export const {
    addShape,
    setShapeStyle,
    translateShapes,
    rotateShapes,
    flipHShapes,
    flipVShapes,
    skewShapes,
    scaleShapes,
    replaceAllShapes,
} = shapeSlice.actions;

export default shapeSlice.reducer;
