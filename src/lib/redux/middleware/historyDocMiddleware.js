import {
    pushPast,
    pushFuture,
    clearFuture,
    popPast,
    popFuture,
    undo,
    redo,
} from '../slice/historySlice';
import { markAllDirty } from '../slice/renderSlice';
import {
    replaceAll as replaceAllShapes,
    addShape,
    removeShapes,
    setShapeData,
    setShapeStyle,
    translateShapes,
    scaleShapes,
    rotateShapes,
    flipHShapes,
    flipVShapes,
    skewShapes,
    // 전용 추가 액션들(있으면 감지)
    addRectFromDrag,
    addEllipseFromDrag,
    addLineFromDrag,
    addPolygon,
    addPath,
    addStarFromDrag,
    addText,
} from '../slice/shapeSlice';
import { setSelection } from '../slice/selectionSlice';

// history(권장) → historyDoc(호환)
const pickHistory = (state) => state?.history ?? state?.historyDoc ?? {};

const MUTATION_TYPES = new Set(
    [
        // 생성
        addShape?.type,
        addRectFromDrag?.type,
        addEllipseFromDrag?.type,
        addLineFromDrag?.type,
        addPolygon?.type,
        addStarFromDrag?.type,
        addPath?.type,
        addText?.type,
        // 편집/변형
        removeShapes?.type,
        setShapeData?.type,
        setShapeStyle?.type,
        translateShapes?.type,
        scaleShapes?.type,
        rotateShapes?.type,
        flipHShapes?.type,
        flipVShapes?.type,
        skewShapes?.type,
    ].filter(Boolean)
); // undefined 방지

function makeSnapshot(rootState) {
    const shapes = rootState?.shape?.list ?? [];
    const selectionId = rootState?.selection?.id ?? null;
    return {
        shapes: JSON.parse(JSON.stringify(shapes)),
        selection: { id: selectionId },
    };
}

function applySnapshot(store, snap) {
    if (!snap) return;
    // fromHistory 플래그로 루프 방지 + replaceAll은 배열 payload
    store.dispatch({
        type: replaceAllShapes.type,
        payload: snap.shapes || [],
        meta: { fromHistory: true },
    });
    store.dispatch({
        type: setSelection.type,
        payload: snap.selection?.id ?? null,
        meta: { fromHistory: true },
    });
    store.dispatch({ type: markAllDirty.type, meta: { fromHistory: true } });
}

const getAppliedSnapshot = (state) => {
    const applied = pickHistory(state)?.applied;
    if (!applied) return null;
    return applied.snapshot ? applied.snapshot : applied;
};

export const historyDocMiddleware = (store) => (next) => (action) => {
    // 스냅샷 적용 중엔 기록 금지
    if (action?.meta?.fromHistory) return next(action);

    // UNDO
    if (action.type === undo.type) {
        const state = store.getState();
        const past = pickHistory(state)?.past || [];
        if (!past.length) return;

        const current = makeSnapshot(state);
        store.dispatch(pushFuture({ snapshot: current })); // 현재 → future
        store.dispatch(popPast()); // past → applied

        const snap = getAppliedSnapshot(store.getState());
        applySnapshot(store, snap);
        return;
    }

    // REDO
    if (action.type === redo.type) {
        const state = store.getState();
        const future = pickHistory(state)?.future || [];
        if (!future.length) return;

        const current = makeSnapshot(state);
        store.dispatch(pushPast({ snapshot: current })); // 현재 → past
        store.dispatch(popFuture()); // future → applied

        const snap = getAppliedSnapshot(store.getState());
        applySnapshot(store, snap);
        return;
    }

    // 변경 전 스냅샷
    let beforeSnap = null;
    if (MUTATION_TYPES.has(action.type))
        beforeSnap = makeSnapshot(store.getState());

    const result = next(action);

    if (beforeSnap) {
        store.dispatch(pushPast({ snapshot: beforeSnap }));
        store.dispatch(clearFuture());
    }
    return result;
};
