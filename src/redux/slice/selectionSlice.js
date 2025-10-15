import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    ids: [],
    primary: null,
    anchor: null, // { shapeId, index } — 폴리라인/폴리곤/프리드로우 노드 선택
};

const selectionSlice = createSlice({
    name: 'selection',
    initialState,
    reducers: {
        setSelection: (state, { payload }) => {
            if (payload == null) {
                state.ids = [];
                state.primary = null;
                state.anchor = null;
                return;
            }
            if (Array.isArray(payload)) {
                state.ids = payload;
                state.primary = payload[0] ?? null;
                state.anchor = null;
                return;
            }
            state.ids = payload.ids ?? [];
            state.primary = payload.primary ?? state.ids[0] ?? null;
            state.anchor = null;
        },
        addToSelection: (state, { payload }) => {
            const id = payload;
            if (!id) return;
            if (!state.ids.includes(id)) state.ids.push(id);
            state.primary = state.primary ?? id;
        },
        removeFromSelection: (state, { payload }) => {
            state.ids = state.ids.filter((x) => x !== payload);
            if (state.primary === payload) state.primary = state.ids[0] ?? null;
            if (state.anchor?.shapeId === payload) state.anchor = null;
        },
        setAnchorSelection: (state, { payload }) => {
            state.anchor = payload ?? null;
        },
        clearSelection: () => initialState,
    },
});

export const {
    setSelection,
    addToSelection,
    removeFromSelection,
    setAnchorSelection,
    clearSelection,
} = selectionSlice.actions;
export default selectionSlice.reducer;
