/**
 * 단축키 상태를 읽는 selector 모음입니다.
 */

import type { RootState } from "@app/store/store.ts";
import type { ShortcutBinding, ShortcutScope } from "@features/shortcuts/model/shortcuts.types.ts";

/**
 * 단축키 slice 전체 상태를 반환합니다.
 *
 * @param s 현재 Redux 상태입니다.
 * @returns 단축키 slice 전체 상태를 반환합니다.
 */
export const selectShortcutsState = (s: RootState) => s.shortcut;

/**
 * 단축키 기능 활성화 여부를 반환합니다.
 *
 * @param s 현재 Redux 상태입니다.
 * @returns 단축키가 활성화되어 있으면 `true`, 아니면 `false`를 반환합니다.
 */
export const selectShortcutEnabled = (s: RootState) => selectShortcutsState(s).enabled;

/**
 * 현재 단축키 스코프를 반환합니다.
 *
 * @param s 현재 Redux 상태입니다.
 * @returns 현재 적용 중인 단축키 스코프를 반환합니다.
 */
export const selectShortcutScope = (s: RootState) => selectShortcutsState(s).scope;

/**
 * 오버레이 중첩 깊이를 반환합니다.
 *
 * @param s 현재 Redux 상태입니다.
 * @returns 현재 오버레이 중첩 깊이 숫자를 반환합니다.
 */
export const selectShortcutOverlayDepth = (s: RootState) => selectShortcutsState(s).overlayDepth;

/**
 * 현재 단축키 바인딩 목록을 반환합니다.
 *
 * @param s 현재 Redux 상태입니다.
 * @returns 등록된 단축키 바인딩 배열을 반환합니다.
 */
export const selectShortcutBindings = (s: RootState) => selectShortcutsState(s).bindings;

/**
 * 아직 소비되지 않은 단축키 이벤트를 반환합니다.
 *
 * @param s 현재 Redux 상태입니다.
 * @returns 대기 중인 단축키 이벤트 또는 `null`을 반환합니다.
 */
export const selectShortcutPending = (s: RootState) => selectShortcutsState(s).pending;

/**
 * 마지막으로 실행된 단축키 이벤트를 반환합니다.
 *
 * @param s 현재 Redux 상태입니다.
 * @returns 마지막 실행 이벤트 또는 `null`을 반환합니다.
 */
export const selectShortcutLastTriggered = (s: RootState) => selectShortcutsState(s).lastTriggered;

/**
 * 최근 실행된 단축키 기록을 반환합니다.
 *
 * @param s 현재 Redux 상태입니다.
 * @returns 최근 실행된 단축키 이벤트 기록 배열을 반환합니다.
 */
export const selectShortcutHistory = (s: RootState) => selectShortcutsState(s).history;

/**
 * 현재 스코프에서 유효한 단축키 바인딩 목록을 반환합니다.
 *
 * @param s 현재 Redux 상태입니다.
 * @param scope 현재 단축키 스코프입니다.
 * @returns 현재 스코프에서 사용할 수 있는 단축키 바인딩 배열을 반환합니다.
 */
export function selectShortcutBindingsForScope(
  s: RootState,
  scope: ShortcutScope
): ShortcutBinding[] {
  return selectShortcutBindings(s).filter((binding) => binding.scope === "global" || binding.scope === scope);
}
