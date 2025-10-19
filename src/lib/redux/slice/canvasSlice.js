// import { createSlice } from '@reduxjs/toolkit';
// import { DEFAULT } from '../constant/default';

// import { coerceSize } from '../util/guide';
// import { REDUCER_NAME } from '../constant/name';

// /**
//  * @file canvasSlice.js
//  * @author YJH
//  * @description 캔버스 관련 상태 관리
//  * @see {@link DEFAULT.CANVAS} 기본 캔버스 상태
//  * @see {@link coerceSize}  양수인 경우 숫자 반환 그 외의 경우 fallback 반환
//  */
// const canvasSlice = createSlice({
//     name: REDUCER_NAME.CANVAS,
//     initialState: DEFAULT.CANVAS,

//     reducers: {
//         /**
//          * @description 캔버스 크기 변경
//          * @param {object} payload
//          * @param {number|string} payload.width - 캔버스 너비
//          * @param {number|string} payload.height - 캔버스 높이
//          * @return {void}
//          */
//         setSize: (state, { payload }) => {
//             state.width = coerceSize(payload?.width, state.width);
//             state.height = coerceSize(payload?.height, state.height);
//         },
//         /**
//          * @description 캔버스 배경 설정
//          * @param {string|null} payload - 캔버스 배경색 또는 이미지 URL
//          * @return {void}
//          */
//         setBackground: (state, { payload }) => {
//             state.background = payload ?? null;
//         },
//         /**
//          * @description 그리드 설정 변경
//          * @param {object} payload
//          * @param {boolean} [payload.enabled] - 그리드 사용 여부
//          * @param {number|string} [payload.size] - 그리드 크기
//          * @return {void}
//          */
//         setGrid: (state, { payload }) => {
//             if (payload?.enabled != null)
//                 state.grid.enabled = !!payload.enabled;
//             if (payload?.size != null)
//                 state.grid.size = coerceSize(payload.size, state.grid.size);
//         },
//         /**
//          * @description 캔버스 상태를 payload로 대체
//          * @param {object} payload
//          * @param {number|string} payload.width - 캔버스 너비
//          * @param {number|string} payload.height - 캔버스 높이
//          * @param {string|null} payload.background - 캔버스 배경색 또는 이미지 URL
//          * @param {object} payload.grid - 그리드 설정
//          * @param {boolean} payload.grid.enabled - 그리드 사용 여부
//          * @param {number|string} payload.grid.size - 그리드 크기
//          * @return {object} 새로운 캔버스 상태
//          */
//         replaceAll: (state, { payload }) => ({
//             width: coerceSize(payload?.width, DEFAULT.CANVAS.width),
//             height: coerceSize(payload?.height, DEFAULT.CANVAS.height),
//             background: payload?.background ?? null,
//             grid: {
//                 enabled: Boolean(payload?.grid?.enabled),
//                 size: coerceSize(payload?.grid?.size, DEFAULT.CANVAS.grid.size),
//             },
//         }),
//         /**
//          * @description 캔버스 상태를 초기 상태로 재설정
//          * @return {object} 캔버스 초기 값
//          */
//         reset: () => DEFAULT.CANVAS,
//     },
// });

// export const { replaceAll, setSize, setBackground, setGrid, reset } =
//     canvasSlice.actions;
// export default canvasSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    shapes: [
        {
            id: 1,
            pickId: 1,
            type: 'rect',
            x: 40,
            y: 40,
            w: 200,
            h: 120,
            stroke: '#333',
            fill: '#fff',
            strokeWidth: 2,
        },
    ],
    focusId: null,
    nextId: 2,
};

const canvasSlice = createSlice({
    name: 'canvas',
    initialState,
    reducers: {
        setFocus(state, action) {
            state.focusId = action.payload ?? null;
        },
        clearFocus(state) {
            state.focusId = null;
        },
        addShape(state, action) {
            const base = action.payload || {};
            const id = state.nextId++;
            const shape = {
                id,
                pickId: id,
                type: base.type,
                x: base.x,
                y: base.y,
                w: base.w,
                h: base.h,
                stroke: base.stroke ?? '#333',
                fill: base.type === 'line' ? undefined : (base.fill ?? '#fff'),
                strokeWidth: base.strokeWidth ?? 2,
            };
            if (shape.type === 'polygon') shape.sides = base.sides ?? 5;
            if (shape.type === 'star') {
                shape.points = base.points ?? 5;
                shape.innerRatio = base.innerRatio ?? 0.5;
            }
            if (shape.type === 'path') {
                shape.path = Array.isArray(base.path) ? base.path : [];
                shape.fill = undefined;
            }

            state.shapes.push(shape);
            state.focusId = id;
        },
        moveShape(state, action) {
            const { id, dx, dy } = action.payload;
            const s = state.shapes.find((v) => v.id === id);
            if (s) {
                s.x += dx;
                s.y += dy;
            }
        },
        resizeShape(state, action) {
            const { id, x, y, w, h } = action.payload;
            const s = state.shapes.find((v) => v.id === id);
            if (s) {
                s.x = x;
                s.y = y;
                s.w = w;
                s.h = h;
            }
        },
        deleteFocused(state) {
            if (state.focusId == null) return;
            state.shapes = state.shapes.filter((s) => s.id !== state.focusId);
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
} = canvasSlice.actions;

export const selectShapes = (st) => st.canvas.shapes;
export const selectFocusId = (st) => st.canvas.focusId;

export default canvasSlice.reducer;
