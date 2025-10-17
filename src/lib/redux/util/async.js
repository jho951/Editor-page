import { createAsyncThunk } from '@reduxjs/toolkit';
import { drawings } from '../../axios/drawings';
import { safeParseVectorJson } from '../util/guide';
import { REDUCER_NAME } from '../constant/name';

import { replaceAll as replaceCanvas } from '../slice/canvasSlice';
import { replaceAll as replaceShapes } from '../slice/shapeSlice';
import { clearSelection } from '../slice/selectionSlice';
import {
    reset as resetHistory,
    clearFuture,
    pushPast,
} from '../slice/historySlice';
import { markAllDirty } from '../slice/renderSlice';
import { fitIn as viewportFitIn } from '../slice/viewportSlice';

import { DEFAULT } from '../constant/default';

import { resetDoc, setDocMeta, setLastVectorJson } from '../slice/docSlice';

// ------------------------------------------------------------------
// 유틸: 현재 상태 → vectorJson 직렬화 (docSlice가 아닌 곳에서 사용 가능하도록)
const buildVectorJson = (state) => {
    const canvas = state.canvas;
    const shapes = state.shape.list;
    return {
        canvas: {
            width: canvas.width,
            height: canvas.height,
            background: canvas.background,
            grid: canvas.grid,
        },
        shapes,
        meta: {
            version: state.doc.version ?? 0,
            title: state.doc.title ?? 'Untitled',
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
            const res = await drawings.list(); // 서버 응답 예: { success, data: [...] }
            const list = Array.isArray(res) ? res : (res?.data ?? []);
            // 최신 수정순 정렬 원하면 사용:
            // list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            return list;
        } catch (e) {
            return rejectWithValue(e.message || String(e));
        }
    }
);

export const deleteDrawing = createAsyncThunk(
    `${REDUCER_NAME.DOC}/deleteDrawing`,
    async (id, { rejectWithValue }) => {
        try {
            await drawings.remove(id);
            return id; // 삭제된 id를 payload로 전달
        } catch (e) {
            return rejectWithValue(e.message || String(e));
        }
    }
);
// 단일 문서 로드(서버 통신만; 상태 반영은 별도 applyVectorJson에서)
export const loadDrawing = createAsyncThunk(
    `${REDUCER_NAME.DOC}/loadDrawing`,
    async (id, { rejectWithValue }) => {
        try {
            const res = await drawings.get(id);
            const data = res?.data ?? res;
            const vj = safeParseVectorJson(data?.vectorJson);
            return { ...data, vectorJson: vj };
        } catch (e) {
            return rejectWithValue(e.message || String(e));
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
                width: cvs.width,
                height: cvs.height,
                background: cvs.background,
                grid: cvs.grid,
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
                canvasW: cvs.width,
                canvasH: cvs.height,
                viewW: vectorJson.viewW ?? cvs.width,
                viewH: vectorJson.viewH ?? cvs.height,
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

        return meta; // fulfilled payload
    }
);

// 저장(서버 통신 X): vectorJson 반환만; docSlice.extraReducers에서 후처리
export const saveDoc = createAsyncThunk(
    `${REDUCER_NAME.DOC}/saveDoc`,
    async (_, { getState }) => {
        const state = getState();
        const vectorJson = buildVectorJson(state);
        // 서버 저장 필요 시: await drawings.save(vectorJson);
        return vectorJson; // docSlice에서 fulfilled로 updatedAt/lastVectorJson 반영
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
            dispatch(pushPast({ snapshot: snap }));
            dispatch(markAllDirty());
        }
        return res;
    }
);

// 이미 있는 목록/삭제 thunk는 그대로 두고 ↓만 추가
export const saveDrawingByName = createAsyncThunk(
    `${REDUCER_NAME.DOC}/saveDrawingByName`,
    async (title, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            const doc = state?.doc || {};

            // 벡터 직렬화: 프로젝트의 진짜 직렬화 함수를 쓰는 게 베스트.
            // 없다면 최소한 doc.debug.lastVectorJson → canvas 크기 fallback
            const vectorJson = doc?.debug?.lastVectorJson ?? {
                canvas: { width: doc.width ?? 0, height: doc.height ?? 0 },
                // 필요하면 여기에 shapes, layers 등 추가
                // shapes: state?.shape?.items ?? []
            };

            const body = {
                title: (title || doc.title || 'Untitled').trim(),
                width: doc.width ?? undefined,
                height: doc.height ?? undefined,
                version: doc.version ?? 0,
                vectorJson,
            };

            const res = await drawings.create(body); // POST /drawings
            // axios라면 res.data, fetch 기반이면 res 자체일 수 있음 → 유연 처리
            return res?.data ?? res;
        } catch (e) {
            return rejectWithValue(e?.message || String(e));
        }
    }
);
