import { createSlice } from '@reduxjs/toolkit';

// tool: 'select' | 'rect' | 'ellipse' | 'line' | 'polygon' | 'star' | 'freedraw' | 'text'
const initialState = {
    tool: 'select',
    polygonSides: 5,
    starPoints: 5,
    starInnerRatio: 0.5,
    view: { scale: 1, tx: 0, ty: 0 },
    canvasBg: '#f5f5f5',
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setTool(state, action) {
            state.tool = action.payload;
        },
        setPolygonSides(state, action) {
            const v = Number(action.payload) || 5;
            state.polygonSides = Math.max(3, v);
        },
        setStarPoints(state, action) {
            const v = Number(action.payload) || 5;
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
} = uiSlice.actions;

export const selectView = (s) => s.ui.view;
export const selectZoom = (s) => s.ui.view.scale;
export const selectTool = (st) => st.ui.tool;
export const selectPoly = (st) => st.ui.polygonSides;
export const selectStarPts = (st) => st.ui.starPoints;
export const selectStarRatio = (st) => st.ui.starInnerRatio;
export const selectCanvasBg = (s) => s.ui.canvasBg;

export default uiSlice.reducer;
