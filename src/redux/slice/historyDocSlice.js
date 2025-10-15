import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    past: [],
    future: [],
    applied: null,
};

const takePayload = (payload) =>
    payload?.snapshot != null ? payload.snapshot : payload;

const historyDocSlice = createSlice({
    name: 'historyDoc',
    initialState,
    reducers: {
        resetHistory: () => initialState,

        pushPast: (state, { payload }) => {
            state.past.push({ snapshot: takePayload(payload) });
        },
        pushFuture: (state, { payload }) => {
            state.future.push({ snapshot: takePayload(payload) });
        },
        clearFuture: (state) => {
            state.future = [];
        },

        popPast: (state) => {
            if (!state.past.length) return;
            const top = state.past.pop();
            state.applied = top;
        },
        popFuture: (state) => {
            if (!state.future.length) return;
            const top = state.future.pop();
            state.applied = top;
        },

        undo: (state) => {
            if (!state.past.length) return;
            const top = state.past.pop();
            state.future.push(top);
            state.applied = top;
        },
        redo: (state) => {
            if (!state.future.length) return;
            const top = state.future.pop();
            state.past.push(top);
            state.applied = top;
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
