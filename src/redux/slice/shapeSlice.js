import { createSlice, createSelector } from '@reduxjs/toolkit';

const initialState = {
    items: [],
};

const slice = createSlice({
    name: 'shape',
    initialState,
    reducers: {
        add(state, { payload }) {
            state.items.push(payload);
        },
        remove(state, { payload }) {
            const id = typeof payload === 'string' ? payload : payload?.id;
            state.items = state.items.filter((it) => it.id !== id);
        },
        update(state, { payload }) {
            // payload: { id, patch } | { id, ...fields }
            const { id, patch, ...rest } = payload || {};
            const idx = state.items.findIndex((it) => it.id === id);
            if (idx < 0) return;
            const delta = patch ? patch : rest;
            state.items[idx] = { ...state.items[idx], ...delta };
        },
        replaceAll(_state, { payload }) {
            // payload는 shape의 전체 스냅샷(예: { items: [...] })
            return payload;
        },
        clear(state) {
            state.items = [];
        },
        reorder(state, { payload }) {
            // payload: array of ids (new z-order)
            const idOrder = payload || [];
            const map = new Map(state.items.map((it) => [it.id, it]));
            state.items = idOrder.map((id) => map.get(id)).filter(Boolean);
        },
    },
});

export const { add, remove, update, replaceAll, clear, reorder } =
    slice.actions;
export default slice.reducer;

// selectors
export const selectVectorItems = (s) => s.shape.items;
export const selectActiveShape = (_s) => 'rect'; // 필요 시 대체(툴/모드와 통합)

// 샘플: id → item
export const makeSelectItemById = (id) =>
    createSelector(selectVectorItems, (items) =>
        items.find((it) => it.id === id)
    );
