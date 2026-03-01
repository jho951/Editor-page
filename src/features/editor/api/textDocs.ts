import { api } from "@shared/api/client.ts";
import { endpoints } from "@shared/api/endpoints.ts";

import type { Block } from "@features/editor/type/Block.types.ts";

export type TextDocDTO = {
  id: string;
  title: string;
  blocks: Block[];
  updatedAt?: string;
};

export type SaveTextDocBody = {
  title: string;
  blocks: Block[];
};

export const textDocsApi = {
  /** Load the text content for a page/document */
  get: (id: string) => api.get<TextDocDTO>(endpoints.pageText(id)),

  /** Save the text content for a page/document */
  save: (id: string, body: SaveTextDocBody) =>
    api.put<TextDocDTO, SaveTextDocBody>(endpoints.pageText(id), body),
};
