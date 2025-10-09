import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    vector: {
        past: [], // [{ items: [...] }, ...]
        future: [], // same shape
        applied: null, // pop 결과(미들웨어가 읽음)
    },
};

const historySlice = createSlice({
    name: 'history',
    initialState,
    reducers: {
        pushPastVector(state, { payload }) {
            const snap = payload?.snapshot;
            if (!snap) return;
            state.vector.past.push(snap);
            state.vector.future = [];
        },
        pushFutureVector(state, { payload }) {
            const snap = payload?.snapshot;
            if (!snap) return;
            state.vector.future.push(snap);
        },
        popPastVector(state) {
            const arr = state.vector.past;
            if (!arr.length) return;
            state.vector.applied = arr.pop();
        },
        popFutureVector(state) {
            const arr = state.vector.future;
            if (!arr.length) return;
            state.vector.applied = arr.pop();
        },
        clearVectorHistory(state) {
            state.vector.past = [];
            state.vector.future = [];
            state.vector.applied = null;
        },
    },
});

export const {
    pushPastVector,
    pushFutureVector,
    popPastVector,
    popFutureVector,
    clearVectorHistory,
} = historySlice.actions;

export default historySlice.reducer;
