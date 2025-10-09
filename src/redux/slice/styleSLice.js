/**
 * @file styleSlice.js
 * @description 현재 작업 스타일(선/채우기/텍스트 프리셋)만 관리하는 단일 상태
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    stroke: { color: '#222222', width: 2, opacity: 1, dash: [] },
    fill: { color: 'transparent', opacity: 0 },
    text: {
        font: '14px/1.4 Inter, system-ui, sans-serif',
        color: '#222',
        align: 'left',
    },
    polygon: { sides: 6 },
    star: { spikes: 5, innerRatio: 0.5 },
};

const styleSlice = createSlice({
    name: 'style',
    initialState,
    reducers: {
        setStroke(state, { payload }) {
            state.stroke = { ...state.stroke, ...payload };
        },
        setFill(state, { payload }) {
            state.fill = { ...state.fill, ...payload };
        },
        setTextStyle(state, { payload }) {
            state.text = { ...state.text, ...payload };
        },
        setPolygonOptions(state, { payload }) {
            state.polygon = { ...state.polygon, ...payload };
        },
        setStarOptions(state, { payload }) {
            state.star = { ...state.star, ...payload };
        },
        resetStyle() {
            return { ...initialState };
        },
    },
});

export const {
    setStroke,
    setFill,
    setTextStyle,
    setPolygonOptions,
    setStarOptions,
    resetStyle,
} = styleSlice.actions;

export default styleSlice.reducer;

export const selectEffectiveStyle = (s) => s.style;
