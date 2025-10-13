import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    encoding: 'rgb24',
    pickTolerance: 4,
    idToColor: {},
    colorToId: {},
    nextId: 1,
};

const hitmapSlice = createSlice({
    name: 'hitmap',
    initialState,
    reducers: {
        hydrate: (state, { payload }) =>
            payload
                ? {
                      encoding: payload.encoding || 'rgb24',
                      pickTolerance: Number.isFinite(payload.pickTolerance)
                          ? payload.pickTolerance
                          : 4,
                      idToColor: payload.idToColor || {},
                      colorToId: payload.colorToId || {},
                      nextId: Number.isFinite(payload.nextId)
                          ? payload.nextId
                          : 1,
                  }
                : state,
        setPickTolerance: (state, { payload }) => {
            state.pickTolerance = Math.max(0, payload | 0);
        },
        reserveId: (state) => {
            state.nextId += 1;
        },
        registerMapping: (state, { payload: { id, color } }) => {
            const key = color.join(',');
            state.idToColor[id] = color;
            state.colorToId[key] = id;
        },
        clearMappings: (state) => {
            state.idToColor = {};
            state.colorToId = {};
            state.nextId = 1;
        },
        reset: () => initialState,
    },
});

export const {
    hydrate,
    setPickTolerance,
    reserveId,
    registerMapping,
    clearMappings,
    reset,
} = hitmapSlice.actions;
export default hitmapSlice.reducer;

export const selectHitmap = (s) => s.vectorDoc.hitmap;
