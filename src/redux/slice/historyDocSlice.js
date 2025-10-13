// src/slice/historyDocSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    past: [], // [{canvas, layers, render, hitmap}, ...]
    future: [], // [{...}, ...]
    applied: null, // pop 시 임시로 담아 미들웨어가 읽어감
};

const historyDocSlice = createSlice({
    name: 'historyDoc',
    initialState,
    reducers: {
        pushPast(state, action) {
            const snap = action.payload?.snapshot;
            if (snap) state.past.push(snap);
        },
        pushFuture(state, action) {
            const snap = action.payload?.snapshot;
            if (snap) state.future.push(snap);
        },
        clearFuture(state) {
            state.future = [];
        },
        popPast(state) {
            state.applied = state.past.length ? state.past.pop() : null;
        },
        popFuture(state) {
            state.applied = state.future.length ? state.future.pop() : null;
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
