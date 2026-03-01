import { api } from "@shared/api/client.ts";
import { endpoints } from "@shared/api/endpoints.ts";

export type EditorMode = "text" | "canvas";

export type CreatePageBody = {
  /** 클라이언트에서 미리 생성한 id(optimistic) */
  id: string;
  parentId: string;
  title: string;
  mode: EditorMode;
};

export type CreatePageResponse = {
  id: string;
  title?: string;
  parentId?: string;
  mode?: EditorMode;
};

export const pagesApi = {
  createPage: (body: CreatePageBody) =>
    api.post<CreatePageResponse, CreatePageBody>(endpoints.pages, body),
};
