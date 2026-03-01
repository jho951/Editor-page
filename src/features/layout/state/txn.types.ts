import type { EditorMode } from "@features/layout/api/pages.ts";

/** ULID/UUID 같은 문자열이면 string으로 충분 */
export type TxnId = string;
export type PageId = string;
export type ParentId = string;

export type TxnOp =
    | PageCreateOp
    | PageRenameOp
    | PageMoveOp
    | PageArchiveOp;

export type PageCreateOp = {
    op: "page.create";
    pageId: PageId;
    parentId: ParentId;
    position: "first" | "last" | { afterId: string };
    title: string;
    mode: EditorMode;
};

export type PageRenameOp = {
    op: "page.rename";
    pageId: PageId;
    title: string;
};

export type PageMoveOp = {
    op: "page.move";
    pageId: PageId;
    fromParentId: ParentId;
    toParentId: ParentId;
    position: "first" | "last" | { afterId: string };
};

export type PageArchiveOp = {
    op: "page.archive";
    pageId: PageId;
    archived: boolean;
};

export type PendingTxn = {
    clientTxnId: TxnId;
    createdAt: number;
    ops: TxnOp[];
    status: "queued" | "sending" | "failed";
    retryCount: number;
};
