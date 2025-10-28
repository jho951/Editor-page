/**
 * @file toolbar.slice.js
 * @description 툴바(도구 선택, 사이드 패널) 관련 Redux slice
 */
import { createSlice } from '@reduxjs/toolkit';
import { TOOLBAR_NAME, TOOLBAR_STATE } from './toolbar.initial';

const toolbarSlice = createSlice({
    name: TOOLBAR_NAME,
    initialState: TOOLBAR_STATE,
    reducers: {
        /** 도구 변경 */
        setTool(state, { payload }) {
            state.tool = payload;
            // 도형 섹션도 함께 업데이트
            state.sectionActive.shape = payload;
        },
        /** 배경색 변경 */
        setBackground(state, { payload }) {
            state.background = payload;
        },
        /** 사이드바 열기/닫기 */
        toggleSidebar(state, { payload }) {
            state.sidebarOpen = state.sidebarOpen === payload ? null : payload;
        },
        /** 섹션 활성화 변경 */
        setSectionActive(state, { payload }) {
            state.sectionActive = { ...state.sectionActive, ...payload };
        },
        /** 초기화 */
        resetToolbar() {
            return { ...TOOLBAR_STATE };
        },
    },
});

export const toolbarReducer = toolbarSlice.reducer;
export const toolbarActions = toolbarSlice.actions;
