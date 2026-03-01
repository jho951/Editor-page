interface ApiResponse<T> {
    data: T;
    message?: string;
}

interface PagedResult<T> {
    items: T[];
    total: number;
}

export type {ApiResponse, PagedResult};