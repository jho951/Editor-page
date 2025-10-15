import { createSlice } from '@reduxjs/toolkit';
import { state } from '../../constant/state';

const coerceSize = (n, fallback) => {
    const v = Number(n);
    return Number.isFinite(v) && v > 0 ? v : fallback;
};

const canvasSlice = createSlice({
    name: 'canvas',
    initialState: state.CANVAS,
    reducers: {
        replaceAll: (state, { payload }) => {
            return {
                width: coerceSize(payload?.width, state.CANVAS.width),
                height: coerceSize(payload?.height, state.CANVAS.height),
                background: payload?.background ?? null,
                grid: {
                    enabled: Boolean(payload?.grid?.enabled),
                    size: coerceSize(
                        payload?.grid?.size,
                        state.CANVAS.grid.size
                    ),
                },
            };
        },

        setSize: (state, { payload }) => {
            const w = coerceSize(payload?.width, state.width);
            const h = coerceSize(payload?.height, state.height);
            state.width = w;
            state.height = h;
        },
        setBackground: (state, { payload }) => {
            state.background = payload ?? null;
        },
        setGrid: (state, { payload }) => {
            if (payload?.enabled != null)
                state.grid.enabled = Boolean(payload.enabled);
            if (payload?.size != null)
                state.grid.size = coerceSize(payload.size, state.grid.size);
        },
        resetCanvas: () => state.CANVAS,
    },
});

export const { replaceAll, setSize, setBackground, setGrid, resetCanvas } =
    canvasSlice.actions;
export default canvasSlice.reducer;
