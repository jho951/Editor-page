import { createSlice } from '@reduxjs/toolkit';
import { HEADER_NAME, HEADER_STATE } from './header.initial';

const headerSlice = createSlice({
    name: HEADER_NAME,
    initialState: HEADER_STATE,
    reducers: {
        setTool(state, action) {
            state.tool = action.payload;
        },
        setPolygonSides(state, action) {
            const v = Number(action.payload);
            state.polygonSides = Math.max(3, v);
        },
        setStarPoints(state, action) {
            const v = Number(action.payload);
            state.starPoints = Math.max(3, v);
        },
        setStarInnerRatio(state, action) {
            let v = Number(action.payload);
            if (!Number.isFinite(v)) v = 0.5;
            state.starInnerRatio = Math.min(0.95, Math.max(0.05, v));
        },

        setView(state, action) {
            const v = action.payload || {};
            if (typeof v.scale === 'number') state.view.scale = v.scale;
            if (typeof v.tx === 'number') state.view.tx = v.tx;
            if (typeof v.ty === 'number') state.view.ty = v.ty;
        },
        zoomTo(state, action) {
            state.view.scale = action.payload;
        },
        panBy(state, action) {
            state.view.tx += action.payload.dx || 0;
            state.view.ty += action.payload.dy || 0;
        },
        resetView(state) {
            state.view = { scale: 1, tx: 0, ty: 0 };
        },
        setCanvasBg(state, action) {
            state.canvasBg = action.payload || '#FFFFFF';
        },
    },
});

export const {
    setTool,
    setPolygonSides,
    setStarPoints,
    setStarInnerRatio,
    setView,
    zoomTo,
    panBy,
    resetView,
    setCanvasBg,
} = headerSlice.actions;

export default headerSlice.reducer;
