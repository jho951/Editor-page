/** 공통 HTTP 클라이언트를 생성하고 인증 헤더 및 에러 정규화를 처리합니다. */

import axios, {
    AxiosHeaders,
    type AxiosInstance,
    type AxiosRequestConfig,
    type AxiosError,
    type AxiosResponse,
    type InternalAxiosRequestConfig,
} from 'axios';

import { endpoints } from './endpoints.ts';
import { shouldBlockAutoAuthBeforeExchange } from './auth-flow.ts';
import { clearAccessToken, getAuthToken, readAccessTokenFromPayload, setAccessToken } from './token.ts';
import type { HttpError } from './client.types.ts';

axios.defaults.withCredentials = true;

const ACCESS_TOKEN_EXP_SKEW_MS = 30_000;

/** gateway 요청에 사용할 기본 base URL입니다. */
export const GATEWAY_BASE_URL: string =
    (typeof import.meta !== 'undefined' &&
        (import.meta as unknown as { env?: { VITE_GATEWAY_BASE_URL?: string; VITE_API_BASE_URL?: string } })
            .env?.VITE_GATEWAY_BASE_URL) ||
    (typeof import.meta !== 'undefined' &&
        (import.meta as unknown as { env?: { VITE_GATEWAY_BASE_URL?: string; VITE_API_BASE_URL?: string } })
            .env?.VITE_API_BASE_URL) ||
    'http://localhost:8080';

/** 일반 API 요청에 사용할 기본 base URL입니다. */
export const API_BASE_URL: string = GATEWAY_BASE_URL;

/** 문서 서비스 게이트웨이 base URL입니다. */
export const DOCUMENTS_API_BASE_URL: string = GATEWAY_BASE_URL;

/** 일반 공통 axios 인스턴스입니다. */
export const http: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
});

/** 문서 서비스 전용 axios 인스턴스입니다. */
export const documentsHttp: AxiosInstance = axios.create({
    baseURL: DOCUMENTS_API_BASE_URL,
    withCredentials: true,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
});

type RetryableConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
    skipAuthRefresh?: boolean;
};

let refreshPromise: Promise<string | null> | null = null;

function normalizeHttpError(err: unknown): HttpError {
    const e = err as { response?: { status?: number; data?: unknown }; message?: string };
    const status = e.response?.status;
    const msg =
        (e.response?.data as { message?: string } | undefined)?.message ||
        e.message ||
        'Request error';

    const norm = new Error(`HTTP ${status ?? ''} ${msg}`.trim()) as HttpError;
    norm.status = status;
    norm.data = e.response?.data;
    return norm;
}

function shouldSkipRefresh(config: RetryableConfig | undefined): boolean {
    if (!config) return false;
    if (config.skipAuthRefresh) return true;

    const requestUrl = config.url ?? '';
    return requestUrl.includes(endpoints.authRefresh);
}

function toHeaders(config: InternalAxiosRequestConfig): AxiosHeaders {
    return config.headers instanceof AxiosHeaders ? config.headers : new AxiosHeaders(config.headers);
}

function setBearerHeader(config: InternalAxiosRequestConfig, token: string): void {
    const headers = toHeaders(config);
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
}

function clearBearerHeader(config: InternalAxiosRequestConfig): void {
    const headers = toHeaders(config);
    headers.delete('Authorization');
    config.headers = headers;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payloadPart = parts[1];
    if (!payloadPart) return null;

    try {
        const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
        const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
        const decoded = atob(padded);
        const parsed = JSON.parse(decoded);
        return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
    } catch {
        return null;
    }
}

function isBearerUsable(token: string): boolean {
    const payload = decodeJwtPayload(token);
    if (!payload) return true;

    const exp = payload.exp;
    if (typeof exp !== 'number') return true;

    return exp * 1000 > Date.now() + ACCESS_TOKEN_EXP_SKEW_MS;
}

function redirectToSignIn(): void {
    if (typeof window === 'undefined') return;
    if (window.location.pathname === '/signin') return;

    const next = `${window.location.pathname}${window.location.search}`;
    const signInUrl = new URL('/signin', window.location.origin);
    signInUrl.searchParams.set('next', next || '/');
    window.location.replace(signInUrl.toString());
}

function handleRefreshFailure(): void {
    clearAccessToken();
    redirectToSignIn();
}

async function refreshAccessToken(): Promise<string | null> {
    if (!refreshPromise) {
        refreshPromise = http
            .post<unknown>(endpoints.authRefresh, {}, {
                skipAuthRefresh: true,
                withCredentials: true,
            } as AxiosRequestConfig)
            .then((payload) => {
                const token = readAccessTokenFromPayload(payload);
                setAccessToken(token);
                return token;
            })
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
}

/** 공통 요청 인터셉터를 적용합니다. */
async function applyAuthHeader(config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> {
    const requestConfig = config as RetryableConfig;
    if (shouldSkipRefresh(requestConfig)) {
        clearBearerHeader(config);
        return config;
    }

    const token = getAuthToken();
    if (!token) {
        clearBearerHeader(config);
        return config;
    }

    if (isBearerUsable(token)) {
        setBearerHeader(config, token);
        return config;
    }

    clearAccessToken();
    clearBearerHeader(config);

    try {
        const refreshedToken = await refreshAccessToken();
        if (refreshedToken && isBearerUsable(refreshedToken)) {
            setBearerHeader(config, refreshedToken);
        }
    } catch {
        handleRefreshFailure();
    }

    return config;
}

async function onRejected(client: AxiosInstance, err: unknown): Promise<AxiosResponse> {
    const error = err as AxiosError;
    const config = error.config as RetryableConfig | undefined;
    const status = error.response?.status;

    if (shouldBlockAutoAuthBeforeExchange()) {
        return Promise.reject(normalizeHttpError(err));
    }

    if (status === 401 && config && !config._retry && !shouldSkipRefresh(config)) {
        config._retry = true;

        try {
            const token = await refreshAccessToken();

            if (client === http && token && isBearerUsable(token)) {
                setBearerHeader(config, token);
            } else {
                clearBearerHeader(config);
            }

            return client.request(config);
        } catch {
            handleRefreshFailure();
            return Promise.reject(normalizeHttpError(err));
        }
    }

    return Promise.reject(normalizeHttpError(err));
}

/** 일반 API 요청만 토큰 기반 Authorization 자동 첨부를 수행합니다. */
http.interceptors.request.use(applyAuthHeader);

/** 공통 응답 에러를 HttpError 형태로 정규화합니다. */
http.interceptors.response.use(
    (res: AxiosResponse) => res,
    (err: unknown) => onRejected(http, err)
);

documentsHttp.interceptors.response.use(
    (res: AxiosResponse) => res,
    (err: unknown) => onRejected(documentsHttp, err)
);

/** 응답 본문만 반환하는 공용 API 래퍼입니다. */
export const api = {
    get: <T = unknown>(url: string, cfg?: AxiosRequestConfig): Promise<T> =>
        http.get<T>(url, { ...cfg, withCredentials: true }).then((r) => r.data),
    post: <T = unknown, B = unknown>(
        url: string,
        body?: B,
        cfg?: AxiosRequestConfig
    ): Promise<T> => http.post<T>(url, body, { ...cfg, withCredentials: true }).then((r) => r.data),
    put: <T = unknown, B = unknown>(
        url: string,
        body?: B,
        cfg?: AxiosRequestConfig
    ): Promise<T> => http.put<T>(url, body, { ...cfg, withCredentials: true }).then((r) => r.data),
    patch: <T = unknown, B = unknown>(
        url: string,
        body?: B,
        cfg?: AxiosRequestConfig
    ): Promise<T> => http.patch<T>(url, body, { ...cfg, withCredentials: true }).then((r) => r.data),
    delete: <T = unknown>(url: string, cfg?: AxiosRequestConfig): Promise<T> =>
        http.delete<T>(url, { ...cfg, withCredentials: true }).then((r) => r.data),
};

/** 문서 서비스용 API 래퍼입니다. */
export const documentsApi = {
    get: <T = unknown>(url: string, cfg?: AxiosRequestConfig): Promise<T> =>
        documentsHttp.get<T>(url, { ...cfg, withCredentials: true }).then((r) => r.data),
    post: <T = unknown, B = unknown>(
        url: string,
        body?: B,
        cfg?: AxiosRequestConfig
    ): Promise<T> => documentsHttp.post<T>(url, body, { ...cfg, withCredentials: true }).then((r) => r.data),
    patch: <T = unknown, B = unknown>(
        url: string,
        body?: B,
        cfg?: AxiosRequestConfig
    ): Promise<T> => documentsHttp.patch<T>(url, body, { ...cfg, withCredentials: true }).then((r) => r.data),
    delete: <T = unknown>(url: string, cfg?: AxiosRequestConfig): Promise<T> =>
        documentsHttp.delete<T>(url, { ...cfg, withCredentials: true }).then((r) => r.data),
};
