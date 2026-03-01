import { mockDocs, mockTemplates } from "@features/document/ui/documents.mock.ts";
import type { DocCardItem } from "@features/document/ui/card/DocumentCard.types.ts";

/**
 * In v1 we keep a simple in-memory catalog.
 * Later this can be replaced by server data.
 */
export function getAllDocs(): DocCardItem[] {
  return [...mockDocs, ...mockTemplates];
}

export function findDocById(id: string): DocCardItem | undefined {
  return getAllDocs().find((d) => d.id === id);
}
