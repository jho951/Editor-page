import { createSlice } from '@reduxjs/toolkit';

const MAX_STACK = 50;

const initialState = {
    past: [],
    future: [],
    applied: null,
};

const historyDocSlice = createSlice({
    name: 'historyDoc',
    initialState,
    reducers: {
        pushPast(state, action) {
            const snap = action?.payload?.snapshot ?? null;
            if (!snap) return;
            state.past.push(snap);
            if (state.past.length > MAX_STACK) state.past.shift();
            state.applied = null;
        },
        pushFuture(state, action) {
            const snap = action?.payload?.snapshot ?? null;
            if (!snap) return;
            state.future.push(snap);
            if (state.future.length > MAX_STACK) state.future.shift();
            state.applied = null;
        },
        clearFuture(state) {
            state.future = [];
        },
        popPast(state) {
            const snap = state.past.pop();
            state.applied = snap ?? null;
        },
        popFuture(state) {
            const snap = state.future.pop();
            state.applied = snap ?? null;
        },
        resetHistory(state) {
            state.past = [];
            state.future = [];
            state.applied = null;
        },
    },
});

export const {
    pushPast,
    pushFuture,
    clearFuture,
    popPast,
    popFuture,
    resetHistory,
} = historyDocSlice.actions;

export default historyDocSlice.reducer;
