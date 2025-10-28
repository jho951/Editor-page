import { createSlice } from '@reduxjs/toolkit';
import { DOCUMENT_NAME, DOCUMENT_STATE } from './document.initial';
import { toArray } from '@/shared/util/to-array';

import {
    fetchDrawings,
    loadDrawingById,
    saveCurrentDrawing,
    saveDrawingByName,
} from '../api/async';

/** 공통 비동기 케이스 */
function addAsyncCases(builder, thunk, { onPending, onFulfilled, onRejected }) {
    if (onPending) builder.addCase(thunk.pending, onPending);
    if (onFulfilled) builder.addCase(thunk.fulfilled, onFulfilled);
    if (onRejected) builder.addCase(thunk.rejected, onRejected);
}

const documentSlice = createSlice({
    name: DOCUMENT_NAME,
    initialState: DOCUMENT_STATE,
    reducers: {
        setModal(state, { payload }) {
            const key = payload?.key;
            const open = !!payload?.open;
            if (key === 'load') state.modal.loadOpen = open;
            if (key === 'save') state.modal.saveOpen = open;
            if (key === 'restore') state.modal.restoreOpen = open;
        },

        setTitle(state, { payload }) {
            state.current.title = payload || '';
            state.current.dirty = true;
        },
        setCurrentDirty(state, { payload }) {
            state.current.dirty = !!payload;
        },
        markDirty(state) {
            state.current.dirty = true;
        },
        markClean(state) {
            state.current.dirty = false;
        },

        /** 현재 문서 메타 갱신(덮어쓰기) */
        setCurrentMeta(state, { payload = {} }) {
            const { id = null, title = '', version = null } = payload;
            state.current.id = id;
            state.current.title = title;
            state.current.version = version;
            state.current.dirty = false;
        },

        /** 현재 문서 전체 하이드레이션(서버 응답 -> current) */
        hydrateCurrent(state, { payload = {} }) {
            const d = payload?.data || payload;
            state.current.id = d?.id ?? null;
            state.current.title = d?.title ?? '';
            state.current.width = d?.width ?? null;
            state.current.height = d?.height ?? null;
            state.current.version = d?.version ?? 0;
            state.current.vectorJson = d?.vectorJson ?? null;
            state.current.dirty = false;
        },

        /** 에러 및 현재 초기화 */
        resetError(state) {
            state.error = null;
        },
        resetCurrent(state) {
            state.current = {
                id: null,
                title: '',
                version: null,
                dirty: false,
                width: null,
                height: null,
                vectorJson: null,
            };
        },
    },

    extraReducers: (builder) => {
        // ── 목록
        addAsyncCases(builder, fetchDrawings, {
            onPending: (s) => {
                s.loading = true;
                s.error = null;
            },
            onFulfilled: (s, a) => {
                s.loading = false;
                s.items = toArray(a.payload);
            },
            onRejected: (s, a) => {
                s.loading = false;
                s.items = [];
                s.error = a.payload || a.error?.message || 'list failed';
            },
        });

        // ── 단건 로드
        addAsyncCases(builder, loadDrawingById, {
            onPending: (s) => {
                s.loading = true;
                s.error = null;
            },
            onFulfilled: (s, { payload }) => {
                s.loading = false;
                documentSlice.caseReducers.hydrateCurrent(s, { payload });
                s.meta.lastLoadedAt = Date.now();
            },
            onRejected: (s, a) => {
                s.loading = false;
                s.error = a.payload || a.error?.message || 'load failed';
            },
        });

        // ── 새로 저장
        addAsyncCases(builder, saveDrawingByName, {
            onPending: (s) => {
                s.loading = true;
                s.error = null;
            },
            onFulfilled: (s /*, a */) => {
                s.loading = false;
                s.meta.lastSavedAt = Date.now();
                // 필요 시: s.items = toArray(a.payload?.list)
            },
            onRejected: (s, a) => {
                s.loading = false;
                s.error = a.payload || a.error?.message || 'save failed';
            },
        });

        // ── 업데이트 저장
        addAsyncCases(builder, saveCurrentDrawing, {
            onPending: (s) => {
                s.loading = true;
                s.error = null;
            },
            onFulfilled: (s) => {
                s.loading = false;
                s.current.dirty = false;
                s.meta.lastSavedAt = Date.now();
            },
            onRejected: (s, a) => {
                s.loading = false;
                s.error = a.payload || a.error?.message || 'update failed';
            },
        });
    },
});

export const {
    setModal,
    setTitle,
    setCurrentDirty,
    markDirty,
    markClean,
    setCurrentMeta,
    hydrateCurrent,
    resetError,
    resetCurrent,
} = documentSlice.actions;

export const documentReducer = documentSlice.reducer;
