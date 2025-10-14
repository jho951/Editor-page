import { createSlice } from '@reduxjs/toolkit';

const DEFAULT = {
    buckets: [], // [{ id, type, static?, dirty? }, ...]
    assignment: {}, // { [layerId]: bucketId }
};

const renderSlice = createSlice({
    name: 'render',
    initialState: DEFAULT,
    reducers: {
        // vectorJson.render 전체 교체용
        replaceAll: (state, { payload }) => {
            return {
                buckets: Array.isArray(payload?.buckets) ? payload.buckets : [],
                assignment:
                    payload?.assignment &&
                    typeof payload.assignment === 'object'
                        ? payload.assignment
                        : {},
            };
        },
        setBuckets: (state, { payload }) => {
            state.buckets = Array.isArray(payload) ? payload : [];
        },
        setAssignment: (state, { payload }) => {
            state.assignment =
                payload && typeof payload === 'object' ? payload : {};
        },
        assignLayer: (state, { payload }) => {
            const { layerId, bucketId } = payload || {};
            if (!layerId) return;
            if (bucketId == null) delete state.assignment[layerId];
            else state.assignment[layerId] = bucketId;
        },
        markBucketDirty: (state, { payload }) => {
            const id = payload;
            const b = state.buckets.find((x) => x.id === id);
            if (b) b.dirty = true;
        },
        resetRender: () => DEFAULT,
    },
});

export const {
    replaceAll,
    setBuckets,
    setAssignment,
    assignLayer,
    markBucketDirty,
    resetRender,
} = renderSlice.actions;
export default renderSlice.reducer;
