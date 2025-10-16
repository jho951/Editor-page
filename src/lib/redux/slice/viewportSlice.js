import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    zoom: 1,
    pan: { x: 0, y: 0 },
    minZoom: 0.1,
    maxZoom: 10,
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const viewportSlice = createSlice({
    name: 'viewport',
    initialState,
    reducers: {
        setZoom: (state, { payload }) => {
            state.zoom = clamp(
                Number(payload) || 1,
                state.minZoom,
                state.maxZoom
            );
        },
        zoomIn: (state) => {
            state.zoom = clamp(state.zoom * 1.1, state.minZoom, state.maxZoom);
        },
        zoomOut: (state) => {
            state.zoom = clamp(state.zoom / 1.1, state.minZoom, state.maxZoom);
        },
        setPan: (state, { payload }) => {
            state.pan = {
                x: payload?.x ?? state.pan.x,
                y: payload?.y ?? state.pan.y,
            };
        },
        panBy: (state, { payload }) => {
            state.pan = {
                x: state.pan.x + (payload?.dx ?? 0),
                y: state.pan.y + (payload?.dy ?? 0),
            };
        },
        resetViewport: () => initialState,

        // ★ Toolbar 호환용
        resetZoom: (state) => {
            state.zoom = 1;
        },
    },
});

export const {
    setZoom,
    zoomIn,
    zoomOut,
    setPan,
    panBy,
    resetViewport,
    resetZoom,
} = viewportSlice.actions;
export default viewportSlice.reducer;
