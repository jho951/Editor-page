import { createSlice } from '@reduxjs/toolkit';

const DEFAULT = {
    width: 800,
    height: 600,
    background: null,
    grid: { enabled: false, size: 10 },
};

const coerceSize = (n, fallback) => {
    const v = Number(n);
    return Number.isFinite(v) && v > 0 ? v : fallback;
};

const canvasSlice = createSlice({
    name: 'canvas',
    initialState: DEFAULT,
    reducers: {
        replaceAll: (state, { payload }) => ({
            width: coerceSize(payload?.width, DEFAULT.width),
            height: coerceSize(payload?.height, DEFAULT.height),
            background: payload?.background ?? null,
            grid: {
                enabled: Boolean(payload?.grid?.enabled),
                size: coerceSize(payload?.grid?.size, DEFAULT.grid.size),
            },
        }),
        setSize: (state, { payload }) => {
            state.width = coerceSize(payload?.width, state.width);
            state.height = coerceSize(payload?.height, state.height);
        },
        setBackground: (state, { payload }) => {
            state.background = payload ?? null;
        },
        setGrid: (state, { payload }) => {
            if (payload?.enabled != null)
                state.grid.enabled = !!payload.enabled;
            if (payload?.size != null)
                state.grid.size = coerceSize(payload.size, state.grid.size);
        },
        resetCanvas: () => DEFAULT,
    },
});

export const { replaceAll, setSize, setBackground, setGrid, resetCanvas } =
    canvasSlice.actions;
export default canvasSlice.reducer;
