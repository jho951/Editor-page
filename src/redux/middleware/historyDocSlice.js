import { createSlice } from '@reduxjs/toolkit';

const MAX_STACK = 50;

const initialState = {
    past: [], // [{canvas, layers, render, hitmap}]
    future: [], // [{canvas, layers, render, hitmap}]
    applied: null, // pop 시 일시 저장
};

const historyDocSlice = createSlice({
    name: 'historyDoc',
    initialState,
    reducers: {
        pushPast(state, action) {
            state.past.push(action.payload.snapshot);
            if (state.past.length > MAX_STACK) state.past.shift();
            state.applied = null;
        },
        pushFuture(state, action) {
            state.future.push(action.payload.snapshot);
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
        reset(state) {
            state.past = [];
            state.future = [];
            state.applied = null;
        },
    },
});

export const { pushPast, pushFuture, clearFuture, popPast, popFuture, reset } =
    historyDocSlice.actions;

export default historyDocSlice.reducer;
