import { createSlice } from '@reduxjs/toolkit';
import {
    fetchDrawings,
    deleteDrawing,
    loadDrawingById,
    saveDrawingByName,
    saveCurrentDrawing,
} from '../util/async';

const initialState = {
    items: [], // 목록
    loading: false,
    error: null,
    ui: { loadOpen: false, saveOpen: false },
    current: { id: null, title: '', version: null, dirty: false },
};

const docSlice = createSlice({
    name: 'doc',
    initialState,
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
        // 목록
        builder.addCase(fetchDrawings.pending, (s) => {
            s.loading = true;
            s.error = null;
        });
        builder.addCase(fetchDrawings.fulfilled, (s, a) => {
            s.loading = false;
            s.items = a.payload;
        });
        builder.addCase(fetchDrawings.rejected, (s, a) => {
            s.loading = false;
            s.error = a.payload || a.error?.message || 'list failed';
        });

        // 삭제는 thunk에서 목록 재로딩

        // 로드
        builder.addCase(loadDrawingById.pending, (s) => {
            s.loading = true;
            s.error = null;
        });
        builder.addCase(loadDrawingById.fulfilled, (s) => {
            s.loading = false;
        });
        builder.addCase(loadDrawingById.rejected, (s, a) => {
            s.loading = false;
            s.error = a.payload || a.error?.message || 'load failed';
        });

        // 새로 저장
        builder.addCase(saveDrawingByName.pending, (s) => {
            s.loading = true;
            s.error = null;
        });
        builder.addCase(saveDrawingByName.fulfilled, (s) => {
            s.loading = false;
        });
        builder.addCase(saveDrawingByName.rejected, (s, a) => {
            s.loading = false;
            s.error = a.payload || a.error?.message || 'save failed';
        });

        // 업데이트 저장
        builder.addCase(saveCurrentDrawing.pending, (s) => {
            s.loading = true;
            s.error = null;
        });
        builder.addCase(saveCurrentDrawing.fulfilled, (s) => {
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
