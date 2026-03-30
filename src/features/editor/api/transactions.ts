/**
 * 에디터 operation을 서버로 전송하고 로컬 fallback 적용을 처리합니다.
 */

import { DOCUMENTS_API_BASE_URL, documentsApi } from "@shared/api/client.ts";
import type { HttpError } from "@shared/api/client.types.ts";
import { endpoints } from "@shared/api/endpoints.ts";
import { MOCK_EDITOR_DOCUMENTS } from "@features/editor/model/editor.mock.ts";
import type {
  EditorConflictItem,
  EditorConflictResponse,
  EditorContent,
  EditorMark,
  EditorDocumentSnapshot,
  EditorOperation,
  EditorRichTextContent,
  EditorTransactionRequest,
  EditorTransactionSuccess,
  GatewayEditorOperation,
  GatewayEditorTransactionRequest
} from "@features/editor/model/editor.types.ts";

/**
 * 새 블록 생성 시 사용할 기본 본문 값입니다.
 */
const EMPTY_BLOCK_CONTENT: EditorContent = {
  type: "paragraph",
  text: "",
  checked: false,
  marks: [],
};

type GlobalResponse<T> = {
  data?: T;
};

type RichTextMark = EditorMark;

type RichTextContent = EditorRichTextContent;

type RemoteDocumentResponse = {
  id: string;
  title: string;
  version?: number;
};

type RemoteBlockResponse = {
  id: string;
  parentId?: string | null;
  orderKey?: string;
  version: number;
  type?: "TEXT";
  content: RichTextContent;
  deletedAt?: string | null;
};

type RemoteTransactionResult = {
  blockId?: string;
  blockRef?: string;
  tempId?: string;
  version?: number;
};

type RemoteTransactionResponse = {
  batchId?: string;
  documentVersion?: number;
  tempIdMappings?: Record<string, string>;
  idMappings?: Record<string, string>;
  results?: RemoteTransactionResult[];
};

function unwrapEnvelope<T>(payload: T | GlobalResponse<T>): T {
  if (payload && typeof payload === "object" && "data" in (payload as GlobalResponse<T>)) {
    return (payload as GlobalResponse<T>).data as T;
  }
  return payload as T;
}

function toRichTextContent(content: EditorContent): RichTextContent {
  return {
    format: "rich_text",
    schemaVersion: 1,
    segments: [
      {
        text: content.text,
        marks: content.marks,
      },
    ],
  };
}

function toGatewayOperation(op: EditorOperation, index: number): GatewayEditorOperation {
  const opId = `op-${index + 1}`;

  switch (op.type) {
    case "block.create":
      return {
        opId,
        type: "BLOCK_CREATE" as const,
        blockRef: op.blockId,
        parentRef: op.parentId ?? null,
        afterRef: op.afterBlockId ?? null,
        beforeRef: op.beforeBlockId ?? null,
      };

    case "block.replace_content":
      return {
        opId,
        type: "BLOCK_REPLACE_CONTENT" as const,
        blockRef: op.blockId,
        version: op.version,
        content: toRichTextContent(op.content),
      };

    case "block.move":
      return {
        opId,
        type: "BLOCK_MOVE" as const,
        blockRef: op.blockId,
        version: op.version,
        parentRef: op.parentId ?? null,
        afterRef: op.afterBlockId ?? null,
        beforeRef: op.beforeBlockId ?? null,
      };

    case "block.delete":
      return {
        opId,
        type: "BLOCK_DELETE" as const,
        blockRef: op.blockId,
        version: op.version,
      };
  }
}

function toGatewayTransactionPayload(payload: EditorTransactionRequest): GatewayEditorTransactionRequest {
  return {
    clientId: payload.clientId,
    batchId: payload.batchId,
    operations: payload.operations.map(toGatewayOperation),
  };
}

function normalizeTransactionSuccess(
  payload: EditorTransactionRequest,
  rawResponse: GlobalResponse<RemoteTransactionResponse> | RemoteTransactionResponse | EditorTransactionSuccess
): EditorTransactionSuccess {
  const unwrapped = unwrapEnvelope(rawResponse as GlobalResponse<RemoteTransactionResponse> | RemoteTransactionResponse);
  const response = (unwrapped ?? {}) as RemoteTransactionResponse;

  const idMappings = response.tempIdMappings ?? response.idMappings ?? {};
  const results = (Array.isArray(response.results) ? response.results : []).map((result) => {
    const resolvedBlockId = String(result.blockId ?? result.blockRef ?? "");
    const tempId = typeof result.tempId === "string" ? result.tempId : undefined;
    const localBlockId = tempId ??
      Object.entries(idMappings).find(([, realId]) => realId === resolvedBlockId)?.[0] ??
      resolvedBlockId;

    return {
      blockId: localBlockId,
      version: typeof result.version === "number" ? result.version : 1,
    };
  });

  // Ensure each non-delete operation has a result entry for local version reconciliation.
  payload.operations.forEach((op) => {
    if (op.type === "block.delete") return;

    if (results.some((item) => item.blockId === op.blockId)) return;

    const mappedRealId = idMappings[op.blockId];
    if (mappedRealId) {
      const mappedResult = results.find((item) => item.blockId === mappedRealId);
      if (mappedResult) {
        results.push({ blockId: op.blockId, version: mappedResult.version });
        return;
      }
    }

    const nextVersion = op.type === "block.create" ? 1 : op.version + 1;
    results.push({ blockId: op.blockId, version: nextVersion });
  });

  return {
    batchId: response.batchId ?? payload.batchId,
    documentVersion: response.documentVersion,
    idMappings,
    results,
  };
}

function normalizeMarks(marks: RichTextMark[] | null | undefined): EditorMark[] {
  if (!Array.isArray(marks)) return [];

  return marks.filter((mark): mark is EditorMark => {
    if (!mark || typeof mark !== "object" || typeof mark.type !== "string") return false;
    if (["bold", "italic", "underline", "strikethrough"].includes(mark.type)) return true;
    if (mark.type === "textColor") {
      return typeof (mark as { value?: string }).value === "string" && /^#[0-9A-Fa-f]{6}$/.test((mark as { value: string }).value);
    }
    return false;
  });
}

function fromRichTextContent(content: RichTextContent): EditorContent {
  const firstSegment = Array.isArray(content.segments) && content.segments.length > 0
    ? content.segments[0]
    : { text: "", marks: [] };

  return {
    type: "paragraph",
    text: typeof firstSegment.text === "string" ? firstSegment.text : "",
    checked: false,
    marks: normalizeMarks(firstSegment.marks),
  };
}

// The in-memory store is a local fallback that behaves like a tiny mock server.

/**
 * 에디터 로컬 fallback 문서를 보관하는 메모리 저장소입니다.
 */
const LOCAL_EDITOR_STORE = new Map<string, EditorDocumentSnapshot>(
  Object.values(MOCK_EDITOR_DOCUMENTS).map((doc) => [
    doc.id,
    {
      ...doc,
      blocks: doc.blocks.map((block) => ({
        ...block,
        content: { ...block.content },
      })),
    },
  ])
);

/**
 * 문서 스냅샷을 깊은 복사합니다.
 *
 * @param doc 처리할 문서 스냅샷입니다.
 * @returns 원본과 참조를 공유하지 않는 문서 스냅샷 복사본을 반환합니다.
 */
function cloneDocument(doc: EditorDocumentSnapshot): EditorDocumentSnapshot {
  return {
    ...doc,
    blocks: doc.blocks.map((block) => ({
      ...block,
      content: { ...block.content },
    })),
  };
}

/**
 * 로컬 fallback 저장소에서 문서를 읽고 없으면 기본 문서를 생성합니다.
 *
 * @param documentId 대상 문서 ID입니다.
 * @returns 편집에 사용할 로컬 문서 스냅샷을 반환합니다.
 */
function getLocalDocument(documentId: string): EditorDocumentSnapshot {

  const existing = LOCAL_EDITOR_STORE.get(documentId);
  if (existing) return cloneDocument(existing);

  // New mock documents start with a root and one empty paragraph to match the editor's assumptions.

  const rootBlockId = `root-${documentId}`;
  const next: EditorDocumentSnapshot = {
    id: documentId,
    title: `Untitled ${documentId}`,
    version: 1,
    rootBlockId,
    blocks: [
      {
        id: `${documentId}-b1`,
        parentId: rootBlockId,
        orderKey: "ord:000000",
        version: 1,
        content: { ...EMPTY_BLOCK_CONTENT },
      },
    ],
  };
  LOCAL_EDITOR_STORE.set(documentId, cloneDocument(next));
  return next;
}

/**
 * 로컬 fallback 문서를 저장합니다.
 *
 * @param doc 처리할 문서 스냅샷입니다.
 * @returns 반환값이 없습니다.
 */
function saveLocalDocument(doc: EditorDocumentSnapshot): void {
  LOCAL_EDITOR_STORE.set(doc.id, cloneDocument(doc));
}

/**
 * 삭제되지 않은 블록의 현재 인덱스를 찾습니다.
 *
 * @param doc 처리할 문서 스냅샷입니다.
 * @param blockId 대상 블록 ID입니다.
 * @returns 블록 위치 인덱스이며, 없으면 -1을 반환합니다.
 */
function findBlockIndex(doc: EditorDocumentSnapshot, blockId: string): number {
  return doc.blocks.findIndex((block) => block.id === blockId && !block.deleted);
}

/**
 * 블록 ID에 해당하는 블록 객체를 찾습니다.
 *
 * @param doc 처리할 문서 스냅샷입니다.
 * @param blockId 대상 블록 ID입니다.
 * @returns 찾은 블록 객체 또는 undefined를 반환합니다.
 */
function findBlock(doc: EditorDocumentSnapshot, blockId: string) {
  return doc.blocks.find((block) => block.id === blockId);
}

// Visible sibling order is derived from parentId + orderKey, just like the client-side normalized state.

/**
 * 특정 부모 아래의 표시 가능한 자식 블록을 순서대로 반환합니다.
 *
 * @param doc 처리할 문서 스냅샷입니다.
 * @param parentId 기준이 되는 부모 블록 또는 폴더 ID입니다.
 * @returns 삭제되지 않은 자식 블록 배열을 정렬된 순서로 반환합니다.
 */
function listChildren(doc: EditorDocumentSnapshot, parentId: string | null): EditorDocumentSnapshot["blocks"] {
  return doc.blocks
    .filter((block) => !block.deleted && (block.parentId ?? doc.rootBlockId ?? null) === parentId)
    .sort((a, b) => (a.orderKey ?? "").localeCompare(b.orderKey ?? ""));
}

/**
 * 형제 블록 순서를 기준으로 parentId와 orderKey를 다시 계산합니다.
 *
 * @param doc 처리할 문서 스냅샷입니다.
 * @param parentId 기준이 되는 부모 블록 또는 폴더 ID입니다.
 * @param nextIds 새로 확정된 형제 블록 ID 순서입니다.
 * @returns 반환값이 없습니다.
 */
function applySiblingOrder(doc: EditorDocumentSnapshot, parentId: string | null, nextIds: string[]): void {
  nextIds.forEach((blockId, index) => {

    const block = findBlock(doc, blockId);
    if (!block || block.deleted) return;
    block.parentId = parentId;
    block.orderKey = `ord:${String(index).padStart(6, "0")}`;
  });
}

// Position is computed from adjacent siblings because the server API is index-free.

/**
 * afterBlockId와 beforeBlockId를 기준으로 블록 위치를 재배치합니다.
 *
 * @param doc 처리할 문서 스냅샷입니다.
 * @param blockId 대상 블록 ID입니다.
 * @param parentId 기준이 되는 부모 블록 또는 폴더 ID입니다.
 * @param afterBlockId 삽입 또는 이동 기준이 되는 이전 형제 블록 ID입니다.
 * @param beforeBlockId 삽입 또는 이동 기준이 되는 다음 형제 블록 ID입니다.
 * @returns 반환값이 없습니다.
 */
function positionBlock(
  doc: EditorDocumentSnapshot,
  blockId: string,
  parentId: string | null,
  afterBlockId?: string | null,
  beforeBlockId?: string | null
): void {

  const siblings = listChildren(doc, parentId).filter((block) => block.id !== blockId);

  let insertAt = siblings.length;
  if (beforeBlockId) {

    const beforeIndex = siblings.findIndex((block) => block.id === beforeBlockId);
    if (beforeIndex >= 0) {
      insertAt = beforeIndex;
    }
  } else if (afterBlockId) {

    const afterIndex = siblings.findIndex((block) => block.id === afterBlockId);
    if (afterIndex >= 0) {
      insertAt = afterIndex + 1;
    }
  }

  const nextIds = siblings.map((block) => block.id);
  nextIds.splice(insertAt, 0, blockId);
  applySiblingOrder(doc, parentId, nextIds);
}

/**
 * 특정 블록을 루트로 하는 subtree의 블록 ID를 수집합니다.
 *
 * @param doc 처리할 문서 스냅샷입니다.
 * @param rootId 기준이 되는 루트 블록 ID입니다.
 * @returns 하위 트리에 포함된 블록 ID 배열을 반환합니다.
 */
function collectSubtreeIds(doc: EditorDocumentSnapshot, rootId: string): string[] {

  const collected = [rootId];

  // Tombstoned descendants remain in storage, so we only traverse currently visible children.
  for (let index = 0; index < collected.length; index += 1) {

    const parentId = collected[index];

    const childIds = doc.blocks
      .filter((block) => !block.deleted && block.parentId === parentId)
      .map((block) => block.id);

    collected.push(...childIds);
  }

  return collected;
}

/**
 * 서버 충돌 응답 형식에 맞는 conflict 객체를 생성합니다.
 *
 * @param batchId 충돌 응답에 포함할 배치 ID입니다.
 * @param conflicts 충돌한 블록 목록입니다.
 * @returns 충돌 정보가 담긴 응답 객체를 반환합니다.
 */
function buildConflict(batchId: string, conflicts: EditorConflictItem[]): EditorConflictResponse {
  return {
    batchId,
    code: "CONFLICT",
    conflicts,
  };
}

/**
 * 서버 없이도 동일한 규칙으로 operation을 적용합니다.
 *
 * @param documentId 대상 문서 ID입니다.
 * @param payload 서버로 보낼 transaction 요청 payload입니다.
 * @returns 저장 성공 응답 또는 충돌 응답을 반환합니다.
 */
function localApplyTransactions(
  documentId: string,
  payload: EditorTransactionRequest
): EditorTransactionSuccess | EditorConflictResponse {

  const doc = getLocalDocument(documentId);

  const working = cloneDocument(doc);
  const conflicts: EditorConflictItem[] = [];

  // This local applier mirrors the server contract so fallback/mock mode behaves like production.
  for (const op of payload.operations) {
    if (op.type === "block.create") {

      const nextBlock = {
        id: op.blockId,
        parentId: op.parentId,
        orderKey: op.orderKey,
        version: 1,
        content: { ...EMPTY_BLOCK_CONTENT },
      };
      working.blocks.push(nextBlock);
      positionBlock(working, op.blockId, op.parentId, op.afterBlockId, op.beforeBlockId);
      working.version = (working.version ?? 0) + 1;
      continue;
    }

    // Every non-create operation targets an existing visible block and is version-checked.

    const blockIndex = findBlockIndex(working, op.blockId);
    if (blockIndex < 0) {
      conflicts.push({
        blockId: op.blockId,
        serverVersion: 0,
        serverContent: { ...EMPTY_BLOCK_CONTENT },
      });
      continue;
    }

    const block = working.blocks[blockIndex];
    if (block.version !== op.version) {
      conflicts.push({
        blockId: op.blockId,
        serverVersion: block.version,
        serverContent: { ...block.content },
      });
      continue;
    }

    if (op.type === "block.replace_content") {
      block.content = { ...op.content };
      block.version += 1;
      working.version = (working.version ?? 0) + 1;
      continue;
    }

    if (op.type === "block.move") {
      block.version += 1;
      positionBlock(working, op.blockId, op.parentId, op.afterBlockId, op.beforeBlockId);
      working.version = (working.version ?? 0) + 1;
      continue;
    }

    if (op.type === "block.delete") {
      // Delete is a soft-delete on the whole subtree so later conflict checks can still see tombstones.

      const subtreeIds = collectSubtreeIds(working, op.blockId);
      subtreeIds.forEach((id) => {

        const subtreeBlock = findBlock(working, id);
        if (!subtreeBlock || subtreeBlock.deleted) return;
        subtreeBlock.deleted = true;
        subtreeBlock.version += 1;
      });
      working.version = (working.version ?? 0) + 1;
    }
  }

  if (conflicts.length > 0) {
    return buildConflict(payload.batchId, conflicts);
  }

  saveLocalDocument(working);
  return {
    batchId: payload.batchId,
    results: payload.operations
      .filter((op) => op.type !== "block.delete")
      .map((op) => {

        const block = working.blocks.find((candidate) => candidate.id === op.blockId);
        return {
          blockId: op.blockId,
          version: block?.version ?? 1,
        };
      }),
  };
}

/**
 * Conflict Response 여부를 확인합니다.
 *
 * @param response 검사할 API 응답입니다.
 * @returns response is EditorConflictResponse 값을 반환합니다.
 */
function isConflictResponse(response: unknown): response is EditorConflictResponse {
  return Boolean(
    response &&
      typeof response === "object" &&
      (response as EditorConflictResponse).code === "CONFLICT"
  );
}

/**
 * 에디터 문서 조회와 operation 전송을 담당하는 API 집합입니다.
 */
export const editorTransactionsApi = {
  loadDocument: async (documentId: string): Promise<EditorDocumentSnapshot> => {
    try {
      const [documentResponse, blocksResponse] = await Promise.all([
        documentsApi.get<GlobalResponse<RemoteDocumentResponse>>(endpoints.documentById(documentId)),
        documentsApi.get<GlobalResponse<RemoteBlockResponse[]>>(endpoints.documentBlocks(documentId)),
      ]);

      const document = unwrapEnvelope(documentResponse);
      const blocks = unwrapEnvelope(blocksResponse);

      return {
        id: document.id,
        title: document.title,
        version: document.version ?? 0,
        rootBlockId: `root-${document.id}`,
        blocks: (Array.isArray(blocks) ? blocks : [])
          .filter((block) => !block.deletedAt)
          .map((block, index) => ({
            id: block.id,
            parentId: block.parentId ?? `root-${document.id}`,
            orderKey: block.orderKey ?? `ord:${String(index).padStart(6, "0")}`,
            version: block.version,
            content: fromRichTextContent(block.content),
          })),
      };
    } catch {
      // Until the real API is available for every route, the editor can still operate in local mode.
      return getLocalDocument(documentId);
    }
  },
  postTransactions: async (
    documentId: string,
    payload: EditorTransactionRequest
  ): Promise<EditorTransactionSuccess> => {
    try {
      const response = await documentsApi.post<
        GlobalResponse<RemoteTransactionResponse> | RemoteTransactionResponse,
        ReturnType<typeof toGatewayTransactionPayload>
      >(endpoints.documentTransactions(documentId), toGatewayTransactionPayload(payload));

      return normalizeTransactionSuccess(payload, response);
    } catch (error) {

      const e = error as HttpError;
      if (e.status === 409) {
        throw error;
      }
      if (typeof e.status === "number" && ![404, 405, 501].includes(e.status)) throw error;

      // Non-supported endpoints fall back to the local applier so queue/conflict behavior stays testable.

      const localResult = localApplyTransactions(documentId, payload);
      if (isConflictResponse(localResult)) {

        const conflict = new Error("HTTP 409 conflict") as HttpError;
        conflict.status = 409;
        conflict.data = localResult;
        throw conflict;
      }

      return localResult;
    }
  },
  postTransactionsKeepalive: (documentId: string, payload: EditorTransactionRequest): void => {
    const path = endpoints.documentTransactions(documentId);
    const url = DOCUMENTS_API_BASE_URL.startsWith("http")
      ? `${DOCUMENTS_API_BASE_URL}${path}`
      : `${window.location.origin}${DOCUMENTS_API_BASE_URL}${path}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    void fetch(url, {
      method: "POST",
      keepalive: true,
      credentials: "include",
      headers,
      body: JSON.stringify(toGatewayTransactionPayload(payload)),
    }).catch(() => undefined);
  },
};
