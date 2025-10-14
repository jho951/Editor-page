import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    tool: 'select',
    draft: { stroke: '#333333', fill: '#ffffff', strokeWidth: 2 },
    selectionRect: null,
    cursor: 'default',
};

const toolSlice = createSlice({
    name: 'tools',
    initialState,
    reducers: {
        setTool: (s, { payload }) => {
            s.tool = payload;
        },
        setDraftStyle: (s, { payload }) => {
            Object.assign(s.draft, payload);
        },
        setStroke: (s, { payload }) => {
            s.draft.stroke = payload;
        },
        setFill: (s, { payload }) => {
            s.draft.fill = payload;
        },
        setStrokeWidth: (s, { payload }) => {
            const n = Number(payload);
            s.draft.strokeWidth = Number.isFinite(n) && n > 0 ? n : 1;
        },
        setCursor: (s, { payload }) => {
            s.cursor = payload || 'default';
        },
        setSelectionRect: (s, { payload }) => {
            s.selectionRect = payload; // {x,y,w,h} | null
        },
    },
});

export const {
    setTool,
    setDraftStyle,
    setStroke,
    setFill,
    setStrokeWidth,
    setCursor,
    setSelectionRect,
} = toolSlice.actions;

export default toolSlice.reducer;
