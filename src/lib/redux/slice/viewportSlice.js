import { createSlice } from '@reduxjs/toolkit';
import { REDUCER_NAME } from '../constant/name';
import { DEFAULT } from '../constant/initial';
import { clamp } from '../util/guide';

/**
 * @file viewportSlice.js
 * @author YJH
 * @description 캔버스 뷰 변경 슬라이스
 * @property {zoom} 확대/축소 배율
 * @property {pan} 뷰포트 이동 좌표
 * @property {minZoom} 최소 축소 배율
 * @property {maxZoom} 최대 확대 배율
 * @see {@link DEFAULT.VIEWPORT} 기본 뷰포트 상태
 * @see {@link clamp} 값을 a와 b 사이로 제한
 */
const viewportSlice = createSlice({
    name: REDUCER_NAME.VIEWPORT,
    initialState: DEFAULT.VIEWPORT,
    reducers: {
        /**
         * @description 뷰포트 확대/축소 배율 설정
         * @param {number} payload - 새로운 확대/축소 배율
         */
        setZoom: (state, { payload }) => {
            state.zoom = clamp(Number(payload), state.minZoom, state.maxZoom);
        },

        /** @description 뷰포트 확대/축소 배율을 10% 증가 */
        zoomIn: (state) => {
            state.zoom = clamp(state.zoom * 1.1, state.minZoom, state.maxZoom);
        },

        /**  @description 뷰포트 확대/축소 배율을 10% 감소 */
        zoomOut: (state) => {
            state.zoom = clamp(state.zoom / 1.1, state.minZoom, state.maxZoom);
        },

        /**
         * @description 뷰포트 이동 좌표 설정
         * @param {number} payload.x - 새로운 x 좌표
         * @param {number} payload.y - 새로운 y 좌표
         * @return {void}
         */
        setPan: (state, { payload }) => {
            state.pan = {
                x: payload?.x,
                y: payload?.y,
            };
        },

        /**
         * @description 뷰포트 이동 좌표를 상대적으로 변경
         * @param {number} payload.dx - x 좌표 변경량
         * @param {number} payload.dy - y 좌표 변경량
         */
        panBy: (state, { payload }) => {
            state.pan = {
                x: state.pan.x + payload?.dx,
                y: state.pan.y + payload?.dy,
            };
        },

        /**
         * @description 캔버스 크기에 맞게 뷰포트 확대/축소 및 위치 조정
         * @param {object} payload - 캔버스 및 뷰포트 크기 정보
         * @param {number} payload.canvasW - 캔버스 너비
         * @param {number} payload.canvasH - 캔버스 높이
         * @param {number} payload.viewW - 뷰포트 너비
         * @param {number} payload.viewH - 뷰포트 높이
         * @param {number} [payload.padding=16] - 뷰포트 내 여백
         */
        fitIn: (state, { payload }) => {
            const {
                canvasW,
                canvasH,
                viewW,
                viewH,
                padding = 16,
            } = payload || {};
            if (!canvasW || !canvasH || !viewW || !viewH) return;
            const zx = (viewW - padding * 2) / canvasW;
            const zy = (viewH - padding * 2) / canvasH;
            const zoom = clamp(Math.min(zx, zy), state.minZoom, state.maxZoom);
            state.zoom = zoom;
            state.pan = {
                x: Math.round((viewW - canvasW * zoom) / 2),
                y: Math.round((viewH - canvasH * zoom) / 2),
            };
        },

        setRotation: (state, { payload }) => {
            state.rotation = Number(payload) || 0;
        },
        rotateBy: (state, { payload }) => {
            state.rotation += Number(payload) || 0;
        },
        resetRotation: (state) => {
            state.rotation = 0;
        },
        /**
         * @description 뷰포트 상태를 초기 상태로 재설정
         * @return {object} 뷰포트 초기값
         */
        reset: () => DEFAULT.VIEWPORT,
    },
});

export const {
    setZoom,
    zoomIn,
    zoomOut,
    setPan,
    panBy,
    fitIn,
    setRotation,
    rotateBy,
    resetRotation,
    reset,
} = viewportSlice.actions;
export default viewportSlice.reducer;
