export type DrawingId = string | number;

export interface DrawingListItem {
  id: DrawingId;
  title?: string;
  version?: number | null;
  deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DrawingDetail extends DrawingListItem {
  width?: number | null;
  height?: number | null;
  vectorJson?: string | null;
}

export interface DocumentModalState {
  loadOpen: boolean;
  saveOpen: boolean;
  restoreOpen: boolean;
}

export interface DocumentCurrent {
  id: DrawingId | null;
  title: string;
  version: number | null;
  dirty: boolean;
  width?: number | null;
  height?: number | null;
  vectorJson?: string | null;
}

export interface DocumentMeta {
  lastLoadedAt: number | null;
  lastSavedAt: number | null;
}

export interface DocumentState {
  items: DrawingListItem[];
  loading: boolean;
  error: string | null;
  modal: DocumentModalState;
  current: DocumentCurrent;
  meta: DocumentMeta;
}

