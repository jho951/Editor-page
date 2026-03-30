/** API 요청에 사용할 인증 토큰 저장/공급 유틸을 제공합니다. */

import type { AuthTokenProvider } from "./token.types.ts";

const ACCESS_TOKEN_KEY = "auth.access_token";

let provider: AuthTokenProvider = () => null;
let inMemoryAccessToken: string | null = null;

function removeLegacyStoredToken(): void {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    } catch {
        // ignore storage failures
    }
}

/**
 * 전달된 토큰 문자열에서 Bearer 접두어를 제거해 정규화합니다.
 *
 * @param value 원본 토큰 문자열입니다.
 * @returns 정규화된 토큰 문자열 또는 null을 반환합니다.
 */
export const normalizeAccessToken = (value: string | null | undefined): string | null => {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    return trimmed.replace(/^Bearer\s+/i, "").trim() || null;
};

/**
 * 응답 payload에서 access token을 추출합니다.
 *
 * @param payload API 응답 payload입니다.
 * @returns 추출된 토큰 문자열 또는 null을 반환합니다.
 */
export const readAccessTokenFromPayload = (payload: unknown): string | null => {
    if (!payload || typeof payload !== "object") return null;
    const obj = payload as Record<string, unknown>;

    const direct =
        (typeof obj.accessToken === "string" && obj.accessToken) ||
        (typeof obj.access_token === "string" && obj.access_token) ||
        (typeof obj.token === "string" && obj.token) ||
        null;

    if (direct) return normalizeAccessToken(direct);

    const data = obj.data;
    if (!data || typeof data !== "object") return null;

    const nested = data as Record<string, unknown>;
    return normalizeAccessToken(
        (typeof nested.accessToken === "string" && nested.accessToken) ||
        (typeof nested.access_token === "string" && nested.access_token) ||
        (typeof nested.token === "string" && nested.token) ||
        null
    );
};

/**
 * access token을 저장합니다.
 *
 * @param value 저장할 토큰 문자열입니다.
 * @returns 반환값이 없습니다.
 */
export const setAccessToken = (value: string | null | undefined): void => {
    const normalized = normalizeAccessToken(value);
    inMemoryAccessToken = normalized;
    removeLegacyStoredToken();
};

/**
 * 저장된 access token을 읽습니다.
 *
 * @returns 저장된 토큰 문자열 또는 null을 반환합니다.
 */
export const getStoredAccessToken = (): string | null => {
    removeLegacyStoredToken();
    return null;
};

/**
 * 저장된 access token을 제거합니다.
 *
 * @returns 반환값이 없습니다.
 */
export const clearAccessToken = (): void => {
    inMemoryAccessToken = null;
    removeLegacyStoredToken();
};

/**
 * 현재 세션에서 사용할 인증 토큰 공급 함수를 등록합니다.
 *
 * @param fn 토큰을 반환하는 공급 함수입니다.
 * @returns 반환값이 없습니다.
 */
export const attachAuthTokenProvider = (fn: unknown): void => {
    provider = typeof fn === 'function' ? (fn as AuthTokenProvider) : () => null;
};

/**
 * 등록된 공급 함수에서 현재 인증 토큰을 읽어옵니다.
 * @returns 인증 토큰 문자열 또는 `null`을 반환합니다.
 */
export const getAuthToken = (): string | null =>
    normalizeAccessToken(provider()) ?? inMemoryAccessToken;
