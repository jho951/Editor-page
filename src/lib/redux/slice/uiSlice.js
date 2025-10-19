import { createSlice } from '@reduxjs/toolkit';

// tool: 'select' | 'rect' | 'ellipse' | 'line' | 'polygon' | 'star' | 'freedraw' | 'text'
const initialState = {
    tool: 'select',
    polygonSides: 5,
    starPoints: 5,
    starInnerRatio: 0.5,
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
    },
});

export const { setTool, setPolygonSides, setStarPoints, setStarInnerRatio } =
    uiSlice.actions;

export const selectTool = (st) => st.ui.tool;
export const selectPoly = (st) => st.ui.polygonSides;
export const selectStarPts = (st) => st.ui.starPoints;
export const selectStarRatio = (st) => st.ui.starInnerRatio;

export default uiSlice.reducer;
