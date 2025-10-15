import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { drawings } from '../../api/drawings';

import { replaceAllShapes } from './shapeSlice';
import { setSelection } from './selectionSlice';
import { resetCanvas } from './canvasSlice';
import { resetHistory } from './historyDocSlice';
import { resetLayer } from './layerSlice';
import { resetRender } from './renderSlice';

import { safeParseVectorJson, applyVectorJson } from '../../util/vectorJson';

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

// 단건 로드 (id로 GET) - 파싱된 vectorJson을 상태에 적용 + payload에도 넣어 반환
export const loadDrawing = createAsyncThunk(
    'doc/loadDrawing',
    async (id, { dispatch, rejectWithValue }) => {
        try {
            const res = await drawings.get(id);
            const data = res?.data ?? res;
            const parsedVJ = safeParseVectorJson(data?.vectorJson);

            if (parsedVJ) applyVectorJson(dispatch, parsedVJ);

            // 파싱된 vj를 payload에도 넣어서 fulfilled에서 재활용
            return { ...data, vectorJson: parsedVJ };
        } catch (e) {
            return rejectWithValue(e.message || String(e));
        }
    }
);

// ──────────────────────────────────────────────────────────────
// 상태
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
    debug: {
        lastVectorJson: null, // 디버깅용: 마지막으로 로드된 vj 저장
    },
};

const docSlice = createSlice({
    name: 'doc',
    initialState,
    reducers: {},
    extraReducers: (b) => {
        // 목록
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

        // 단건
        b.addCase(loadDrawing.pending, (s) => {
            s.loading = true;
            s.error = null;
        });
        b.addCase(loadDrawing.fulfilled, (s, { payload }) => {
            s.loading = false;
            if (!payload) return;

            const m = payload;
            const vj = m.vectorJson; // 이미 파싱된 객체

            s.currentId = m.id ?? null;
            s.title = m.title ?? 'Untitled';
            s.version = m.version ?? 0;

            // 캔버스 크기 동기화: payload → vj.canvas → 기존값
            s.width = m.width ?? vj?.canvas?.width ?? s.width;
            s.height = m.height ?? vj?.canvas?.height ?? s.height;

            s.updatedAt = m.updatedAt ?? null;

            // 목록에 없으면 선두 삽입
            if (m.id && !s.items.some((x) => x.id === m.id)) s.items.unshift(m);

            // 디버깅 저장
            s.debug.lastVectorJson = vj || null;
        });
        b.addCase(loadDrawing.rejected, (s, { payload }) => {
            s.loading = false;
            s.error = payload || '불러오기 실패';
        });
    },
});

export default docSlice.reducer;

// 선택자(원하면 별도 selectors 파일로 빼도 됨)
export const selectLastVectorJson = (state) => state.doc?.debug?.lastVectorJson;

// 새 문서 시작: 상태 초기화
export const newDrawing = () => (dispatch) => {
    dispatch(resetCanvas());
    dispatch(resetHistory());
    dispatch(resetLayer());
    dispatch(resetRender());
    dispatch(setSelection(null));
    dispatch(replaceAllShapes([]));
};
