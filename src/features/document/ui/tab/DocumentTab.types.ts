export type DocumentsViewMode = "grid" | "list";

export interface DocumentTabSwitchProps {
    value: DocumentsViewMode;
    onChange: (next: DocumentsViewMode) => void;
}