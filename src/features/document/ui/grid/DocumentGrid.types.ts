/**
 * Document Grid 관련 타입을 정의합니다.
 */

import type {DocumentsViewMode} from "@features/document/ui/tab/DocumentTab.types.ts";
import type { DocCardItem } from "@features/document/model/document.types.ts";

export interface DocumentGridProps {
    items: DocCardItem[];
    variant?: DocumentsViewMode;
    onItemClick?: (id: string) => void;
}
