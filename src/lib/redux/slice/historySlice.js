import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT } from '../constant/default';
import { REDUCER_NAME } from '../constant/name';
import { takePayload } from '../util/guide';

/**
 * @file historySlice.js
 * @author YJH
 * @description 기록 저장
 * @see {@link DEFAULT.HISTORY} 초기 히스토리 상태
 * @see {@link takePayload}  히스토리 여부를 통한 통제
 */
const historySlice = createSlice({
    name: REDUCER_NAME.HISTORY,
    initialState: DEFAULT.HISTORY,
    reducers: {
        // 스냅샷 푸시
        pushPast: (state, { payload }) => {
            const snap = takePayload(payload);
            if (snap == null) return;
            state.past.push({ history: snap });
        },
        pushFuture: (state, { payload }) => {
            const snap = takePayload(payload);
            if (snap == null) return;
            state.future.push({ history: snap });
        },
        clearFuture: (state) => {
            state.future.length = 0;
        },

        // pop 시에도 실제 스냅샷만 적용
        popPast: (state) => {
            if (!state.past.length) return;
            const top = state.past.pop();
            state.applied = top?.history ?? null;
        },
        popFuture: (state) => {
            if (!state.future.length) return;
            const top = state.future.pop();
            state.applied = top?.history ?? null;
        },

        // ✅ 한 단계씩 되돌리기/다시 실행
        undo: (state) => {
            if (!state.past.length) return;
            const top = state.past.pop();
            state.future.push(top);
            state.applied = top?.history ?? null;
        },
        redo: (state) => {
            if (!state.future.length) return;
            const top = state.future.pop();
            state.past.push(top);
            state.applied = top?.history ?? null;
        },

        /**
         * @description 히스토리 상태를 초기 상태로 재설정
         * @return {object} 히스토리 초기값
         */
        reset: () => DEFAULT.HISTORY,
    },
});

export const {
    resetHistory,
    pushPast,
    pushFuture,
    clearFuture,
    popPast,
    popFuture,
    undo,
    redo,
    reset,
} = historySlice.actions;

export default historySlice.reducer;
