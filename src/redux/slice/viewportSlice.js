import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    zoom: 1,
    pan: { x: 0, y: 0 },
    rotation: 0,
};

const viewportSlice = createSlice({
    name: 'viewport',
    initialState,
    reducers: {
        setZoom: (state, { payload }) => {
            const z = Number(payload);
            if (Number.isFinite(z) && z > 0) state.zoom = z;
        },
        zoomBy: (state, { payload }) => {
            const f = Number(payload);
            if (Number.isFinite(f) && f > 0) state.zoom *= f;
        },
        setPan: (state, { payload: { x, y } }) => {
            if (Number.isFinite(x)) state.pan.x = x;
            if (Number.isFinite(y)) state.pan.y = y;
        },
        panBy: (state, { payload: { dx = 0, dy = 0 } }) => {
            state.pan.x += dx;
            state.pan.y += dy;
        },
        setRotation: (state, { payload }) => {
            const r = Number(payload);
            if (Number.isFinite(r)) state.rotation = r;
        },
        reset: () => initialState,
    },
});

export const { setZoom, zoomBy, setPan, panBy, setRotation, reset } =
    viewportSlice.actions;
export default viewportSlice.reducer;

// selectors
export const selectViewport = (s) => s.viewport;
