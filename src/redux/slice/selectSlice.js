// src/redux/slice/selectSlice.js
/**
 * @file selectSlice.js
 * @description 선택/마키/옵션만 관리 (전역 모드 의존 제거)
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    marquee: null, // {x,y,w,h} | null
    selectedIds: [], // string[]
    options: {
        dashed: true,
        handleSize: 8,
        showBounds: true,
    },
};

const selectSlice = createSlice({
    name: 'select',
    initialState,
    reducers: {
        setMarquee(state, { payload }) {
            state.marquee = payload; // {x,y,w,h} or null
        },
        setSelectedIds(state, { payload }) {
            state.selectedIds = Array.isArray(payload) ? payload : [];
        },
        clearSelection(state) {
            state.marquee = null;
            state.selectedIds = [];
        },
        setSelectOptions(state, { payload }) {
            state.options = { ...state.options, ...(payload || {}) };
        },
    },
});

export const { setMarquee, setSelectedIds, clearSelection, setSelectOptions } =
    selectSlice.actions;
export default selectSlice.reducer;

// selectors
export const selectMarquee = (s) => s.select.marquee;
export const selectSelectedIds = (s) => s.select.selectedIds;
export const selectSelectOptions = (s) => s.select.options;
