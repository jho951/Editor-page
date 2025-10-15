import axios from 'axios';
import { getAuthToken } from '../util/token';

/**
 * @file lib/http.js
 * @author YJH
 * @description Axios HTTP 클라이언트 설정
 * @module lib/http
 * @returns {AxiosInstance} 설정된 Axios 인스턴스
 */
const http = axios.create({
    baseURL: 'http://localhost:8080/api',
    timeout: 15000,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

/**
 * 요청 인터셉터 - Authorization 헤더 자동 포함
 * @param {object} config - Axios 요청 설정 객체
 * @returns {object} 수정된 요청 설정 객체
 */
http.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

/**
 * 응답 인터셉터 - 에러 표준화
 * @param {object} res - Axios 응답 객체
 * @returns {object} 응답 객체
 * @throws {Error} 표준화된 에러 객체
 */
http.interceptors.response.use(
    (res) => res,
    (err) => {
        const status = err?.response?.status;
        const msg =
            err?.response?.data?.message || err?.message || 'Request error';
        const norm = new Error(`HTTP ${status ?? ''} ${msg}`.trim());
        norm.status = status;
        norm.data = err?.response?.data;
        return Promise.reject(norm);
    }
);

export { http };
