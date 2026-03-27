/**
 * Documents Page 관련 타입을 정의합니다.
 */

import type { DocKind } from "@features/document/index.ts";

export interface DocumentsPageProps {
    mode?: DocKind;
}
