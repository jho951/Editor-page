import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { toArray } from '@shared/lib/to-array.ts';


import {DOCUMENT_NAME, DOCUMENT_STATE} from "@features/document/model/document.initial.ts";
import {
    fetchDrawings,
    loadDrawingById,
    saveCurrentDrawing,
    saveDrawingByName
} from "@features/document/config/async.ts";
import type {DrawingDetail, DrawingId, DrawingListItem} from "@features/document/ui/types.ts";

export type ModalKey = 'load' | 'save' | 'restore';

export interface SetModalPayload {
  key: ModalKey;
  open: boolean;
}

export interface SetCurrentMetaPayload {
  id: DrawingId | null;
  title: string;
  version: number | null;
}

const documentSlice = createSlice({
  name: DOCUMENT_NAME,
  initialState: DOCUMENT_STATE,
  reducers: {
    setModal(state, action: PayloadAction<SetModalPayload>) {
      const { key, open } = action.payload;
      if (key === 'load') state.modal.loadOpen = open;
      if (key === 'save') state.modal.saveOpen = open;
      if (key === 'restore') state.modal.restoreOpen = open;
    },

    setTitle(state, action: PayloadAction<string>) {
      state.current.title = action.payload || '';
      state.current.dirty = true;
    },
    setCurrentDirty(state, action: PayloadAction<boolean>) {
      state.current.dirty = !!action.payload;
    },
    markDirty(state) {
      state.current.dirty = true;
    },
    markClean(state) {
      state.current.dirty = false;
    },

    setCurrentMeta(state, action: PayloadAction<SetCurrentMetaPayload>) {
      const { id, title, version } = action.payload;
      state.current.id = id;
      state.current.title = title;
      state.current.version = version;
      state.current.dirty = false;
    },

    hydrateCurrent(state, action: PayloadAction<DrawingDetail>) {
      const d = action.payload;
      state.current.id = d.id ?? null;
      state.current.title = d.title ?? '';
      state.current.width = d.width ?? null;
      state.current.height = d.height ?? null;
      state.current.version = d.version ?? 0;
      state.current.vectorJson = d.vectorJson ?? null;
      state.current.dirty = false;
    },

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
    // 목록
    builder.addCase(fetchDrawings.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    builder.addCase(fetchDrawings.fulfilled, (s, a) => {
      s.loading = false;
      s.items = toArray<DrawingListItem>(a.payload);
    });
    builder.addCase(fetchDrawings.rejected, (s, a) => {
      s.loading = false;
      s.items = [];
      s.error = a.payload ?? a.error.message ?? 'list failed';
    });

    // 단건 로드
    builder.addCase(loadDrawingById.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    builder.addCase(loadDrawingById.fulfilled, (s, a) => {
      s.loading = false;
      documentSlice.caseReducers.hydrateCurrent(s, { type: a.type, payload: a.payload });
      s.meta.lastLoadedAt = Date.now();
    });
    builder.addCase(loadDrawingById.rejected, (s, a) => {
      s.loading = false;
      s.error = a.payload ?? a.error.message ?? 'load failed';
    });

    // 새로 저장
    builder.addCase(saveDrawingByName.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    builder.addCase(saveDrawingByName.fulfilled, (s) => {
      s.loading = false;
      s.meta.lastSavedAt = Date.now();
    });
    builder.addCase(saveDrawingByName.rejected, (s, a) => {
      s.loading = false;
      s.error = a.payload ?? a.error.message ?? 'save failed';
    });

    // 업데이트 저장
    builder.addCase(saveCurrentDrawing.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    builder.addCase(saveCurrentDrawing.fulfilled, (s) => {
      s.loading = false;
      s.current.dirty = false;
      s.meta.lastSavedAt = Date.now();
    });
    builder.addCase(saveCurrentDrawing.rejected, (s, a) => {
      s.loading = false;
      s.error = a.payload ?? a.error.message ?? 'update failed';
    });
  },
});

export const documentActions = documentSlice.actions;
export const documentReducer = documentSlice.reducer;

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
