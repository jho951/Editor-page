import { createAsyncThunk } from '@reduxjs/toolkit';
import { drawings } from '../../../lib/axios/drawings';
import { takeSnapshot } from './serde';
import { setCurrentMeta, markClean } from '../slice/docSlice';
import { parseVectorJson } from '../../../component/header/util/transform';
import { setCanvasBg, setView } from '../slice/uiSlice';
import { replaceAll } from '../slice/canvasSlice';

/* 목록 */
export const fetchDrawings = createAsyncThunk(
    'doc/list',
    async (_, { rejectWithValue }) => {
        try {
            const res = await drawings.list();
            const items = res?.data?.items;
            return Array.isArray(items) ? items : [];
        } catch (e) {
            return rejectWithValue(e?.message || 'list failed');
        }
    }
);

/* 단건 로드 */
export const loadDrawingById = createAsyncThunk(
    'doc/loadById',
    async (id, { dispatch, rejectWithValue }) => {
        try {
            const res = await drawings.get(id);
            const payload = res?.data?.data;
            if (!payload) throw new Error('invalid response');

            dispatch(
                setCurrentMeta({
                    id: payload.id,
                    title: payload.title || '',
                    version: payload.version ?? null,
                })
            );

            const { view, canvas, shapes } = parseVectorJson(
                payload.vectorJson || {}
            );
            dispatch(
                setView({
                    tx: Number(view?.tx) || 0,
                    ty: Number(view?.ty) || 0,
                    scale: Number(view?.scale) || 1,
                })
            );
            if (canvas?.background) dispatch(setCanvasBg(canvas.background));
            dispatch(
                replaceAll({ shapes: Array.isArray(shapes) ? shapes : [] })
            );
            dispatch(markClean());
            return payload;
        } catch (e) {
            return rejectWithValue(e?.message || 'load failed');
        }
    }
);

/* 신규 저장 */
export const saveDrawingByName = createAsyncThunk(
    'doc/saveNew',
    async (title, { getState, dispatch, rejectWithValue }) => {
        try {
            const snapshot = takeSnapshot(getState());
            const res = await drawings.create({ title, vectorJson: snapshot });
            const data = res?.data;
            if (!data) throw new Error('invalid create response');

            dispatch(
                setCurrentMeta({
                    id: data.id,
                    title: data.title || title,
                    version: data.version ?? 1,
                })
            );
            dispatch(markClean());
            return data;
        } catch (e) {
            return rejectWithValue(e?.message || 'save failed');
        }
    }
);

/* 🔶 기존 문서 업데이트 (createAsyncThunk 버전) */
export const saveCurrentDrawing = createAsyncThunk(
    'doc/update',
    async (_arg, { getState, dispatch, rejectWithValue }) => {
        try {
            const state = getState();
            const meta = state?.doc?.current;
            if (!meta?.id) throw new Error('문서 ID가 없습니다.');

            const snapshot = takeSnapshot(state); // 가공 없이 그대로
            const req = {
                id: meta.id, // URL 경로에도 재사용 (drawings.update 내부)
                title: meta.title || 'Untitled',
                version: meta.version,
                vectorJson: snapshot,
            };

            const res = await drawings.update(req); // drawings.update(body)
            const data = res?.data;
            if (!data) throw new Error('invalid update response');

            dispatch(
                setCurrentMeta({
                    id: data.id ?? meta.id,
                    title: data.title ?? meta.title,
                    version: data.version ?? meta.version,
                })
            );
            dispatch(markClean());
            return data;
        } catch (e) {
            // 서버가 409 충돌을 던지면 여기로 들어옴
            return rejectWithValue(e?.message || 'update failed');
        }
    }
);

/* 🔶 소프트 삭제 (createAsyncThunk 버전) */
export const softDeleteDrawing = createAsyncThunk(
    'doc/softDelete',
    async (_arg, { getState, dispatch, rejectWithValue }) => {
        try {
            const { id, version } = getState().doc?.current || {};
            if (!id) throw new Error('문서 ID가 없습니다.');

            // 서버 라우팅 예: POST /drawings/{id}/soft-delete
            const res = await drawings.softDelete(id, { id, version });
            const data = res?.data;
            if (!data) throw new Error('invalid soft-delete response');

            // 목록 갱신 등 후속 처리
            dispatch(fetchDrawings());
            return data;
        } catch (e) {
            return rejectWithValue(e?.message || 'soft-delete failed');
        }
    }
);

/* 하드 삭제 */
export const deleteDrawing = createAsyncThunk(
    'doc/delete',
    async (id, { dispatch, rejectWithValue }) => {
        try {
            await drawings.remove(id);
            dispatch(fetchDrawings());
            return true;
        } catch (e) {
            return rejectWithValue(e?.message || 'delete failed');
        }
    }
);
