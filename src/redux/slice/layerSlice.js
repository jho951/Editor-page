import { createSlice } from '@reduxjs/toolkit';

const initialState = [];

const layerSlice = createSlice({
    name: 'layers',
    initialState,
    reducers: {
        replaceAll: (state, { payload }) =>
            Array.isArray(payload) ? payload : state,
        addLayer: (state, { payload }) => {
            state.push(payload);
        },
        updateLayer: (state, { payload }) => {
            const i = state.findIndex((l) => l.id === payload.id);
            if (i >= 0) state[i] = { ...state[i], ...payload.patch };
        },
        removeLayer: (state, { payload }) =>
            state.filter((l) => l.id !== payload),
        resetLayer: () => initialState,
    },
});

export const { replaceAll, addLayer, updateLayer, removeLayer, resetLayer } =
    layerSlice.actions;
export default layerSlice.reducer;
