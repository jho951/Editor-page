import { createSlice } from '@reduxjs/toolkit';

const defaultBuckets = [
    { id: 'background', type: 'background', dirty: false },
    { id: 'content-dynamic', type: 'content', static: false, dirty: true },
    { id: 'overlay', type: 'overlay', dirty: true },
];

const initialState = {
    buckets: defaultBuckets,
    assignment: {},
};

const renderSlice = createSlice({
    name: 'render',
    initialState,
    reducers: {
        hydrate: (state, { payload }) =>
            payload
                ? {
                      buckets:
                          Array.isArray(payload.buckets) &&
                          payload.buckets.length
                              ? payload.buckets
                              : defaultBuckets,
                      assignment: payload.assignment || {},
                  }
                : state,
        setBuckets: (state, { payload }) => {
            state.buckets = payload;
        },
        assignLayer: (state, { payload: { layerId, bucketId } }) => {
            state.assignment[layerId] = bucketId;
        },
        unassignLayer: (state, { payload: layerId }) => {
            delete state.assignment[layerId];
        },
        markDirty: (state, { payload: { bucketId, dirty } }) => {
            const b = state.buckets.find((b) => b.id === bucketId);
            if (b) b.dirty = !!dirty;
        },
        reset: () => initialState,
    },
});

export const {
    hydrate,
    setBuckets,
    assignLayer,
    unassignLayer,
    markDirty,
    reset,
} = renderSlice.actions;
export default renderSlice.reducer;

export const selectRender = (s) => s.vectorDoc.render;
export const selectBucketById = (s, id) =>
    s.vectorDoc.render.buckets.find((b) => b.id === id) || null;
export const selectLayerBucket = (s, layerId) =>
    s.vectorDoc.render.assignment[layerId] || null;
