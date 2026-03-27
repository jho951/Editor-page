/**
 * catalog 관련 타입을 정의합니다.
 */

import type { DocCardItem } from "@features/document/model/document.types.ts";

export type ApiEnvelope<T> = {
    httpStatus?: string;
    success?: boolean;
    message?: string;
    code?: number;
    data?: T;
};

export type RemoteCatalogItem = {
    id?: string | number;
    title?: string;
    name?: string;
    accent?: string;
    color?: string;
    kind?: string;
    coverUrl?: string;
    subtitle?: string;
};

export interface FetchCatalogResult {
    items: DocCardItem[];
    source: "local" | "remote";
}
