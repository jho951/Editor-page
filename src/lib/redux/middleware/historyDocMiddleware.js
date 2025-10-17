import {
    pushPast,
    pushFuture,
    clearFuture,
    popPast,
    popFuture,
} from '../slice/historySlice';

import { replaceAll as replaceAllShapes } from '../slice/shapeSlice';

import { setSelection } from '../slice/selectionSlice';
import {
    HISTORY_REDO,
    HISTORY_UNDO,
    MUTATION_TYPES,
} from '../constant/history';

const clone = (v) => JSON.parse(JSON.stringify(v));

// 단일 선택 모드 스냅샷
const makeSnapshot = (state) => ({
    shapes: clone(state.shapes?.list || []),
    selection: state.selection?.id ?? null,
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
        payload: snapshot.selection ?? null,
        meta: { fromHistory: true },
    });
};

const unwrap = (v) =>
    v && typeof v === 'object' && 'snapshot' in v ? v.snapshot : v;

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
        applySnapshot(store, unwrap(applied)); // ← 언랩해서 적용
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
        applySnapshot(store, unwrap(applied)); // ← 언랩해서 적용
        return;
    }

    let beforeSnap = null;
    if (MUTATION_TYPES.has(action.type)) {
        beforeSnap = makeSnapshot(store.getState()); // 변경 전 스냅
    }

    const result = next(action);

    if (beforeSnap) {
        // 변경 완료 후 "이전 상태"를 past에 적재 → UNDO 시 이전 상태로 복귀
        store.dispatch(pushPast({ snapshot: beforeSnap }));
        store.dispatch(clearFuture());
    }

    return result;
};
