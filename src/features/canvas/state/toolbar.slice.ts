import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ToolbarState = {
    background: string | null;
};

const initialState: ToolbarState = { background: null };

const toolbarSlice = createSlice({
    name: "toolbar",
    initialState,
    reducers: {
        setBackground(state, action: PayloadAction<string | null>) {
            state.background = action.payload;
        },
    },
});

export const toolbarActions = toolbarSlice.actions;
export const toolbarReducer= toolbarSlice.reducer;
