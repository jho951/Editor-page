import { createSlice } from '@reduxjs/toolkit';

// 프로젝트에 맞춰 필요한 형태로 확장 가능
const DEFAULT = {
    byId: {}, // { [layerId]: { id, type, props... } }
    allIds: [], // [layerId, ...]
    selectedIds: [], // [layerId, ...]
};

const sanitize = (payload) => {
    const byId =
        payload?.byId && typeof payload.byId === 'object' ? payload.byId : {};
    const allIds = Array.isArray(payload?.allIds)
        ? payload.allIds
        : Object.keys(byId);
    const selectedIds = Array.isArray(payload?.selectedIds)
        ? payload.selectedIds
        : [];
    return { byId, allIds, selectedIds };
};

const layerSlice = createSlice({
    name: 'layers',
    initialState: DEFAULT,
    reducers: {
        replaceAll: (state, { payload }) => {
            return sanitize(payload);
        },

        resetLayer: () => DEFAULT,
    },
});

export const { replaceAll, reset, resetLayer } = layerSlice.actions;
export default layerSlice.reducer;
