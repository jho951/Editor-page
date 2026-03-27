/**
 * 에디터 화면에서 사용하는 파생 상태를 조회하는 selector 모음입니다.
 */

import type { RootState } from "@app/store/store.ts";

/**
 * 에디터 slice 전체 상태를 반환합니다.
 *
 * @param state 현재 Redux 상태입니다.
 * @returns 에디터 slice 전체 상태를 반환합니다.
 */
export const selectEditor = (state: RootState) => state.editor;

/**
 * 현재 열려 있는 편집 문서 메타데이터를 반환합니다.
 *
 * @param state 현재 Redux 상태입니다.
 * @returns 현재 문서가 없으면 `null`, 있으면 문서 메타데이터를 반환합니다.
 */
export const selectCurrentEditorDocument = (state: RootState) => {

  const documentId = state.editor.document.currentDocumentId;
  return documentId ? state.editor.document.byId[documentId] ?? null : null;
};

/**
 * 현재 문서 루트 아래에 표시할 블록 목록을 반환합니다.
 *
 * @param state 현재 Redux 상태입니다.
 * @returns 현재 화면에 표시할 블록 배열을 반환합니다.
 */
export const selectEditorBlocks = (state: RootState) => {

  const currentDocument = selectCurrentEditorDocument(state);
  if (!currentDocument) return [];

  const childIds = state.editor.blocks.childrenByParentId[currentDocument.rootBlockId] ?? [];
  return childIds.map((blockId) => state.editor.blocks.byId[blockId]).filter(Boolean);
};

/**
 * 현재 저장 상태를 반환합니다.
 *
 * @param state 현재 Redux 상태입니다.
 * @returns 에디터의 현재 저장 상태 문자열을 반환합니다.
 */
export const selectEditorSaveState = (state: RootState) => state.editor.saveState;

/**
 * 현재 선택된 블록 ID를 반환합니다.
 *
 * @param state 현재 Redux 상태입니다.
 * @returns 선택된 블록 ID 또는 `null`을 반환합니다.
 */
export const selectEditorSelectedBlockId = (state: RootState) => state.editor.selectedBlockId;

/**
 * 마지막 저장 시각을 반환합니다.
 *
 * @param state 현재 Redux 상태입니다.
 * @returns 마지막 저장 시각 타임스탬프 또는 `null`을 반환합니다.
 */
export const selectEditorLastSavedAt = (state: RootState) => state.editor.lastSavedAt;

/**
 * 저장 과정에서 발생한 에러 메시지를 반환합니다.
 *
 * @param state 현재 Redux 상태입니다.
 * @returns 에러 메시지 또는 `null`을 반환합니다.
 */
export const selectEditorErrorMessage = (state: RootState) => state.editor.errorMessage;

/**
 * 전송 대기 중인 operation 개수를 반환합니다.
 *
 * @param state 현재 Redux 상태입니다.
 * @returns 저장 큐에 쌓인 operation 개수를 반환합니다.
 */
export const selectEditorQueueSize = (state: RootState) => state.editor.queue.ops.length;

/**
 * 아직 반영되지 않은 변경이 남아 있는지 확인합니다.
 *
 * @param state 현재 Redux 상태입니다.
 * @returns 미반영 변경이 있으면 `true`, 없으면 `false`를 반환합니다.
 */
export const selectEditorHasPendingChanges = (state: RootState) =>
  state.editor.queue.ops.length > 0 || state.editor.inFlight !== null;
