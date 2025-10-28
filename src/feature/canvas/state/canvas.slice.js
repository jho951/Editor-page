import { createSlice, createAction } from '@reduxjs/toolkit';
import { CAMVAS_STATE, CANVAS_NAME } from './canvas.initial';

/**
 *  @file canvasSlice.js
 *  @author YJH
 *  @description
 *  캔버스 상의 도형 편집을 위한 Redux slice
 *  Undo/Redo를 위한 과거/미래 스택을 관리
 *  도형 생성/이동/리사이즈/텍스트/스타일/경로 편집
 */

/**
 * @property {number} u 0~1 정규화 x 좌표 (shape의 local 좌표계)
 * @property {number} v 0~1 정규화 y 좌표 (shape의 local 좌표계)
 * @property {number} id 고유 정수 ID (UI/선택용)
 * @property {number} pickId 히트픽킹용 ID (보통 id와 동일)
 * @property {'rect'|'ellipse'|'line'|'polygon'|'star'|'path'|'text'} type 도형 타입
 * @property {number} x 캔버스 상의 좌상단 X
 * @property {number} y 캔버스 상의 좌상단 Y
 * @property {number} w 너비
 * @property {number} h 높이
 * @property {string} [stroke] 선 색상 (CSS 색상)
 * @property {string} [fill] 채움 색상 (line은 보통 없음)
 * @property {number} [strokeWidth] 선 두께
 * @property {number} [sides] polygon/star 등에서 쓰는 변/꼭짓점 수
 * @property {Array<[number,number]>} [points] polygon의 정점 points 등 (선택)
 * @property {number} [innerRatio] star 내각 비율 등
 * @property {PathPoint[]} [path] path 타입일 때 u/v 포인트 배열
 * @property {string} [text] 텍스트 내용 (text 타입일 때)
 * @property {string} [font] 폰트 스타일(e.g., '16px Inter')
 * @property {string} [color] 텍스트 색상
 * @property {'left'|'center'|'right'} [align] 텍스트 정렬
 * @property {number} [lineHeight] 텍스트 줄 간격
 */

const MAX_HISTORY = 10;
/**
 * 깊은 복제: shapes 배열 내부의 원시값/얕은객체를 안전 복제한다.
 * redux state 스냅샷 용도로 사용(히스토리 저장)
 * @param {Shape[]} shapes
 * @returns {Shape[]}
 */
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

        sides: s.sides,
        points: s.points,
        innerRatio: s.innerRatio,

        path: Array.isArray(s.path)
            ? s.path.map((p) => ({ u: p.u, v: p.v }))
            : undefined,

        text: s.text,
        font: s.font,
        color: s.color,
        align: s.align,
        lineHeight: s.lineHeight,
    }));
}

/**
 * 현재 state에서 Undo/Redo 스냅샷을 만든다.
 * @param {any} state
 * @returns {{shapes: Shape[], focusId: number|null, nextId: number}}
 */
function snapshot(state) {
    return {
        shapes: cloneShapes(state.shapes),
        focusId: state.focusId,
        nextId: state.nextId,
    };
}

const canvasSlice = createSlice({
    name: CANVAS_NAME,
    initialState: CAMVAS_STATE,
    reducers: {
        /**
         * 히스토리 시작: 현재 상태를 past 스택에 저장.
         * 이 후 이어지는 변경들은 "한 단위"의 작업으로 묶인다.
         * future는 비운다(새 브랜치 시작).
         */
        historyStart(state) {
            state.past.push(snapshot(state));
            if (state.past.length > MAX_HISTORY) state.past.shift();
            state.future = [];
        },

        /** Undo: 과거로 한 단계 되돌리기 */
        undo(state) {
            if (state.past.length === 0) return;
            const prev = state.past.pop();
            state.future.push(snapshot(state));
            if (state.future.length > MAX_HISTORY) state.future.shift();

            state.shapes = prev.shapes;
            state.focusId = prev.focusId;
            state.nextId = prev.nextId;
        },

        /** Redo: 미래로 한 단계 되돌리기 취소 */
        redo(state) {
            if (state.future.length === 0) return;
            const next = state.future.pop();
            state.past.push(snapshot(state));

            state.shapes = next.shapes;
            state.focusId = next.focusId;
            state.nextId = next.nextId;
        },

        /** 현재 포커스된 도형 ID 설정 */
        setFocus(state, action) {
            state.focusId = action.payload;
        },

        /** 포커스 해제 */
        clearFocus(state) {
            state.focusId = null;
        },

        /**
         * 도형 추가
         * @param {Shape & Partial<Shape>} action.payload 기본값 패치
         * 규칙:
         *  - id/pickId는 nextId에서 발급
         *  - line은 fill을 보통 사용하지 않음
         *  - text 타입의 fill은 선택적으로 허용(투명 배경 텍스트 등)
         */
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

                // 기하/스타 계열
                sides: base.sides,
                points: base.points,
                innerRatio: base.innerRatio,

                // path 계열
                path: base.path,

                // 텍스트
                text: base.text,
                font: base.font,
                color: base.color,
                align: base.align,
                lineHeight: base.lineHeight,
            });

            state.focusId = id;
        },

        /** 도형 이동 (dx, dy 만큼) */
        moveShape(state, action) {
            const { id, dx, dy } = action.payload;
            const s = state.shapes.find((v) => v.id === id);
            if (!s) return;
            s.x += dx;
            s.y += dy;
        },

        /** 도형 리사이즈 (절대 좌표로 대입) */
        resizeShape(state, action) {
            const { id, x, y, w, h } = action.payload;
            const s = state.shapes.find((v) => v.id === id);
            if (!s) return;
            s.x = x;
            s.y = y;
            s.w = w;
            s.h = h;
        },

        /** 현재 포커스된 도형 삭제 */
        deleteFocused(state) {
            if (state.focusId == null) return;
            state.shapes = state.shapes.filter((v) => v.id !== state.focusId);
            state.focusId = null;
        },

        /** 텍스트 내용 변경 (text 타입만) */
        updateText(state, action) {
            const { id, text } = action.payload;
            const s = state.shapes.find(
                (v) => v.id === id && v.type === 'text'
            );
            if (s) s.text = text ?? '';
        },

        /**
         * 텍스트 스타일 변경 (부분 업데이트)
         * - font/color/align/lineHeight 중 넘겨진 값만 패치
         */
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

        /**
         * 전체 교체 (로드/리셋 용)
         * - shapes를 통째로 바꾸고, nextId/포커스/히스토리를 초기화한다.
         */
        replaceAll(state, action) {
            const shapes = action.payload?.shapes || [];
            state.shapes = shapes;
            const maxId = shapes.reduce((m, s) => Math.max(m, s.id || 0), 0);
            state.nextId = Math.max(1, maxId + 1);
            state.focusId = null;
            state.past = [];
            state.future = [];
        },

        /**
         * Path 노드 이동(정규화 좌표로 환산하여 저장)
         * - path 타입만 대상
         * - shape의 (x,y,w,h) 기준으로 u,v(0~1)로 변환해 포인트를 업데이트
         */
        updatePathNode(state, action) {
            const { id, index, x, y } = action.payload;
            const s = state.shapes.find(
                (v) => v.id === id && v.type === 'path'
            );
            if (!s || !Array.isArray(s.path) || s.w === 0 || s.h === 0) return;

            const u = (x - s.x) / (s.w || 1);
            const v = (y - s.y) / (s.h || 1);
            if (s.path[index]) {
                s.path[index].u = Math.max(0, Math.min(1, u));
                s.path[index].v = Math.max(0, Math.min(1, v));
            }
        },

        /**
         * Path 노드 추가
         * - index 뒤에 새 포인트 삽입
         */
        insertPathNode(state, action) {
            const { id, index, x, y } = action.payload;
            const s = state.shapes.find(
                (v) => v.id === id && v.type === 'path'
            );
            if (!s || !Array.isArray(s.path)) return;

            const u = (x - s.x) / (s.w || 1);
            const v = (y - s.y) / (s.h || 1);
            s.path.splice(index + 1, 0, {
                u: Math.max(0, Math.min(1, u)),
                v: Math.max(0, Math.min(1, v)),
            });
        },

        /**
         * Path 노드 삭제
         * - 최소 2개 이상 남도록 보호(<=2면 삭제 불가)
         */
        deletePathNode(state, action) {
            const { id, index } = action.payload;
            const s = state.shapes.find(
                (v) => v.id === id && v.type === 'path'
            );
            if (!s || !Array.isArray(s.path) || s.path.length <= 2) return;
            s.path.splice(index, 1);
        },
    },

    /**
     * 외부 액션에 대한 추가 처리
     * - 여기서는 스타일 업데이트를 독립 액션으로 분리해 처리한다.
     */
    extraReducers: (builder) => {
        builder.addCase(updateShapeStyle, (state, action) => {
            const { id, patch } = action.payload || {};
            const s = state.shapes.find((v) => v.id === id);
            if (!s) return;

            if (patch.stroke !== undefined) s.stroke = patch.stroke;

            if (patch.fill !== undefined) {
                if (s.type !== 'line') {
                    s.fill = patch.fill;
                }
            }
            if (patch.strokeWidth !== undefined) {
                s.strokeWidth = Number(patch.strokeWidth) || 1;
            }
            if (patch.color !== undefined) s.color = patch.color;
        });
    },

    rotateFocused(state, action) {
        const deg = action.payload || 0;
        const id = state.focusId;
        if (!id) return;
        const shape = state.shapes.find((s) => s.id === id);
        if (!shape) return;
        shape.rotation = ((shape.rotation || 0) + deg) % 360;
    },
});

/* ===================== 액션/셀렉터/리듀서 export ===================== */
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
    updatePathNode,
    insertPathNode,
    deletePathNode,
    undo,
    redo,
    rotateFocused,
    // resetAll, // ← 구현이 없으므로 내보내면 오류. 필요하면 reducer 추가하세요.
    replaceAll,
} = canvasSlice.actions;

/**
 * 외부에서 스타일 패치를 보낼 때 사용하는 독립 액션
 * @example
 * dispatch(updateShapeStyle({ id: 10, patch: { stroke: '#000', fill: '#fff' } }))
 */
export const updateShapeStyle = createAction('canvas/updateShapeStyle');
export default canvasSlice.reducer;
