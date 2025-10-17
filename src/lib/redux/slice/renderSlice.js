import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT } from '../constant/default';
import { REDUCER_NAME } from '../constant/name';

const renderSlice = createSlice({
    name: REDUCER_NAME.RENDER,
    initialState: DEFAULT.RENDER,
    reducers: {
        markDirty: (s, { payload }) => {
            s.dirty[payload] = true;
        },
        clearDirty: (s, { payload }) => {
            s.dirty[payload] = false;
        },
        markAllDirty: (s) => {
            s.dirty.vector = s.dirty.overlay = s.dirty.hitmap = true;
        },
    },
});
export const { markDirty, clearDirty, markAllDirty } = renderSlice.actions;
export default renderSlice.reducer;
