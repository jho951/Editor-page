import type { RootState } from '@app/store/store.ts';
import type {DocumentState} from "@features/document/ui/types.ts";
import type {ModalKey} from "@features/document/model/document.slice.ts";

export const selectDocument = (s: RootState): DocumentState => s.document;

export const selectItems = (s: RootState) => selectDocument(s).items;
export const selectCurrent = (s: RootState) => selectDocument(s).current;
export const selectLoading = (s: RootState) => selectDocument(s).loading;
export const selectError = (s: RootState) => selectDocument(s).error;

export const openByKey = (
    s: RootState,
    key: ModalKey
): boolean => {
    const modal = selectDocument(s).modal;
    if (key === "load") return Boolean(modal.loadOpen);
    if (key === "save") return Boolean(modal.saveOpen);
    return Boolean(modal.restoreOpen);
};
