/**
 * 에디터 기능의 로컬 fallback에 사용하는 샘플 문서 데이터를 제공합니다.
 */

import type { EditorBlockType, EditorContent, EditorDocumentSnapshot } from "@features/editor/model/editor.types.ts";

/**
 * 블록 목 데이터를 생성합니다.
 *
 * @param type type 값입니다.
 * @param text text 값입니다.
 * @param checked checked 값입니다.
 * @returns EditorContent 값을 반환합니다.
 */
function block(type: EditorBlockType, text: string, checked = false): EditorContent {
  return { type, text, checked, marks: [] };
}

/**
 * 문서별 루트 블록 ID를 생성합니다.
 *
 * @param documentId 대상 문서 ID입니다.
 * @returns 문자열 결과를 반환합니다.
 */
function rootBlockId(documentId: string): string {
  return `root-${documentId}`;
}

// Helper keeps mock documents aligned with the normalized tree shape used in the editor state.

/**
 * Block를 생성합니다.
 *
 * @param documentId 대상 문서 ID입니다.
 * @param blockId 대상 블록 ID입니다.
 * @param version version 값입니다.
 * @param content 블록에 반영할 본문 내용입니다.
 * @param index index 값입니다.
 * @returns 계산된 결과를 반환합니다.
 */
function createBlock(
  documentId: string,
  blockId: string,
  version: number,
  content: EditorContent,
  index: number
) {
  return {
    id: blockId,
    parentId: rootBlockId(documentId),
    orderKey: `ord:${String(index).padStart(6, "0")}`,
    version,
    content,
  };
}

/**
 * 에디터 로컬 fallback에서 사용하는 샘플 문서 모음입니다.
 */
export const MOCK_EDITOR_DOCUMENTS: Record<string, EditorDocumentSnapshot> = {
  d1: {
    id: "d1",
    title: "Getting Started",
    version: 4,
    rootBlockId: rootBlockId("d1"),
    blocks: [
      createBlock("d1", "d1-b1", 1, block("heading1", "Getting Started"), 0),
      createBlock("d1", "d1-b2", 1, block("paragraph", "이 문서는 text-only block editor 저장 모델 데모입니다."), 1),
      createBlock("d1", "d1-b3", 1, block("to_do", "queue와 409 conflict 흐름 확인하기", true), 2),
      createBlock("d1", "d1-b4", 1, block("bulleted_list", "문단을 수정하면 로컬 queue에 먼저 반영됩니다."), 3),
    ],
  },
  d2: {
    id: "d2",
    title: "Weekly To-do List",
    version: 3,
    rootBlockId: rootBlockId("d2"),
    blocks: [
      createBlock("d2", "d2-b1", 1, block("heading2", "이번 주 할 일"), 0),
      createBlock("d2", "d2-b2", 1, block("to_do", "문서 구조 정리", false), 1),
      createBlock("d2", "d2-b3", 1, block("to_do", "저장 정책 문서화", false), 2),
    ],
  },
  d3: {
    id: "d3",
    title: "Job Application Planner",
    version: 3,
    rootBlockId: rootBlockId("d3"),
    blocks: [
      createBlock("d3", "d3-b1", 1, block("heading1", "지원 일정"), 0),
      createBlock("d3", "d3-b2", 1, block("numbered_list", "포트폴리오 업데이트"), 1),
      createBlock("d3", "d3-b3", 1, block("numbered_list", "이력서 수정"), 2),
    ],
  },
  d4: {
    id: "d4",
    title: "Club Homepage",
    version: 2,
    rootBlockId: rootBlockId("d4"),
    blocks: [
      createBlock("d4", "d4-b1", 1, block("heading1", "홈페이지 초안"), 0),
      createBlock("d4", "d4-b2", 1, block("paragraph", "소개 문구와 섹션 구조를 먼저 정리합니다."), 1),
    ],
  },
};
