import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";

import type { RootState } from "@app/store/store.ts";
import type { Block } from "@features/editor/type/Block.types.ts";
import { textDocsApi } from "@features/editor/api/textDocs.ts";

import { A } from "@features/editor/ui/TextEditor/hooks/editorActions.ts";
import {
  editorReducer,
  createInitialEditorState,
  type EditorState,
} from "@features/editor/ui/TextEditor/hooks/editorReducer.ts";

type EditorAction = { type: string; [k: string]: any };

type Snapshot = {
  session: EditorState;
  at: number;
};

export type EditorStatus = "idle" | "loading" | "saving" | "error";

export interface EditorSliceState {
  docId: string | null;
  status: EditorStatus;
  error: string | null;

  dirty: boolean;
  lastSavedAt: number | null;

  past: Snapshot[];
  future: Snapshot[];

  session: EditorState;
}

const MAX_HISTORY = 50;

function isContentChanging(action: EditorAction): boolean {
  switch (action.type) {
    case A.BLOCK_INPUT:
    case A.BLOCK_INSERT_AFTER:
    case A.BLOCK_DELETE_SELECTED:
    case A.BLOCK_MERGE_WITH_PREV:
    case A.BLOCK_CHANGE_TYPE:
    case A.DRAG_DROP:
    case A.TITLE_SET:
    case "__REPLACE_BLOCKS__":
      return true;
    default:
      return false;
  }
}

function pushHistory(state: EditorSliceState) {
  const snap: Snapshot = { session: state.session, at: Date.now() };
  const nextPast = state.past.length >= MAX_HISTORY ? state.past.slice(1) : state.past.slice();
  nextPast.push(snap);
  state.past = nextPast;
  state.future = [];
}

export const loadTextDoc = createAsyncThunk<
  { id: string; title: string; blocks: Block[] },
  { id: string },
  { state: RootState }
>("editor/loadTextDoc", async ({ id }) => {
  const res = await textDocsApi.get(id);
  return { id: res.id, title: res.title, blocks: res.blocks };
});

export const saveTextDoc = createAsyncThunk<
  { id: string; savedAt: number },
  void,
  { state: RootState }
>("editor/saveTextDoc", async (_, thunkApi) => {
  const st = thunkApi.getState().editor;
  const docId = st.docId;
  if (!docId) throw new Error("No active docId");
  await textDocsApi.save(docId, { title: st.session.title, blocks: st.session.blocks });
  return { id: docId, savedAt: Date.now() };
});

const initialState: EditorSliceState = {
  docId: null,
  status: "idle",
  error: null,

  dirty: false,
  lastSavedAt: null,

  past: [],
  future: [],

  session: createInitialEditorState({ initialTitle: "", initialBlocks: [] }),
};

const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    /** Initialize editor session (used for local/optimistic new docs) */
    initSession(state, action: PayloadAction<{ docId?: string | null; title?: string; blocks?: Block[] }>) {
      const { docId = null, title = "", blocks = [] } = action.payload ?? {};
      state.docId = docId;
      state.session = createInitialEditorState({ initialTitle: title, initialBlocks: blocks });
      state.past = [];
      state.future = [];
      state.dirty = false;
      state.error = null;
      state.status = "idle";
    },

    /** Apply a low-level editor action (from TextEditor) */
    apply(state: EditorSliceState, action: PayloadAction<EditorAction>) {
      const a = action.payload;

      if (isContentChanging(a)) {
        pushHistory(state);
        state.dirty = true;
      }

      // Support legacy replace shortcut used by UI
      if (a.type === "__REPLACE_BLOCKS__") {
        const blocks = Array.isArray(a.blocks) ? a.blocks : state.session.blocks;
        const focusId = (a.focusId ?? state.session.focusId) as string | null;
        state.session = editorReducer(state.session, { type: A.BLOCKS_REPLACE, blocks, focusId });
        return;
      }

      state.session = editorReducer(state.session, a);
    },

    undo(state) {
      const last = state.past[state.past.length - 1];
      if (!last) return;
      const cur: Snapshot = { session: state.session, at: Date.now() };
      state.future = [cur, ...state.future];
      state.past = state.past.slice(0, -1);
      state.session = last.session;
      state.dirty = true;
    },

    redo(state) {
      const first = state.future[0];
      if (!first) return;
      const cur: Snapshot = { session: state.session, at: Date.now() };
      state.past = [...state.past, cur].slice(-MAX_HISTORY);
      state.future = state.future.slice(1);
      state.session = first.session;
      state.dirty = true;
    },

    markSaved(state) {
      state.dirty = false;
      state.error = null;
      state.status = "idle";
      state.lastSavedAt = Date.now();
      state.past = [];
      state.future = [];
    },

    setDocId(state, action: PayloadAction<string | null>) {
      state.docId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTextDoc.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.docId = action.meta.arg.id;
      })
      .addCase(loadTextDoc.fulfilled, (state, action) => {
        state.status = "idle";
        state.error = null;
        state.docId = action.payload.id;
        state.session = createInitialEditorState({
          initialTitle: action.payload.title,
          initialBlocks: action.payload.blocks,
        });
        state.dirty = false;
        state.past = [];
        state.future = [];
      })
      .addCase(loadTextDoc.rejected, (state, action) => {
        state.status = "error";
        state.error = action.error.message ?? "Failed to load document";
      })
      .addCase(saveTextDoc.pending, (state) => {
        state.status = "saving";
        state.error = null;
      })
      .addCase(saveTextDoc.fulfilled, (state, action) => {
        state.status = "idle";
        state.error = null;
        state.lastSavedAt = action.payload.savedAt;
        state.dirty = false;
        state.past = [];
        state.future = [];
      })
      .addCase(saveTextDoc.rejected, (state, action) => {
        state.status = "error";
        state.error = action.error.message ?? "Failed to save document";
      });
  },
});

export const editorActions = editorSlice.actions;
export const editorReducerRTK = editorSlice.reducer;

// Selectors
export const selectEditor = (s: RootState) => s.editor;
export const selectEditorSession = (s: RootState) => s.editor.session;
export const selectEditorDirty = (s: RootState) => s.editor.dirty;
export const selectEditorStatus = (s: RootState) => s.editor.status;
export const selectEditorError = (s: RootState) => s.editor.error;
