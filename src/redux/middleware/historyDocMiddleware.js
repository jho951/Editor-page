import {
    pushPast,
    pushFuture,
    clearFuture,
    popPast,
    popFuture,
} from '../slice/historyDocSlice';

import {
    replaceAllShapes,
    addShape,
    setShapeStyle,
    translateShapes,
    rotateShapes,
    flipHShapes,
    flipVShapes,
    skewShapes,
    scaleShapes,
} from '../slice/shapeSlice';

import { setSelection, clearSelection } from '../slice/selectionSlice';

export const HISTORY_UNDO = 'history/UNDO';
export const HISTORY_REDO = 'history/REDO';
export const historyUndo = () => ({ type: HISTORY_UNDO });
export const historyRedo = () => ({ type: HISTORY_REDO });

// 히스토리에 기록할 변경 액션들
const MUTATION_TYPES = new Set([
    addShape.type,
    setShapeStyle.type,
    translateShapes.type,
    rotateShapes.type,
    flipHShapes.type,
    flipVShapes.type,
    skewShapes.type,
    scaleShapes.type,
    setSelection.type,
    clearSelection.type,
]);

const clone = (v) => JSON.parse(JSON.stringify(v));

const makeSnapshot = (state) => ({
    shapes: clone(state.shapes?.list || []),
    selection: clone(state.selection?.selectedIds || []),
});

const applySnapshot = (store, snapshot) => {
    if (!snapshot) return;
    store.dispatch({
        type: replaceAllShapes.type,
        payload: snapshot.shapes || [],
        meta: { fromHistory: true },
    });
    store.dispatch({
        type: setSelection.type,
        payload: snapshot.selection || [],
        meta: { fromHistory: true },
    });
};

export const historyDocMiddleware = (store) => (next) => (action) => {
    if (action?.meta?.fromHistory) return next(action);

    // UNDO
    if (action.type === HISTORY_UNDO) {
        const state = store.getState();
        const past = state.historyDoc?.past || [];
        if (!past.length) return;

        const current = makeSnapshot(state);
        store.dispatch(pushFuture({ snapshot: current }));
        store.dispatch(popPast());

        const { applied } = store.getState().historyDoc;
        applySnapshot(store, applied);
        return;
    }

    // REDO
    if (action.type === HISTORY_REDO) {
        const state = store.getState();
        const future = state.historyDoc?.future || [];
        if (!future.length) return;

        const current = makeSnapshot(state);
        store.dispatch(pushPast({ snapshot: current }));
        store.dispatch(popFuture());

        const { applied } = store.getState().historyDoc;
        applySnapshot(store, applied);
        return;
    }

    // 변경 액션이면 적용 직전 스냅샷 저장
    let beforeSnap = null;
    if (MUTATION_TYPES.has(action.type)) {
        beforeSnap = makeSnapshot(store.getState());
    }

    const result = next(action);

    if (beforeSnap) {
        store.dispatch(pushPast({ snapshot: beforeSnap }));
        store.dispatch(clearFuture());
    }

    return result;
};
