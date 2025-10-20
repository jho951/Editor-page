import { createAsyncThunk } from '@reduxjs/toolkit';
import { takeSnapshot } from './serde';
import { setCurrentMeta, markClean } from '../slice/docSlice';

import { drawings } from '../../../lib/axios/drawings';
import { http } from '../../axios/http';
import { parseVectorJson } from '../../../component/header/util/transform';
import { setCanvasBg, setView } from '../slice/uiSlice';
import { replaceAll } from '../slice/canvasSlice';

const fetchDrawings = createAsyncThunk(
    'doc/list',
    async (_, { rejectWithValue }) => {
        try {
            const res = await http.get('/drawings');
            const data = res.data;
            return Array.isArray(data) ? data.data : (data?.data ?? []);
        } catch (e) {
            return rejectWithValue(e?.message || 'list failed');
        }
    }
);

export const deleteDrawing = createAsyncThunk(
    'doc/delete',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            await drawings.remove(id);
            // 삭제 후 목록 새로 고침(선택)
            dispatch(fetchDrawings());
            return true;
        } catch (e) {
            return rejectWithValue(e?.message || 'delete failed');
        }
    }
);

export const loadDrawingById = createAsyncThunk(
    'doc/loadById',
    async (id, { dispatch, rejectWithValue }) => {
        try {
            const res = await http.get(`/drawings/${id}`);
            const payload = res?.data?.data;
            console.log(payload);
            if (!payload) throw new Error('invalid response');

            // 1) 메타 주입
            dispatch(
                setCurrentMeta({
                    id: payload.id,
                    title: payload.title || '',
                    version: payload.version ?? null,
                })
            );

            const { view, canvas, shapes } = parseVectorJson(
                payload.vectorJson
            );
            dispatch(
                setView({
                    tx: Number(view.tx) || 0,
                    ty: Number(view.ty) || 0,
                    scale: Number(view.scale) || 1,
                })
            );
            if (canvas?.background) dispatch(setCanvasBg(canvas.background));

            dispatch(replaceAll({ shapes }));

            return payload;
        } catch (err) {
            return rejectWithValue(err?.message || 'load failed');
        }
    }
);

export const saveDrawingByName = createAsyncThunk(
    'doc/saveNew',
    async (title, { getState, rejectWithValue, dispatch }) => {
        try {
            const state = getState();
            const vectorJson = takeSnapshot(state);
            const res = await drawings.create({ title, vectorJson });
            dispatch(
                setCurrentMeta({
                    id: res.id,
                    title: res.title || title,
                    version: res.version || 1,
                })
            );
            dispatch(markClean());
            return res;
        } catch (e) {
            return rejectWithValue(e?.message || 'save failed');
        }
    }
);

/** 기존 문서 업데이트 저장 */
export const saveCurrentDrawing = createAsyncThunk(
    'doc/saveUpdate',
    async (_, { getState, rejectWithValue, dispatch }) => {
        try {
            const state = getState();
            const meta = state.doc.current;
            if (!meta.id) throw new Error('문서 ID가 없습니다.');
            const vectorJson = takeSnapshot(state);
            const res = await drawings.update(meta.id, {
                title: meta.title || 'Untitled',
                version: meta.version,
                vectorJson,
            });
            dispatch(
                setCurrentMeta({
                    id: res.id,
                    title: res.title || meta.title,
                    version: res.version || meta.version,
                })
            );
            dispatch(markClean());
            return res;
        } catch (e) {
            return rejectWithValue(e?.message || 'update failed');
        }
    }
);

export { fetchDrawings };
