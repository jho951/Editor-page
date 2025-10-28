/**
 * @file viewport.slice.js
 * @description 확대/이동/회전 전용 Redux slice
 */
import { createSlice } from '@reduxjs/toolkit';
import {
    VIEWPORT_NAME,
    VIEWPORT_STATE,
    MIN_SCALE,
    MAX_SCALE,
    ZOOM_STEP,
} from './viewport.initial';

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const clampScale = (s) => clamp(s, MIN_SCALE, MAX_SCALE);
const normDeg = (deg) => {
    let d = deg % 360;
    if (d < 0) d += 360;
    return d;
};

const slice = createSlice({
    name: VIEWPORT_NAME,
    initialState: VIEWPORT_STATE,
    reducers: {
        zoomIn(state) {
            state.scale = clampScale(state.scale * ZOOM_STEP);
        },
        zoomOut(state) {
            state.scale = clampScale(state.scale / ZOOM_STEP);
        },
        zoomTo(state, { payload }) {
            const s = Number(payload?.scale);
            if (Number.isFinite(s)) state.scale = clampScale(s);
        },
        panBy(state, { payload }) {
            state.tx += Number(payload?.dx) || 0;
            state.ty += Number(payload?.dy) || 0;
        },
        rotateBy(state, { payload }) {
            state.rotation = normDeg(
                state.rotation + (Number(payload?.deg) || 0)
            );
        },
        rotateLeft(state) {
            state.rotation = normDeg(state.rotation - 90);
        },
        rotateRight(state) {
            state.rotation = normDeg(state.rotation + 90);
        },
        fitToScreen(state, { payload }) {
            const {
                contentW,
                contentH,
                viewportW,
                viewportH,
                padding = 16,
            } = payload || {};
            if (!contentW || !contentH || !viewportW || !viewportH) return;
            const sw = (viewportW - padding * 2) / contentW;
            const sh = (viewportH - padding * 2) / contentH;
            const nextScale = clampScale(Math.max(0.0001, Math.min(sw, sh)));
            state.scale = nextScale;
            const screenW = contentW * nextScale;
            const screenH = contentH * nextScale;
            state.tx = Math.round((viewportW - screenW) / 2);
            state.ty = Math.round((viewportH - screenH) / 2);
        },
        setTransform(state, { payload }) {
            if (payload?.scale != null)
                state.scale = clampScale(Number(payload.scale));
            if (payload?.tx != null) state.tx = Number(payload.tx) || 0;
            if (payload?.ty != null) state.ty = Number(payload.ty) || 0;
            if (payload?.rotation != null)
                state.rotation = normDeg(Number(payload.rotation));
        },
        resetViewport() {
            return { ...VIEWPORT_STATE };
        },
    },
});

export const viewportReducer = slice.reducer;
export const viewportActions = slice.actions;
