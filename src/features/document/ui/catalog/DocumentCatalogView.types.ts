/**
 * Document Catalog View 관련 타입을 정의합니다.
 */

import type { DocKind } from "@features/document/model/document.types.ts";

export interface DocumentCatalogViewProps {
    mode?: DocKind;
}
