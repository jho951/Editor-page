/**
 * 프로젝트 전역에서 사용할 Axios HTTP 클라이언트
 * - baseURL/timeout/헤더/withCredentials 지정
 * - 요청 인터셉터: Authorization 헤더 자동 주입
 * - 응답 인터셉터: 에러를 표준화한 Error 객체로 래핑하여 reject
 */

import axios, {
    type AxiosInstance,
    type AxiosRequestConfig,
    type AxiosResponse,
    type InternalAxiosRequestConfig,
} from 'axios';

import { getAuthToken } from './token.ts';

export interface HttpError extends Error {
    status?: number;
    data?: unknown;
}

// Vite 환경변수(선택): VITE_API_BASE_URL
// - 개발: 기본값 '/api' + vite proxy로 localhost:8080에 전달
// - 배포: 같은 오리진이면 그대로 '/api', 아니면 VITE_API_BASE_URL 지정
const API_BASE_URL: string =
    (typeof import.meta !== 'undefined' &&
        (import.meta as unknown as { env?: { VITE_API_BASE_URL?: string } })
            .env?.VITE_API_BASE_URL) ||
    '/api';

export const http: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token) {
        config.headers = config.headers ?? {};
        (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
    return config;
});

http.interceptors.response.use(
    (res: AxiosResponse) => res,
    (err: unknown) => {
        const e = err as { response?: { status?: number; data?: unknown }; message?: string };
        const status = e.response?.status;
        const msg =
            (e.response?.data as { message?: string } | undefined)?.message ||
            e.message ||
            'Request error';

        const norm = new Error(`HTTP ${status ?? ''} ${msg}`.trim()) as HttpError;
        norm.status = status;
        norm.data = e.response?.data;

        return Promise.reject(norm);
    }
);

export const api = {
    get: <T = unknown>(url: string, cfg?: AxiosRequestConfig): Promise<T> =>
        http.get<T>(url, cfg).then((r) => r.data),
    post: <T = unknown, B = unknown>(
        url: string,
        body?: B,
        cfg?: AxiosRequestConfig
    ): Promise<T> => http.post<T>(url, body, cfg).then((r) => r.data),
    put: <T = unknown, B = unknown>(
        url: string,
        body?: B,
        cfg?: AxiosRequestConfig
    ): Promise<T> => http.put<T>(url, body, cfg).then((r) => r.data),
    delete: <T = unknown>(url: string, cfg?: AxiosRequestConfig): Promise<T> =>
        http.delete<T>(url, cfg).then((r) => r.data),
};
