/**
 * shortcuts 관련 타입을 정의합니다.
 */

import type { ShortcutBinding, ShortcutEvent, ShortcutScope } from "@features/shortcuts/model/shortcuts.types.ts";

export interface ShortcutsState {
    enabled: boolean;
    scope: ShortcutScope;
    overlayDepth: number;
    bindings: ShortcutBinding[];
    pending: ShortcutEvent | null;
    lastTriggered: ShortcutEvent | null;
    history: ShortcutEvent[];
    nextEventId: number;
}
