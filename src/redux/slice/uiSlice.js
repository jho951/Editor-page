// src/redux/slice/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    tool: 'path', // 'path'|'line'|'rect'|'circle'|'polygon'|'star'|'pentagon'
    textMode: false,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setTool(state, { payload }) {
            state.tool = payload || 'path';
            state.textMode = false; // 도형 선택 시 텍스트 모드 OFF
        },
        enableTextMode(state) {
            state.textMode = true;
        },
        disableTextMode(state) {
            state.textMode = false;
        },
        toggleTextMode(state) {
            state.textMode = !state.textMode;
        },
    },
});

export const { setTool, enableTextMode, disableTextMode, toggleTextMode } =
    uiSlice.actions;
export default uiSlice.reducer;

// selectors
export const selectTool = (s) => s.ui.tool;
export const selectTextMode = (s) => s.ui.textMode;
