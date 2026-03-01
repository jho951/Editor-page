import {createSlice, type PayloadAction} from "@reduxjs/toolkit";

type Scope = "text" | "canvas" | "global";

type ShortcutsState = {
    enabled: boolean;
    scope: Scope;
    overlayDepth: number;
};

const initialState: ShortcutsState = {
    enabled: true,
    scope: "global",
    overlayDepth: 0,
};

const shortcutsSlice = createSlice({
    name: "shortcuts",
    initialState,
    reducers: {
        setScope(state, action: PayloadAction<Scope>) {
            state.scope = action.payload;
        },
        setEnabled(state, action: PayloadAction<boolean>) {
            state.enabled = action.payload;
        },
        pushOverlay(state) {
            state.overlayDepth += 1;
        },
        popOverlay(state) {
            state.overlayDepth = Math.max(0, state.overlayDepth - 1);
        },
    },
});

export const shortcutsActions = shortcutsSlice.actions;
export const shortcutsReducer= shortcutsSlice.reducer
