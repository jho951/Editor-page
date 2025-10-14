import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    selectedIds: [], // string[]
};

const selectionSlice = createSlice({
    name: 'selection',
    initialState,
    reducers: {
        setSelection: (s, { payload }) => {
            s.selectedIds = Array.isArray(payload)
                ? payload
                : payload
                  ? [payload]
                  : [];
        },
        clearSelection: (s) => {
            s.selectedIds = [];
        },
        toggleSelection: (s, { payload }) => {
            const id = String(payload);
            const i = s.selectedIds.indexOf(id);
            if (i >= 0) s.selectedIds.splice(i, 1);
            else s.selectedIds.push(id);
        },
    },
});

export const { setSelection, clearSelection, toggleSelection } =
    selectionSlice.actions;
export default selectionSlice.reducer;
