/**
 * txn 관련 타입을 정의합니다.
 */

export type TxnId = string;
export type PageId = string;
export type ParentId = string;
export type PageEditorMode = "text";

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
    mode: PageEditorMode;
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
