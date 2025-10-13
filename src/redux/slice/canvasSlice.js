import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    width: 1,
    height: 1,
    background: null,
    grid: { enabled: false, size: 10 },
};

const canvasSlice = createSlice({
    name: 'canvas',
    initialState,
    reducers: {
        hydrate: (state, { payload }) => (payload ? payload : state),
        setSize: (state, { payload: { width, height } }) => {
            if (Number.isFinite(width) && width > 0) state.width = width;
            if (Number.isFinite(height) && height > 0) state.height = height;
        },
        setBackground: (state, { payload }) => {
            state.background = payload ?? null;
        },
        setGrid: (state, { payload }) => {
            state.grid = { ...state.grid, ...payload };
        },
        reset: () => initialState,
    },
});

export const { hydrate, setSize, setBackground, setGrid, reset } =
    canvasSlice.actions;
export default canvasSlice.reducer;

export const selectCanvas = (s) => s.vectorDoc.canvas;
