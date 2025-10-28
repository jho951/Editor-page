import { createSlice } from '@reduxjs/toolkit';
import { HEADER_NAME, HEADER_STATE } from './header.initial';
import { clamp } from '@/shared/util/clamp';

const headerSlice = createSlice({
    name: HEADER_NAME,
    initialState: HEADER_STATE,
    reducers: {
        setTool(state, action) {
            state.tool = action.payload || 'select';
        },

        setView(state, action) {
            const v = action.payload || {};
            if (typeof v.scale === 'number') {
                state.view.scale = clamp(v.scale, 0.125, 8);
            }
            if (typeof v.tx === 'number') state.view.tx = v.tx;
            if (typeof v.ty === 'number') state.view.ty = v.ty;
        },

        zoomTo(state, action) {
            state.view.scale = clamp(action.payload, 0.125, 8);
        },

        panBy(state, action) {
            const { dx = 0, dy = 0 } = action.payload || {};
            state.view.tx += dx;
            state.view.ty += dy;
        },

        resetView(state) {
            state.view = HEADER_STATE.view;
        },

        // Canvas BG (state 키: background)
        setCanvasBg(state, action) {
            state.background = action.payload;
        },

        // Sidebar
        setSidebarOpen(state, action) {
            state.sidebarOpen = action.payload || null; // 'file' | 'shape' | 'transform' | 'style' | 'zoom' | null
        },

        // 섹션 활성 아이콘 (드롭다운 선택 반영)
        setSectionActive(state, action) {
            const { section, itemKey } = action.payload || {};
            if (!section || !(section in state.sectionActive)) return;
            state.sectionActive[section] = itemKey || null;
        },
    },
});

export const {
    setTool,
    setView,
    zoomTo,
    panBy,
    resetView,
    setCanvasBg,
    setSidebarOpen,
    setSectionActive,
} = headerSlice.actions;

export default headerSlice.reducer;
