// lib/redux/util/async.js
// -------------------------------------------------------------
// 서버 연동 비동기 Thunk 모음
// - 목록 조회
// - 단건 로드
// - 새 문서 저장 (POST, Save As)
// - 현재 문서 덮어쓰기 (PUT, Overwrite)
// - 소프트 삭제 / 하드 삭제
// -------------------------------------------------------------

import { createAsyncThunk } from '@reduxjs/toolkit';
import { drawings } from '../../../lib/axios/drawings'; // ✅ 네가 쓰던 axios 래퍼 경로 유지
import { takeSnapshot } from './serde';
import { setCurrentMeta, markClean } from '../slice/docSlice';
import { parseVectorJson } from '../../../component/header/util/transform';
import { setCanvasBg, setView } from '../slice/uiSlice';
import { replaceAll } from '../slice/canvasSlice';

/**
 * 서버 ApiResponse 래퍼를 유연하게 뜯는 헬퍼
 * - 컨트롤러가 ApiResponse로 감싸는 경우(data 안에 실제 본문),
 *   혹은 바로 본문을 주는 경우 둘 다 대응
 */
const unwrap = (res) => res?.data?.data ?? res?.data ?? null;

/**
 * (선택) 직렬화 함수
 * - 현재 Redux 상태를 서버 vectorJson 규격으로 변환
 * - 네 프로젝트는 takeSnapshot이 이미 올바른 JSON을 반환하므로 그대로 사용
 */
const serializeVectorJson = (state) => takeSnapshot(state);

/* -------------------------------------------------------------
 * 목록 조회: GET /drawings?page=1&size=20
 * ----------------------------------------------------------- */
export const fetchDrawings = createAsyncThunk(
    'doc/list',
    async ({ page = 1, size = 20 } = {}, { rejectWithValue }) => {
        try {
            const res = await drawings.list(page, size);
            const pageObj = unwrap(res);
            const items = pageObj?.rows ?? res?.data?.rows ?? [];
            return Array.isArray(items) ? items : [];
        } catch (e) {
            return rejectWithValue(e?.message || 'list failed');
        }
    }
);

/* -------------------------------------------------------------
 * 단건 로드: GET /drawings/{id}
 *  - 메타(state.doc.current) 채우고
 *  - vectorJson 파싱해서 view/canvas/shapes 상태 교체
 * ----------------------------------------------------------- */
export const loadDrawingById = createAsyncThunk(
    'doc/loadById',
    async (id, { dispatch, rejectWithValue }) => {
        try {
            const res = await drawings.get(id);
            const payload = unwrap(res);
            if (!payload) throw new Error('invalid response');

            // 메타 업데이트
            dispatch(
                setCurrentMeta({
                    id: payload.id,
                    title: payload.title || '',
                    version: payload.version ?? null,
                })
            );

            // vectorJson → 상태로 적용
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

/* -------------------------------------------------------------
 * 새 문서 저장 (Save As): POST /drawings
 *  - 제목을 새로 받아서 생성
 *  - 응답의 새 id를 doc.current에 반영
 *  - 필요하면 라우팅에서 /edit/:id 로 이동
 * ----------------------------------------------------------- */
export const saveDrawingByName = createAsyncThunk(
    'doc/saveNew',
    async (title, { getState, dispatch, rejectWithValue }) => {
        try {
            if (!String(title).trim()) throw new Error('제목이 비었습니다.');
            const snapshot = serializeVectorJson(getState());
            const res = await drawings.create({ title, vectorJson: snapshot });
            const data = unwrap(res);
            if (!data) throw new Error('invalid create response');

            dispatch(
                setCurrentMeta({
                    id: data.id, // 서버의 idOnly(id) 기준
                    title: data.title || title, // 서버가 title을 돌려주면 반영
                    version: data.version ?? 1, // 없으면 1부터 시작
                })
            );
            dispatch(markClean());
            return data; // { id, ... }
        } catch (e) {
            return rejectWithValue(e?.message || 'save failed');
        }
    }
);

/* -------------------------------------------------------------
 * 현재 문서 덮어쓰기 (Overwrite): PUT /drawings/{id}
 *  - 이미 열린 문서(meta.id)가 있을 때 호출
 *  - 서버가 낙관적 락(version)을 쓰면 함께 전달
 * ----------------------------------------------------------- */
export const saveCurrentDrawing = createAsyncThunk(
    'doc/update',
    async (_arg, { getState, dispatch, rejectWithValue }) => {
        try {
            const state = getState();
            const meta = state?.doc?.current;
            if (!meta?.id) throw new Error('문서 ID가 없습니다.');

            const snapshot = serializeVectorJson(state);
            const req = {
                id: meta.id, // URL path에 사용됨 (drawings.update 내부에서 encode)
                title: meta.title || 'Untitled',
                version: meta.version, // 낙관적 락을 쓰는 경우
                vectorJson: snapshot, // 서버에서 쓰면 반영
            };

            const res = await drawings.update(req); // PUT /drawings/{id}
            const data = unwrap(res);
            if (!data) throw new Error('invalid update response');

            // 서버가 최신 메타를 돌려주면 갱신(버전 증가 등)
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
            // 409 충돌 등도 이쪽으로 들어옴
            return rejectWithValue(e?.message || 'update failed');
        }
    }
);

/* -------------------------------------------------------------
 * (선택) 명시적 덮어쓰기: id를 인자로 받아서 저장
 *  - 헤더/단축키에서 현재 id로 바로 저장하고 싶을 때 사용 가능
 * ----------------------------------------------------------- */
export const saveDrawingById = createAsyncThunk(
    'doc/saveById',
    async (id, { getState, rejectWithValue }) => {
        try {
            if (!id) throw new Error('id가 없습니다.');
            const state = getState();
            const snapshot = serializeVectorJson(state);
            const title = state.doc?.current?.title || 'Untitled';
            const version = state.doc?.current?.version ?? null;

            const body = { id, title, version, vectorJson: snapshot };
            const res = await drawings.update(body); // PUT /drawings/{id}
            const data = unwrap(res);
            if (!data) throw new Error('invalid update response');

            return { id, title: data.title ?? title };
        } catch (e) {
            return rejectWithValue(
                e?.response?.data || e?.message || String(e)
            );
        }
    }
);

/* -------------------------------------------------------------
 * 소프트 삭제: POST /drawings/{id}/soft-delete
 *  - 삭제 후 목록 재조회
 * ----------------------------------------------------------- */
export const softDeleteDrawing = createAsyncThunk(
    'doc/softDelete',
    async (_arg, { getState, dispatch, rejectWithValue }) => {
        try {
            const { id, version } = getState().doc?.current || {};
            if (!id) throw new Error('문서 ID가 없습니다.');

            const res = await drawings.softDelete(id, { id, version });
            const data = unwrap(res);
            if (!data) throw new Error('invalid soft-delete response');

            // 삭제 반영 후 리스트 갱신
            await dispatch(fetchDrawings());
            return data;
        } catch (e) {
            return rejectWithValue(e?.message || 'soft-delete failed');
        }
    }
);

/* -------------------------------------------------------------
 * 완전 삭제: DELETE /drawings/{id}
 *  - 삭제 후 목록 재조회
 * ----------------------------------------------------------- */
export const deleteDrawing = createAsyncThunk(
    'doc/delete',
    async (id, { dispatch, rejectWithValue }) => {
        try {
            await drawings.remove(id);
            await dispatch(fetchDrawings());
            return true;
        } catch (e) {
            return rejectWithValue(e?.message || 'delete failed');
        }
    }
);

// /* -------------------------------------------------------------
//  * 로그인
//  * ----------------------------------------------------------- */
// export const login = createAsyncThunk(
//     'auth/login',
//     async ({ email, password }, { rejectWithValue }) => {
//         try {
//             const { data } = await http.post('/auth/login', {
//                 email,
//                 password,
//             });
//             // ApiResponse 래퍼 가정
//             const payload = data?.data ?? data;
//             return payload; // { accessToken, refreshToken }
//         } catch (e) {
//             return rejectWithValue(
//                 e?.response?.data || e?.message || 'login failed'
//             );
//         }
//     }
// );
