import type {DocEditor} from "@features/document/ui/documents.mock.ts";
import type {DocKind} from "@features/document/ui/grid/DocumentGrid.types.ts";
import type {DocumentsViewMode} from "@features/document/ui/tab/DocumentTab.types.ts";

export interface DocCardItem {
    id: string;
    title: string;
    accent: string;
    kind: DocKind;
    editor?: DocEditor;
}

export interface DocumentCardProps {
    item: DocCardItem;
    onClick?: (id: string) => void;
    variant?: DocumentsViewMode
}


export type TemplateItem = DocumentCardProps['item'] & {
    coverUrl?: string;
    subTitle?: string;
};
