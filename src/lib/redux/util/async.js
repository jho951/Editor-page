// lib/redux/util/async.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { hydrateFromDoc, takeSnapshot } from './serde';
import { setCurrentMeta, markClean } from '../slice/docSlice';

import { drawings } from '../../../lib/axios/drawings';

/** 목록 불러오기 */
export const fetchDrawings = createAsyncThunk(
    'doc/list',
    async (_, { rejectWithValue }) => {
        try {
            const res = await drawings.list(1, 100);
            // 서버 응답 형식에 맞게 items 추출
            return Array.isArray(res?.items) ? res.items : res || [];
        } catch (e) {
            return rejectWithValue(e?.message || 'list failed');
        }
    }
);

/** 항목 삭제 */
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

/** 문서 로드 */
export const loadDrawingById = createAsyncThunk(
    'doc/loadOne',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const data = await drawings.get(id);
            // 서버에서 { id, title, version, vectorJson } 형태라고 가정
            const doc = data?.vectorJson || data?.doc || data;
            await dispatch(hydrateFromDoc(doc));
            dispatch(
                setCurrentMeta({
                    id: data.id,
                    title: data.title || '',
                    version: data.version || 1,
                })
            );
            dispatch(markClean());
            return true;
        } catch (e) {
            return rejectWithValue(e?.message || 'load failed');
        }
    }
);

/** 새 이름으로 저장(최초 저장) */
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
