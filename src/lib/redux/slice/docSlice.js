import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT } from '../constant/default';
import { REDUCER_NAME } from '../constant/name';
import {
    loadDrawing,
    saveDoc,
    fetchDrawings,
    deleteDrawing,
    saveDrawingByName,
    openNew,
} from '../util/async';

const normalize = (row) => ({
    id: row.id,
    title: row.title ?? '(제목없음)',
    createdAt: row.createdAt ?? row.created_at ?? null,
    updatedAt: row.updatedAt ?? row.updated_at ?? null,
    version: typeof row.version === 'number' ? row.version : 0,
});

const docSlice = createSlice({
    name: REDUCER_NAME.DOC,
    initialState: DEFAULT.DOC,
    reducers: {
        setDocMeta: (state, { payload }) => {
            state.currentId = payload?.id ?? state.currentId;
            state.title = payload?.title ?? state.title;
            state.version = payload?.version ?? state.version;
            if (payload?.width != null) state.width = payload.width;
            if (payload?.height != null) state.height = payload.height;
            state.updatedAt = payload?.updatedAt ?? state.updatedAt;
        },
        setDocItems: (state, { payload }) => {
            state.items = Array.isArray(payload)
                ? payload.map(normalize)
                : state.items;
        },
        setDocLoading: (state, { payload }) => {
            state.loading = !!payload;
        },
        setDocError: (state, { payload }) => {
            state.error = payload ?? null;
        },
        setLastVectorJson: (state, { payload }) => {
            state.debug.lastVectorJson = payload ?? null;
        },
        openLoadModal: (s) => {
            s.ui.loadOpen = true;
        },
        closeLoadModal: (s) => {
            s.ui.loadOpen = false;
        },
        openSaveModal: (s) => {
            s.ui.saveOpen = true;
        },
        closeSaveModal: (s) => {
            s.ui.saveOpen = false;
        },
        resetDoc: () => DEFAULT.DOC,
    },
    extraReducers: (b) => {
        b.addCase(openNew.fulfilled, (s, { payload }) => {
            s.currentId = payload.id; // null
            s.title = payload.title; // Untitled
            s.version = payload.version; // 0
            s.width = payload.width; // 1280
            s.height = payload.height; // 720
            s.updatedAt = payload.updatedAt; // null
            s.loading = false;
            s.error = null;
        });
        // 목록
        b.addCase(fetchDrawings.pending, (s) => {
            s.loading = true;
            s.error = null;
        });
        b.addCase(fetchDrawings.fulfilled, (s, { payload }) => {
            s.loading = false;
            s.items = Array.isArray(payload) ? payload.map(normalize) : [];
        });
        b.addCase(fetchDrawings.rejected, (s, { payload, error }) => {
            s.loading = false;
            s.error = payload || error?.message || '목록 불러오기 실패';
        });

        // 단일 로드
        b.addCase(loadDrawing.pending, (s) => {
            s.loading = true;
            s.error = null;
        });
        b.addCase(loadDrawing.fulfilled, (s, { payload }) => {
            s.loading = false;
            if (!payload) return;
            const m = payload;
            const vj = m.vectorJson;

            s.currentId = m.id ?? null;
            s.title = m.title ?? 'Untitled';
            s.version = m.version ?? 0;
            s.width = m.width ?? vj?.canvas?.width ?? s.width;
            s.height = m.height ?? vj?.canvas?.height ?? s.height;
            s.updatedAt = m.updatedAt ?? null;

            const norm = normalize(m);
            const idx = s.items.findIndex((x) => x.id === norm.id);
            if (norm.id) {
                if (idx >= 0) s.items[idx] = { ...s.items[idx], ...norm };
                else s.items.unshift(norm);
            }
            s.debug.lastVectorJson = vj || null;
        });
        b.addCase(loadDrawing.rejected, (s, { payload }) => {
            s.loading = false;
            s.error = payload || '불러오기 실패';
        });

        // 저장(기존)
        b.addCase(saveDoc.fulfilled, (s, { payload }) => {
            s.updatedAt = payload?.meta?.updatedAt ?? s.updatedAt;
        });

        // ✅ 새로 추가: 이름으로 저장
        b.addCase(saveDrawingByName.pending, (s) => {
            s.loading = true;
            s.error = null;
        });
        b.addCase(saveDrawingByName.fulfilled, (s, { payload }) => {
            s.loading = false;
            const m = payload?.data ?? payload; // axios/fetch 대응
            if (!m) return;

            s.currentId = m.id ?? s.currentId;
            s.title = m.title ?? s.title;
            s.version = m.version ?? s.version;
            s.updatedAt = m.updatedAt ?? s.updatedAt;

            const norm = normalize(m);
            const idx = s.items.findIndex((x) => x.id === norm.id);
            if (norm.id) {
                if (idx >= 0) s.items[idx] = { ...s.items[idx], ...norm };
                else s.items.unshift(norm);
            }
        });
        b.addCase(saveDrawingByName.rejected, (s, { payload, error }) => {
            s.loading = false;
            s.error = payload || error?.message || '저장 실패';
        });

        // 삭제(있다면)
        b.addCase(deleteDrawing?.fulfilled, (s, { payload: deletedId }) => {
            if (!deletedId) return;
            s.items = s.items.filter((it) => it.id !== deletedId);
        });
    },
});

export default docSlice.reducer;

export const {
    setDocMeta,
    setDocItems,
    setDocLoading,
    setDocError,
    setLastVectorJson,
    openLoadModal,
    closeLoadModal,
    openSaveModal,
    closeSaveModal,
    resetDoc,
} = docSlice.actions;
