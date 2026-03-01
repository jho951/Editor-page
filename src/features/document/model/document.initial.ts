import type {DocumentState} from "@features/document/ui/types.ts";

export const DOCUMENT_NAME = 'document' as const;

export const DOCUMENT_STATE: DocumentState = {
  items: [],
  loading: false,
  error: null,
  modal: {
    loadOpen: false,
    saveOpen: false,
    restoreOpen: false,
  },
  current: {
    id: null,
    title: '',
    version: null,
    dirty: false,
    width: null,
    height: null,
    vectorJson: null,
  },

  meta: {
    lastLoadedAt: null,
    lastSavedAt: null,
  },
};
