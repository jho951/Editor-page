/**
 * 에디터 operation 큐를 서버 전송 전에 정규화합니다.
 */

import type { EditorOperation, PendingQueue } from "@features/editor/model/editor.types.ts";

/**
 * 두 operation이 같은 블록을 대상으로 하는지 확인합니다.
 *
 * @param a 비교 기준이 되는 첫 번째 operation입니다.
 * @param b 비교 대상이 되는 두 번째 operation입니다.
 * @returns 같은 블록 ID를 가리키면 true, 아니면 false를 반환합니다.
 */
function sameBlock(a: EditorOperation, b: EditorOperation): boolean {
  return a.blockId === b.blockId;
}

// Queue normalization keeps the payload minimal without changing the final server-visible meaning.

/**
 * 서버 전송 전에 중복되거나 상쇄되는 operation을 정리합니다.
 *
 * @param ops 정규화하거나 전송할 operation 목록입니다.
 * @returns 서버에 보낼 최소 operation 목록을 반환합니다.
 */
export function normalizeEditorQueue(ops: EditorOperation[]): EditorOperation[] {
  const normalized: EditorOperation[] = [];

  for (const op of ops) {

    const lastBlockOp = normalized.filter((candidate) => sameBlock(candidate, op)).at(-1);

    // Once a block is deleted in the queue, later edits for the same block are meaningless.
    if (lastBlockOp?.type === "block.delete") {
      continue;
    }

    if (op.type === "block.replace_content") {
      // Content replacement is last-write-wins for the same block.

      const replaceIndex = normalized.findIndex(
        (candidate) => candidate.blockId === op.blockId && candidate.type === "block.replace_content"
      );
      if (replaceIndex >= 0) {
        normalized[replaceIndex] = op;
        continue;
      }

      normalized.push(op);
      continue;
    }

    if (op.type === "block.move") {
      // Only the final position matters before a flush.

      const moveIndex = normalized.findIndex(
        (candidate) => candidate.blockId === op.blockId && candidate.type === "block.move"
      );
      if (moveIndex >= 0) {
        normalized[moveIndex] = op;
        continue;
      }

      normalized.push(op);
      continue;
    }

    if (op.type === "block.delete") {
      // Create -> delete before sync cancels out entirely, so the server never sees that temporary block.

      const hasCreate = normalized.some(
        (candidate) => candidate.blockId === op.blockId && candidate.type === "block.create"
      );

      for (let i = normalized.length - 1; i >= 0; i -= 1) {
        if (normalized[i].blockId === op.blockId) {
          normalized.splice(i, 1);
        }
      }

      if (!hasCreate) {
        normalized.push(op);
      }
      continue;
    }

    normalized.push(op);
  }

  return normalized;
}

/**
 * 정규화된 operation 목록으로 대기 큐 구조를 생성합니다.
 *
 * @param ops 정규화하거나 전송할 operation 목록입니다.
 * @returns UI 조회와 전송에 모두 사용할 pending queue를 반환합니다.
 */
export function buildPendingQueue(ops: EditorOperation[]): PendingQueue {

  const normalized = normalizeEditorQueue(ops);
  return {
    // byBlockId is a fast lookup for UI and conflict handling; the ordered array remains the source of truth.
    ops: normalized,
    byBlockId: Object.fromEntries(normalized.map((op) => [op.blockId, op])),
  };
}
