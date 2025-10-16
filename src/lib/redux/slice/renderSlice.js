import { createSlice } from '@reduxjs/toolkit';

const DEFAULT = {
    buckets: [
        { id: 'background', type: 'background', dirty: false },
        { id: 'content-dynamic', type: 'content', static: false, dirty: true },
        { id: 'overlay', type: 'overlay', dirty: true },
    ],
    assignment: {},
};

const renderSlice = createSlice({
    name: 'render',
    initialState: DEFAULT,
    reducers: {
        replaceAll: (state, { payload }) => ({
            buckets: Array.isArray(payload?.buckets)
                ? payload.buckets
                : DEFAULT.buckets,
            assignment: payload?.assignment ?? {},
        }),
        assignShapeToBucket: (state, { payload }) => {
            const { shapeId, bucketId } = payload || {};
            if (!shapeId || !bucketId) return;
            state.assignment[shapeId] = bucketId;
        },
        clearShapeAssignment: (state, { payload }) => {
            if (payload) delete state.assignment[payload];
        },
        setBucketDirty: (state, { payload }) => {
            const b = state.buckets.find((x) => x.id === payload?.id);
            if (b) b.dirty = !!payload?.dirty;
        },
        resetRender: () => DEFAULT,
    },
});

export const {
    replaceAll,
    assignShapeToBucket,
    clearShapeAssignment,
    setBucketDirty,
    resetRender,
} = renderSlice.actions;
export default renderSlice.reducer;
