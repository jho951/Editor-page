import { createSlice, createAction } from '@reduxjs/toolkit';
export const updateShapeStyle = createAction('canvas/updateShapeStyle');

const initialState = {
    shapes: [],
    focusId: null,
    nextId: 1,
    past: [], // ← undo 스택
    future: [], // ← redo 스택
};

const MAX_HISTORY = 100;

function cloneShapes(shapes) {
    return shapes.map((s) => ({
        id: s.id,
        pickId: s.pickId,
        type: s.type,
        x: s.x,
        y: s.y,
        w: s.w,
        h: s.h,
        stroke: s.stroke,
        fill: s.fill,
        strokeWidth: s.strokeWidth,
        // polygon/star
        sides: s.sides,
        points: s.points,
        innerRatio: s.innerRatio,
        // freedraw path (u,v 배열)
        path: Array.isArray(s.path)
            ? s.path.map((p) => ({ u: p.u, v: p.v }))
            : undefined,
        // text
        text: s.text,
        font: s.font,
        color: s.color,
        align: s.align,
        lineHeight: s.lineHeight,
    }));
}

function snapshot(state) {
    return {
        shapes: cloneShapes(state.shapes),
        focusId: state.focusId,
        nextId: state.nextId,
    };
}
const canvasSlice = createSlice({
    name: 'canvas',
    initialState,
    reducers: {
        historyStart(state) {
            state.past.push(snapshot(state));
            if (state.past.length > MAX_HISTORY) state.past.shift();
            state.future = [];
        },
        undo(state) {
            if (state.past.length === 0) return;
            const prev = state.past.pop();
            state.future.push(snapshot(state));
            if (state.future.length > MAX_HISTORY) state.future.shift();
            state.shapes = prev.shapes;
            state.focusId = prev.focusId;
            state.nextId = prev.nextId;
        },
        redo(state) {
            if (state.future.length === 0) return;
            const next = state.future.pop();
            state.past.push(snapshot(state));
            state.shapes = next.shapes;
            state.focusId = next.focusId;
            state.nextId = next.nextId;
        },

        setFocus(state, action) {
            state.focusId = action.payload;
        },
        clearFocus(state) {
            state.focusId = null;
        },

        addShape(state, action) {
            const base = action.payload || {};
            const id = state.nextId++;
            state.shapes.push({
                id,
                pickId: id,
                type: base.type || 'rect',
                x: base.x,
                y: base.y,
                w: base.w,
                h: base.h,
                stroke: base.stroke ?? '#333',
                fill:
                    base.type === 'line'
                        ? undefined
                        : base.type === 'text'
                          ? (base.fill ?? undefined)
                          : (base.fill ?? '#fff'),
                strokeWidth: base.strokeWidth ?? 2,
                sides: base.sides,
                points: base.points,
                innerRatio: base.innerRatio,
                path: base.path, // freedraw
                text: base.text,
                font: base.font,
                color: base.color,
                align: base.align,
                lineHeight: base.lineHeight, // text
            });
            state.focusId = id;
        },

        moveShape(state, action) {
            const { id, dx, dy } = action.payload;
            const s = state.shapes.find((v) => v.id === id);
            if (!s) return;
            s.x += dx;
            s.y += dy;
        },

        resizeShape(state, action) {
            const { id, x, y, w, h } = action.payload;
            const s = state.shapes.find((v) => v.id === id);
            if (!s) return;
            s.x = x;
            s.y = y;
            s.w = w;
            s.h = h;
        },

        deleteFocused(state) {
            if (state.focusId == null) return;
            state.shapes = state.shapes.filter((v) => v.id !== state.focusId);
            state.focusId = null;
        },

        updateText(state, action) {
            const { id, text } = action.payload;
            const s = state.shapes.find(
                (v) => v.id === id && v.type === 'text'
            );
            if (s) s.text = text ?? '';
        },
        setTextStyle(state, action) {
            const {
                id,
                font = null,
                color = null,
                align = null,
                lineHeight = null,
            } = action.payload;
            const s = state.shapes.find(
                (v) => v.id === id && v.type === 'text'
            );
            if (!s) return;
            if (font != null) s.font = font;
            if (color != null) s.color = color;
            if (align != null) s.align = align;
            if (lineHeight != null) s.lineHeight = lineHeight;
        },
        resetAll(state) {
            state.shapes = [];
            state.focusId = null;
            state.nextId = 1;
            state.past = [];
            state.future = [];
        },
    },
    extraReducers: (builder) => {
        builder.addCase(updateShapeStyle, (state, action) => {
            const { id, patch } = action.payload || {};
            const s = state.shapes.find((v) => v.id === id);
            if (!s) return;
            // 필요한 키만 덮어쓰기
            if (patch.stroke !== undefined) s.stroke = patch.stroke;
            if (patch.fill !== undefined) {
                if (s.type === 'line') {
                    // 라인은 면 없음: 무시하거나, 별도 정책으로 저장하지 않음
                } else {
                    s.fill = patch.fill;
                }
            }
            if (patch.strokeWidth !== undefined)
                s.strokeWidth = Number(patch.strokeWidth) || 1;
            // 텍스트 색(도형 타입에 따라 선택)
            if (patch.color !== undefined) s.color = patch.color;
        });
    },
});

export const {
    setFocus,
    clearFocus,
    addShape,
    moveShape,
    resizeShape,
    deleteFocused,
    updateText,
    setTextStyle,
    historyStart,
    undo,
    redo,
    resetAll,
} = canvasSlice.actions;

export const selectShapes = (s) => s.canvas.shapes;
export const selectFocusId = (s) => s.canvas.focusId;
export default canvasSlice.reducer;
