import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    tool: 'select',
    draft: { stroke: '#333', fill: null, strokeWidth: 1 },
    cursor: 'default',
};

const toolSlice = createSlice({
    name: 'tools',
    initialState,
    reducers: {
        setTool: (state, { payload }) => {
            state.tool = payload;
        },
        setDraft: (state, { payload }) => {
            state.draft = { ...state.draft, ...(payload || {}) };
        },
        setCursor: (state, { payload }) => {
            state.cursor = payload ?? 'default';
        },
        resetTool: () => initialState,

        setStroke: (state, { payload }) => {
            state.draft = { ...state.draft, stroke: payload };
        },
        setFill: (state, { payload }) => {
            state.draft = { ...state.draft, fill: payload };
        },
        setStrokeWidth: (state, { payload }) => {
            const v = Number(payload);
            state.draft = {
                ...state.draft,
                strokeWidth: Number.isFinite(v)
                    ? v
                    : (state.draft.strokeWidth ?? 1),
            };
        },
    },
});

export const {
    setTool,
    setDraft,
    setCursor,
    resetTool,
    setStroke,
    setFill,
    setStrokeWidth,
} = toolSlice.actions;
export default toolSlice.reducer;
