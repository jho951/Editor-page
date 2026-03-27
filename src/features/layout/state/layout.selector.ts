/**
 * 레이아웃 관련 상태를 읽는 selector 모음입니다.
 */

import type { RootState } from "@app/store/store.ts";

/**
 * 현재 활성화된 사이드바 키를 반환합니다.
 *
 * @param s 현재 Redux 상태입니다.
 * @returns 현재 활성화된 사이드바 키를 반환합니다.
 */
export const selectSidebarActiveKey = (s: RootState) => s.layout.activeKey;

/**
 * 사이드바 접힘 상태를 반환합니다.
 *
 * @param s 현재 Redux 상태입니다.
 * @returns 사이드바가 접혀 있으면 `true`, 아니면 `false`를 반환합니다.
 */
export const selectSidebarCollapsed = (s: RootState) => s.layout.sidebarCollapsed;

/**
 * 열려 있는 LNB 폴더 ID 목록을 반환합니다.
 *
 * @param s 현재 Redux 상태입니다.
 * @returns 현재 열려 있는 폴더 ID 배열을 반환합니다.
 */
export const selectLnbOpenFolderIds = (s: RootState) => s.layout.openFolderIds;

/**
 * 현재 폴더 트리 상태를 반환합니다.
 *
 * @param s 현재 Redux 상태입니다.
 * @returns LNB에 표시할 폴더 트리 배열을 반환합니다.
 */
export const selectFolders = (s: RootState) => s.layout.folders;

/**
 * 휴지통 항목 목록을 반환합니다.
 *
 * @param s 현재 Redux 상태입니다.
 * @returns 휴지통 항목 배열을 반환합니다.
 */
export const selectTrashItems = (s: RootState) => s.layout.trashItems;

/**
 * 최근 문서 ID 목록을 반환합니다.
 *
 * @param s 현재 Redux 상태입니다.
 * @returns 최근 문서 ID 배열을 반환합니다.
 */
export const selectRecentDocIds = (s: RootState) => s.layout.recentDocIds;

/**
 * 고정된 문서 ID 목록을 반환합니다.
 *
 * @param s 현재 Redux 상태입니다.
 * @returns 고정된 문서 ID 배열을 반환합니다.
 */
export const selectPinnedDocIds = (s: RootState) => s.layout.pinnedDocIds;

/**
 * 공유된 문서 ID 목록을 반환합니다.
 *
 * @param s 현재 Redux 상태입니다.
 * @returns 공유된 문서 ID 배열을 반환합니다.
 */
export const selectSharedDocIds = (s: RootState) => s.layout.sharedDocIds;

/**
 * 마지막 문서 위치 정보를 반환합니다.
 *
 * @param s 현재 Redux 상태입니다.
 * @returns 마지막으로 열었던 문서 위치 정보 또는 `null`을 반환합니다.
 */
export const selectLastLocation = (s: RootState) => s.layout.lastLocation;
