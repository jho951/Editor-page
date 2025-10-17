import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT } from '../constant/default';

import { coerceSize } from '../util/guide';
import { REDUCER_NAME } from '../constant/name';

/**
 * @file canvasSlice.js
 * @author YJH
 * @description 캔버스 관련 상태 관리
 * @see {@link DEFAULT.CANVAS} 기본 캔버스 상태
 * @see {@link coerceSize}  양수인 경우 숫자 반환 그 외의 경우 fallback 반환
 */
const canvasSlice = createSlice({
    name: REDUCER_NAME.CANVAS,
    initialState: DEFAULT.CANVAS,

    reducers: {
        /**
         * @description 캔버스 크기 변경
         * @param {object} payload
         * @param {number|string} payload.width - 캔버스 너비
         * @param {number|string} payload.height - 캔버스 높이
         * @return {void}
         */
        setSize: (state, { payload }) => {
            state.width = coerceSize(payload?.width, state.width);
            state.height = coerceSize(payload?.height, state.height);
        },
        /**
         * @description 캔버스 배경 설정
         * @param {string|null} payload - 캔버스 배경색 또는 이미지 URL
         * @return {void}
         */
        setBackground: (state, { payload }) => {
            state.background = payload ?? null;
        },
        /**
         * @description 그리드 설정 변경
         * @param {object} payload
         * @param {boolean} [payload.enabled] - 그리드 사용 여부
         * @param {number|string} [payload.size] - 그리드 크기
         * @return {void}
         */
        setGrid: (state, { payload }) => {
            if (payload?.enabled != null)
                state.grid.enabled = !!payload.enabled;
            if (payload?.size != null)
                state.grid.size = coerceSize(payload.size, state.grid.size);
        },
        /**
         * @description 캔버스 상태를 payload로 대체
         * @param {object} payload
         * @param {number|string} payload.width - 캔버스 너비
         * @param {number|string} payload.height - 캔버스 높이
         * @param {string|null} payload.background - 캔버스 배경색 또는 이미지 URL
         * @param {object} payload.grid - 그리드 설정
         * @param {boolean} payload.grid.enabled - 그리드 사용 여부
         * @param {number|string} payload.grid.size - 그리드 크기
         * @return {object} 새로운 캔버스 상태
         */
        replaceAll: (state, { payload }) => ({
            width: coerceSize(payload?.width, DEFAULT.CANVAS.width),
            height: coerceSize(payload?.height, DEFAULT.CANVAS.height),
            background: payload?.background ?? null,
            grid: {
                enabled: Boolean(payload?.grid?.enabled),
                size: coerceSize(payload?.grid?.size, DEFAULT.CANVAS.grid.size),
            },
        }),
        /**
         * @description 캔버스 상태를 초기 상태로 재설정
         * @return {object} 캔버스 초기 값
         */
        reset: () => DEFAULT.CANVAS,
    },
});

export const { replaceAll, setSize, setBackground, setGrid, reset } =
    canvasSlice.actions;
export default canvasSlice.reducer;
