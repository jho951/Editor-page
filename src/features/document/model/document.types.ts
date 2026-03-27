/**
 * 문서 카드와 카탈로그 도메인 타입을 정의합니다.
 */

export type DocKind = "documents";

export interface DocCardItem {
  id: string;
  title: string;
  accent: string;
  kind: DocKind;
}
