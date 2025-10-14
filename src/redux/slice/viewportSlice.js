import { createSlice } from '@reduxjs/toolkit';

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const initialState = {
    zoom: 1,
    minZoom: 0.1,
    maxZoom: 8,
    step: 0.1,
    pan: { x: 0, y: 0 },
    viewportSize: { w: 0, h: 0 },
};

const viewportSlice = createSlice({
    name: 'viewport',
    initialState,
    reducers: {
        zoomIn: (s) => {
            s.zoom = clamp(s.zoom + s.step, s.minZoom, s.maxZoom);
        },
        zoomOut: (s) => {
            s.zoom = clamp(s.zoom - s.step, s.minZoom, s.maxZoom);
        },
        setZoom: (s, { payload }) => {
            const v = Number(payload);
            if (Number.isFinite(v) && v > 0)
                s.zoom = clamp(v, s.minZoom, s.maxZoom);
        },
        resetZoom: (s) => {
            s.zoom = 1;
        },
        setPan: (s, { payload }) => {
            const { x = 0, y = 0 } = payload || {};
            s.pan.x = x;
            s.pan.y = y;
        },
        setViewportSize: (s, { payload }) => {
            const { w = 0, h = 0 } = payload || {};
            s.viewportSize.w = w;
            s.viewportSize.h = h;
        },
    },
});

export const { zoomIn, zoomOut, setZoom, resetZoom, setPan, setViewportSize } =
    viewportSlice.actions;

export default viewportSlice.reducer;
