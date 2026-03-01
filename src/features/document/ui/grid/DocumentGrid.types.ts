import type {DocumentsViewMode} from "@features/document/ui/tab/DocumentTab.types.ts";
import type {DocCardItem} from "@features/document/ui/card/DocumentCard.types.ts";

export interface DocumentGridProps {
    items: DocCardItem[];
    variant?: DocumentsViewMode;
    onItemClick?: (id: string) => void;
}

export type DocKind = "documents" | "templates";