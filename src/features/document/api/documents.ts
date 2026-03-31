/**
 * 문서 도메인 API를 명세 경로(`/v1/**`) 기준으로 래핑합니다.
 */

import { documentsApi } from "@shared/api/client.ts";
import { endpoints } from "@shared/api/endpoints.ts";

type Envelope<T> = { data?: T };

function unwrap<T>(payload: T | Envelope<T>): T {
  if (payload && typeof payload === "object" && "data" in (payload as Envelope<T>)) {
    return (payload as Envelope<T>).data as T;
  }
  return payload as T;
}

export const documentsDomainApi = {
  createWorkspace: async (body: { name: string }): Promise<unknown> =>
    documentsApi.post<unknown, { name: string }>(endpoints.workspaces, body),
  getWorkspace: async (workspaceId: string): Promise<unknown> =>
    documentsApi.get<unknown>(endpoints.workspaceById(workspaceId)),
  getDocuments: async (_workspaceId: string): Promise<unknown> =>
    documentsApi.get<unknown>(endpoints.documents),
  getTrashDocuments: async (_workspaceId: string): Promise<unknown> =>
    documentsApi.get<unknown>(endpoints.documentsTrash),
  createDocument: async (
    body: Record<string, unknown>
  ): Promise<unknown> =>
    documentsApi.post<unknown, Record<string, unknown>>(endpoints.documents, body),
  getDocument: async (documentId: string): Promise<unknown> =>
    documentsApi.get<unknown>(endpoints.documentById(documentId)),
  getDocumentBlocks: async (documentId: string): Promise<unknown> =>
    documentsApi.get<unknown>(endpoints.documentBlocks(documentId)),
  updateDocument: async (
    documentId: string,
    body: Record<string, unknown>
  ): Promise<unknown> =>
    documentsApi.patch<unknown, Record<string, unknown>>(endpoints.documentById(documentId), body),
  updateDocumentVisibility: async (
    documentId: string,
    body: { visibility: "PUBLIC" | "PRIVATE"; version: number }
  ): Promise<unknown> =>
    documentsApi.patch<unknown, { visibility: "PUBLIC" | "PRIVATE"; version: number }>(
      endpoints.documentVisibility(documentId),
      body
    ),
  postDocumentTransactions: async (
    documentId: string,
    body: Record<string, unknown>
  ): Promise<unknown> =>
    documentsApi.post<unknown, Record<string, unknown>>(endpoints.documentTransactions(documentId), body),
  deleteDocument: async (documentId: string): Promise<void> => {
    await documentsApi.delete<unknown>(endpoints.documentById(documentId));
  },
  trashDocument: async (documentId: string, body: Record<string, never> = {}): Promise<unknown> =>
    documentsApi.patch<unknown, Record<string, never>>(endpoints.documentTrash(documentId), body),
  restoreDocument: async (documentId: string): Promise<void> => {
    await documentsApi.post<unknown, Record<string, never>>(endpoints.documentRestore(documentId), {});
  },
  moveDocument: async (
    documentId: string,
    body: {
      targetParentId: string | null;
      afterDocumentId: string | null;
      beforeDocumentId: string | null;
    }
  ): Promise<unknown> =>
    documentsApi.post<unknown, typeof body>(endpoints.documentMove(documentId), body),
  adminCreateBlock: async (
    documentId: string,
    body: Record<string, unknown>
  ): Promise<unknown> =>
    documentsApi.post<unknown, Record<string, unknown>>(endpoints.adminDocumentBlocks(documentId), body),
  adminUpdateBlock: async (
    blockId: string,
    body: Record<string, unknown>
  ): Promise<unknown> =>
    documentsApi.patch<unknown, Record<string, unknown>>(endpoints.adminBlockById(blockId), body),
  adminDeleteBlock: async (blockId: string, body: Record<string, unknown>): Promise<void> => {
    await documentsApi.delete<unknown>(endpoints.adminBlockById(blockId), { data: body });
  },
  adminMoveBlock: async (
    blockId: string,
    body: Record<string, unknown>
  ): Promise<unknown> =>
    documentsApi.post<unknown, Record<string, unknown>>(endpoints.adminBlockMove(blockId), body),
  unwrap,
};
