// async.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { drawings } from '../../axios/drawings';
import { safeParseVectorJson } from '../util/guide';
import { REDUCER_NAME } from '../constant/name';

import { replaceAll as replaceCanvas } from '../slice/shapeSlice';
import { replaceAll as replaceShapes } from '../slice/shapeSlice';
import { clearSelection } from '../slice/selectionSlice';
import {
    reset as resetHistory,
    clearFuture,
    pushPast,
} from '../slice/historySlice';
import { markAllDirty } from '../slice/renderSlice';
import { fitIn as viewportFitIn } from '../slice/viewportSlice';

import { DEFAULT } from '../constant/initial';
import { resetDoc, setDocMeta, setLastVectorJson } from '../slice/docSlice';

// ------------------------------------------------------------------
// 현재 상태 → vectorJson 직렬화
const buildVectorJson = (state) => {
    const canvas = state?.canvas ?? {};
    const shapes = state?.shape?.list ?? [];
    const doc = state?.doc ?? {};

    return {
        canvas: {
            width: canvas.width ?? 0,
            height: canvas.height ?? 0,
            background: canvas.background ?? null,
            grid: canvas.grid ?? null,
        },
        shapes,
        meta: {
            version: doc.version ?? 0,
            title: (doc.title ?? 'Untitled').trim(),
            updatedAt: new Date().toISOString(),
        },
    };
};

// ------------------------------------------------------------------
// 목록 불러오기
export const fetchDrawings = createAsyncThunk(
    `${REDUCER_NAME.DOC}/fetchDrawings`,
    async (_, { rejectWithValue }) => {
        try {
            const res = await drawings.list();
            const list = Array.isArray(res) ? res : (res?.data ?? []);
            // 필요 시 최신순 정렬
            // list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            return list;
        } catch (e) {
            return rejectWithValue(e?.message || String(e));
        }
    }
);

// 삭제
export const deleteDrawing = createAsyncThunk(
    `${REDUCER_NAME.DOC}/deleteDrawing`,
    async (id, { rejectWithValue }) => {
        try {
            await drawings.remove(id);
            return id;
        } catch (e) {
            return rejectWithValue(e?.message || String(e));
        }
    }
);

// 단일 문서 로드(서버 통신만)
export const loadDrawing = createAsyncThunk(
    `${REDUCER_NAME.DOC}/loadDrawing`,
    async (id, { rejectWithValue }) => {
        try {
            const res = await drawings.get(id);
            const data = res?.data ?? res;
            const vj = safeParseVectorJson(data?.vectorJson);
            return { ...data, vectorJson: vj };
        } catch (e) {
            return rejectWithValue(e?.message || String(e));
        }
    }
);

// vectorJson → 각 슬라이스에 반영
export const applyVectorJson = createAsyncThunk(
    `${REDUCER_NAME.DOC}/applyVectorJson`,
    async (vectorJson, { dispatch }) => {
        if (!vectorJson) return false;

        const cvs = vectorJson.canvas ?? {};

        // 1) 캔버스/도형 반영
        dispatch(
            replaceCanvas({
                width: cvs.width ?? 0,
                height: cvs.height ?? 0,
                background: cvs.background ?? null,
                grid: cvs.grid ?? null,
            })
        );
        dispatch(replaceShapes(vectorJson.shapes || []));

        // 2) 선택/히스토리 초기화
        dispatch(clearSelection());
        dispatch(resetHistory());
        dispatch(clearFuture());

        // 3) 뷰포트 맞춤
        dispatch(
            viewportFitIn({
                canvasW: cvs.width ?? 0,
                canvasH: cvs.height ?? 0,
                viewW: vectorJson.viewW ?? cvs.width ?? 0,
                viewH: vectorJson.viewH ?? cvs.height ?? 0,
                padding: 16,
            })
        );

        // 4) 리렌더 플래그
        dispatch(markAllDirty());
        return true;
    }
);

// 새 문서 시작 (로컬 초기화)
export const openNew = createAsyncThunk(
    `${REDUCER_NAME.DOC}/openNew`,
    async (_, { dispatch }) => {
        // 1) 문서/레이어 전부 초기화
        dispatch(resetDoc());

        // 2) 메타/캔버스 크기 세팅
        const meta = {
            id: null,
            title: 'Untitled',
            version: 0,
            updatedAt: null,
            width: DEFAULT.CANVAS.width,
            height: DEFAULT.CANVAS.height,
        };
        dispatch(setDocMeta(meta));

        dispatch(
            setLastVectorJson({
                canvas: {
                    width: DEFAULT.CANVAS.width,
                    height: DEFAULT.CANVAS.height,
                },
                shapes: [],
                layers: [],
            })
        );

        document.title = 'Untitled — Editor';
        return meta;
    }
);

// 저장(서버 통신 X): vectorJson 반환
export const saveDoc = createAsyncThunk(
    `${REDUCER_NAME.DOC}/saveDoc`,
    async (_, { getState }) => {
        const state = getState();
        const vectorJson = buildVectorJson(state);
        return vectorJson;
    }
);

// 서버 로드 + 상태 반영 한번에
export const loadAndApplyDrawing = createAsyncThunk(
    `${REDUCER_NAME.DOC}/loadAndApplyDrawing`,
    async (id, { dispatch, getState }) => {
        const res = await dispatch(loadDrawing(id)).unwrap();
        if (!res) return null;

        const vj = res.vectorJson;
        if (vj) {
            await dispatch(applyVectorJson(vj));
            // 히스토리 기점 스냅
            const snap = buildVectorJson(getState());
            // 프로젝트의 pushPast 시그니처에 맞춰 payload 전달
            dispatch(pushPast(snap)); // 필요 시 { snapshot: snap }로 교체
            dispatch(markAllDirty());
        }
        return res;
    }
);

// 제목을 지정하여 새로 저장 (POST)
export const saveDrawingByName = createAsyncThunk(
    `${REDUCER_NAME.DOC}/saveDrawingByName`,
    async (title, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            const vectorJson = buildVectorJson(state);
            const doc = state?.doc ?? {};

            const body = {
                title: (title || doc.title || 'Untitled').trim(),
                width: vectorJson.canvas.width,
                height: vectorJson.canvas.height,
                version: doc.version ?? 0,
                vectorJson,
            };

            const res = await drawings.create(body); // POST /drawings
            return res?.data ?? res;
        } catch (e) {
            return rejectWithValue(e?.message || String(e));
        }
    }
);
