/**
 * 단축키 바인딩, 스코프, 최근 실행 기록을 관리합니다.
 */
import {createSlice, type PayloadAction} from "@reduxjs/toolkit";
import { NOTION_SHORTCUT_BINDINGS } from "@features/shortcuts/config/notionShortcuts.ts";
import type {
    ShortcutBinding,
    ShortcutEvent,
    ShortcutScope,
    ShortcutTriggerPayload
} from "@features/shortcuts/model/shortcuts.types.ts";
import type { ShortcutsState } from "@features/shortcuts/state/shortcuts.types.ts";

/**
 * 단축키 slice의 초기 상태입니다.
 */
const initialState: ShortcutsState = {
    enabled: true,
    scope: "global",
    overlayDepth: 0,
    bindings: NOTION_SHORTCUT_BINDINGS,
    pending: null,
    lastTriggered: null,
    history: [],
    nextEventId: 1,
};

/**
 * 단축키 상태와 reducer를 정의하는 slice입니다.
 */
const shortcutsSlice = createSlice({
    name: "shortcuts",
    initialState,
    reducers: {
        setScope(state, action: PayloadAction<ShortcutScope>) {
            state.scope = action.payload;
        },
        setEnabled(state, action: PayloadAction<boolean>) {
            state.enabled = action.payload;
        },
        setBindings(state, action: PayloadAction<ShortcutBinding[]>) {
            state.bindings = action.payload;
        },
        pushOverlay(state) {
            state.overlayDepth += 1;
        },
        popOverlay(state) {
            state.overlayDepth = Math.max(0, state.overlayDepth - 1);
        },
        triggerShortcut(state, action: PayloadAction<ShortcutTriggerPayload>) {
            const event: ShortcutEvent = {
                ...action.payload,
                id: state.nextEventId,
                triggeredAt: Date.now(),
            };

            state.nextEventId += 1;
            state.pending = event;
            state.lastTriggered = event;
            state.history = [event, ...state.history].slice(0, 50);
        },
        consumeShortcut(state, action: PayloadAction<number | null | undefined>) {
            if (!state.pending) return;
            if (action.payload != null && state.pending.id !== action.payload) return;
            state.pending = null;
        },
        clearShortcutHistory(state) {
            state.history = [];
        },
    },
});

/**
 * shortcuts Actions 액션 모음입니다.
 */
export const shortcutsActions = shortcutsSlice.actions;

/**
 * shortcuts Reducer reducer입니다.
 */
export const shortcutsReducer= shortcutsSlice.reducer
