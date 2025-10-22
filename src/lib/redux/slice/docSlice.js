import { createSlice } from '@reduxjs/toolkit';
import {
    fetchDrawings,
    loadDrawingById,
    saveDrawingByName,
    saveCurrentDrawing,
} from '../util/async';
import { toArray } from '../util/guide';
import { DOC_STATE } from '../constant/initial';

const docSlice = createSlice({
    name: 'doc',
    initialState: DOC_STATE,
    reducers: {
        openLoadModal(state) {
            state.ui.loadOpen = true;
        },
        closeLoadModal(state) {
            state.ui.loadOpen = false;
        },
        openSaveModal(state) {
            state.ui.saveOpen = true;
        },
        closeSaveModal(state) {
            state.ui.saveOpen = false;
        },

        setTitle(state, action) {
            state.current.title = action.payload || '';
            state.current.dirty = true;
        },
        markDirty(state) {
            state.current.dirty = true;
        },
        markClean(state) {
            state.current.dirty = false;
        },

        setCurrentMeta(state, action) {
            const {
                id = null,
                title = '',
                version = null,
            } = action.payload || {};
            state.current.id = id;
            state.current.title = title;
            state.current.version = version;
            state.current.dirty = false;
        },
    },
    extraReducers: (builder) => {
        // ─── 목록 ───────────────────────────────────────────────────────────
        builder.addCase(fetchDrawings.pending, (s) => {
            s.loading = true;
            s.error = null;
        });
        builder.addCase(fetchDrawings.fulfilled, (s, a) => {
            s.loading = false;
            s.items = toArray(a.payload);
        });
        builder.addCase(fetchDrawings.rejected, (s, a) => {
            s.loading = false;
            s.error = a.payload || a.error?.message || 'list failed';
            s.items = [];
        });

        // ─── 단건 로드 ──────────────────────────────────────────────────────
        builder.addCase(loadDrawingById.pending, (s) => {
            s.loading = true;
            s.error = null;
        });
        builder.addCase(loadDrawingById.fulfilled, (state, { payload }) => {
            state.loading = false;
            const d = payload?.data || payload;
            state.current.id = d.id;
            state.current.title = d.title;
            state.current.width = d.width;
            state.current.height = d.height;
            state.current.version = d.version ?? 0;
            state.current.vectorJson = d.vectorJson || null;
            state.current.dirty = false;
        });
        builder.addCase(loadDrawingById.rejected, (s, a) => {
            s.loading = false;
            s.error = a.payload || a.error?.message || 'load failed';
        });

        // ─── 새로 저장 ──────────────────────────────────────────────────────
        builder.addCase(saveDrawingByName.pending, (s) => {
            s.loading = true;
            s.error = null;
        });
        builder.addCase(saveDrawingByName.fulfilled, (s /*, a */) => {
            s.loading = false;
            // 필요하면 성공 응답으로 items 갱신 / current 갱신
            // s.items = toArray(a.payload?.list);  // 서버 설계에 맞춰 사용
        });
        builder.addCase(saveDrawingByName.rejected, (s, a) => {
            s.loading = false;
            s.error = a.payload || a.error?.message || 'save failed';
        });

        // ─── 업데이트 저장 ──────────────────────────────────────────────────
        builder.addCase(saveCurrentDrawing.pending, (s) => {
            s.loading = true;
            s.error = null;
        });
        builder.addCase(saveCurrentDrawing.fulfilled, (s /*, a */) => {
            s.loading = false;
            s.current.dirty = false;
        });
        builder.addCase(saveCurrentDrawing.rejected, (s, a) => {
            s.loading = false;
            s.error = a.payload || a.error?.message || 'update failed';
        });
    },
});

export const {
    openLoadModal,
    closeLoadModal,
    openSaveModal,
    closeSaveModal,
    setTitle,
    markDirty,
    markClean,
    setCurrentMeta,
} = docSlice.actions;

export default docSlice.reducer;
