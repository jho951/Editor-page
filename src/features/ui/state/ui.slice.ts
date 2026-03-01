import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ContextMenuItem = {
  label: string;
  onClick: () => void;
  danger?: boolean;
};

export type ContextMenuState =
  | {
      open: true;
      x: number;
      y: number;
      items: ContextMenuItem[];
    }
  | {
      open: false;
      x: 0;
      y: 0;
      items: [];
    };

export interface UiState {
  contextMenu: ContextMenuState;
}

const initialState: UiState = {
  contextMenu: { open: false, x: 0, y: 0, items: [] },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openContextMenu(state, action: PayloadAction<{ x: number; y: number; items: ContextMenuItem[] }>) {
      state.contextMenu = { open: true, x: action.payload.x, y: action.payload.y, items: action.payload.items };
    },
    closeContextMenu(state) {
      state.contextMenu = { open: false, x: 0, y: 0, items: [] };
    },
  },
});

export const uiActions = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
