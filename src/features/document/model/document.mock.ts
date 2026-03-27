/**
 * 문서 목록 화면에서 사용하는 목 데이터를 제공합니다.
 */

import type { DocCardItem } from "@features/document/model/document.types.ts";

/**
 * 문서 목록 화면에서 사용하는 목 문서 데이터입니다.
 */
export const mockDocs: DocCardItem[] = [
  { id: "d1", title: "Getting Started", accent: "#D7D7D7", kind: "documents" },
  { id: "d2", title: "Weekly To-do List", accent: "#F2A94E", kind: "documents" },
  { id: "d3", title: "Job Application Planner", accent: "#E7A8B2", kind: "documents" },
  { id: "d4", title: "Club Homepage", accent: "#B6D6C2", kind: "documents" },
];
