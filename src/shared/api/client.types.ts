/** client 타입 정의 */
export interface HttpError extends Error {
    status?: number;
    data?: unknown;
}
