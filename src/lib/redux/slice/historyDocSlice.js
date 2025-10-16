// historyDocSlice.js (수정본)
import { createSlice } from '@reduxjs/toolkit';

const fresh = () => ({
    past: [],
    future: [],
    applied: null, // ← 실제 스냅샷을 담습니다.
});

const takePayload = (payload) =>
    payload && payload.snapshot != null ? payload.snapshot : payload;

const historyDocSlice = createSlice({
    name: 'historyDoc',
    initialState: fresh(),
    reducers: {
        // 매번 새로운 객체로 초기화
        resetHistory: () => fresh(),

        // 스냅샷 푸시
        pushPast: (state, { payload }) => {
            const snap = takePayload(payload);
            if (snap == null) return;
            state.past.push({ snapshot: snap });
        },
        pushFuture: (state, { payload }) => {
            const snap = takePayload(payload);
            if (snap == null) return;
            state.future.push({ snapshot: snap });
        },
        clearFuture: (state) => {
            state.future.length = 0;
        },

        // pop 시에도 실제 스냅샷만 적용
        popPast: (state) => {
            if (!state.past.length) return;
            const top = state.past.pop();
            state.applied = top?.snapshot ?? null;
        },
        popFuture: (state) => {
            if (!state.future.length) return;
            const top = state.future.pop();
            state.applied = top?.snapshot ?? null;
        },

        // ✅ 한 단계씩 되돌리기/다시 실행
        undo: (state) => {
            if (!state.past.length) return;
            const top = state.past.pop();
            state.future.push(top);
            state.applied = top?.snapshot ?? null; // ← 핵심: 스냅샷만 적용
        },
        redo: (state) => {
            if (!state.future.length) return;
            const top = state.future.pop();
            state.past.push(top);
            state.applied = top?.snapshot ?? null; // ← 핵심: 스냅샷만 적용
        },
    },
});

export const {
    resetHistory,
    pushPast,
    pushFuture,
    clearFuture,
    popPast,
    popFuture,
    undo,
    redo,
} = historyDocSlice.actions;

export default historyDocSlice.reducer;
