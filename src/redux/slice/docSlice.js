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
    if (vj.selection)
        dispatch({
            type: setSelection.type,
            payload: vj.selection,
            meta: { fromHistory: true },
        });
};

export const fetchDrawings = createAsyncThunk(
    'doc/fetchDrawings',
    async (_, { rejectWithValue }) => {
        try {
            const res = await drawings.list();
            return Array.isArray(res) ? res : (res?.data ?? []);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const loadDrawing = createAsyncThunk(
    'doc/loadDrawing',
    async (id, { dispatch, rejectWithValue }) => {
        try {
            const res = await drawings.get(id);
            const data = res?.data || res;
            if (data?.vectorJson) applyVectorJson(dispatch, data.vectorJson);
            return data;
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

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
};

const docSlice = createSlice({
    name: 'doc',
    initialState,
    reducers: {},
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
            s.currentId = m.id ?? null;
            s.title = m.title ?? 'Untitled';
            s.version = m.version ?? 0;
            s.width = m.width ?? s.width;
            s.height = m.height ?? s.height;
            s.updatedAt = m.updatedAt ?? null;
            if (m.id && !s.items.some((x) => x.id === m.id)) s.items.unshift(m);
        });
        b.addCase(loadDrawing.rejected, (s, { payload }) => {
            s.loading = false;
            s.error = payload || '불러오기 실패';
        });
    },
});

export default docSlice.reducer;
export const newDrawing = () => (dispatch) => {
    dispatch(resetCanvas());
    dispatch(resetHistory());
    dispatch(resetLayer());
    dispatch(setSelection());
    dispatch(replaceAllShapes());
    dispatch(resetRender());
};
