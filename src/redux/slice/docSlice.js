import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { drawings } from '../../api/drawings';

import { replaceAll as replaceCanvas } from './canvasSlice';
import { replaceAll as replaceLayers } from './layerSlice';
import { replaceAll as replaceRender } from './renderSlice';
import { replaceAllShapes } from './shapeSlice';
import { setSelection } from './selectionSlice';
import { resetCanvas } from './canvasSlice';
import { resetHistory } from './historyDocSlice';
import { resetLayer } from './layerSlice';
import { resetRender } from './renderSlice';

// ─── local utils (툴바 호환 위해 여기 둠) ───
const safeParseVectorJson = (v) => {
    if (!v) return null;
    if (typeof v === 'object') return v;
    try {
        return JSON.parse(v);
    } catch {
        return null;
    }
};

const applyVectorJson = (dispatch, vj = {}) => {
    if (vj.canvas)
        dispatch({
            type: replaceCanvas.type,
            payload: vj.canvas,
            meta: { fromHistory: true },
        });
    if (vj.layers)
        dispatch({
            type: replaceLayers.type,
            payload: vj.layers,
            meta: { fromHistory: true },
        });
    if (vj.render)
        dispatch({
            type: replaceRender.type,
            payload: vj.render,
            meta: { fromHistory: true },
        });
    if (vj.shapes)
        dispatch({
            type: replaceAllShapes.type,
            payload: vj.shapes,
            meta: { fromHistory: true },
        });
    if (vj.selection !== undefined)
        dispatch({
            type: setSelection.type,
            payload: vj.selection,
            meta: { fromHistory: true },
        });
};

// ─── 목록 ───
export const fetchDrawings = createAsyncThunk(
    'doc/fetchDrawings',
    async (_, { rejectWithValue }) => {
        try {
            const res = await drawings.list();
            return Array.isArray(res) ? res : (res?.data ?? []);
        } catch (e) {
            return rejectWithValue(e.message || String(e));
        }
    }
);

// ─── 단건 로드 ───
export const loadDrawing = createAsyncThunk(
    'doc/loadDrawing',
    async (id, { dispatch, rejectWithValue }) => {
        try {
            const res = await drawings.get(id);
            const data = res?.data ?? res;
            const parsedVJ = safeParseVectorJson(data?.vectorJson);
            if (parsedVJ) applyVectorJson(dispatch, parsedVJ);
            return { ...data, vectorJson: parsedVJ };
        } catch (e) {
            return rejectWithValue(e.message || String(e));
        }
    }
);

// ─── 상태 ───
const initialState = {
    items: [],
    currentId: null,
    title: 'Untitled',
    version: 0,
    width: null,
    height: null,
    updatedAt: null,
    loading: false,
    error: null,
    debug: { lastVectorJson: null },
};

const docSlice = createSlice({
    name: 'doc',
    initialState,
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
            state.items = Array.isArray(payload) ? payload : state.items;
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
        resetDoc: () => initialState,
    },
    extraReducers: (b) => {
        b.addCase(fetchDrawings.pending, (s) => {
            s.loading = true;
            s.error = null;
        });
        b.addCase(fetchDrawings.fulfilled, (s, { payload }) => {
            s.loading = false;
            s.items = payload || [];
        });
        b.addCase(fetchDrawings.rejected, (s, { payload }) => {
            s.loading = false;
            s.error = payload || '목록 불러오기 실패';
        });

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
            if (m.id && !s.items.some((x) => x.id === m.id)) s.items.unshift(m);
            s.debug.lastVectorJson = vj || null;
        });
        b.addCase(loadDrawing.rejected, (s, { payload }) => {
            s.loading = false;
            s.error = payload || '불러오기 실패';
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
    resetDoc,
} = docSlice.actions;

// ─── 새 문서 시작(툴바에서 호출) ───
export const newDrawing = () => (dispatch) => {
    dispatch(resetCanvas());
    dispatch(resetHistory());
    dispatch(resetLayer());
    dispatch(setSelection());
    dispatch(replaceAllShapes());
    dispatch(resetRender());
};
