/**
 * shortcuts 디렉토리의 공개 export를 재노출합니다.
 */

export { shortcutsActions, shortcutsReducer } from "@features/shortcuts/state/shortcuts.slice.ts";
export {
  selectShortcutBindings,
  selectShortcutBindingsForScope,
  selectShortcutEnabled,
  selectShortcutHistory,
  selectShortcutLastTriggered,
  selectShortcutOverlayDepth,
  selectShortcutPending,
  selectShortcutScope,
  selectShortcutsState,
} from "@features/shortcuts/state/shortcuts.selector.ts";
export type {
  ShortcutBinding,
  ShortcutCommand,
  ShortcutEvent,
  ShortcutScope,
  ShortcutTriggerPayload,
} from "@features/shortcuts/model/shortcuts.types.ts";
