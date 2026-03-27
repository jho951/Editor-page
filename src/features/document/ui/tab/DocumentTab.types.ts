/**
 * Document Tab 관련 타입을 정의합니다.
 */

export type DocumentsViewMode = "grid" | "list";

export interface DocumentTabSwitchProps {
    value: DocumentsViewMode;
    onChange: (next: DocumentsViewMode) => void;
}