/**
 * @file http.js
 * @author YJH
 * @module lib/http
 * @description
 * 프로젝트 전역에서 사용할 Axios HTTP 클라이언트를 설정합니다.
 * - 기본 baseURL/timeout/헤더/withCredentials 지정
 * - 요청 인터셉터: Authorization 헤더 자동 주입
 * - 응답 인터셉터: 에러를 표준화한 Error 객체로 래핑하여 throw
 */

import axios from 'axios';
import { getAuthToken } from '../shared/http/token';

/**
 * 표준화된 HTTP 에러 객체 형태
 * @typedef {Error & {
 *   status?: number,
 *   data?: any
 * }} HttpError
 */

/**
 * 설정된 Axios 인스턴스
 * @type {import('axios').AxiosInstance}
 * @constant
 * @readonly
 */
const http = axios.create({
    /** @type {string} 백엔드 API 엔드포인트 기본 경로 */
    baseURL: 'http://localhost:8080/api',
    /** @type {number} 요청 타임아웃(ms) */
    timeout: 15000,
    /** @type {boolean} CORS 요청 시 쿠키 포함 여부 */
    withCredentials: true,
    /** @type {Record<string,string>} 공통 요청 헤더 */
    headers: { 'Content-Type': 'application/json' },
});

/**
 * 요청 인터셉터
 * - 로컬 저장소(또는 별도 저장소)에 보관된 Access Token을 읽어 Authorization 헤더에 주입합니다.
 * @param {import('axios').InternalAxiosRequestConfig} config Axios 요청 설정
 * @returns {import('axios').InternalAxiosRequestConfig} 수정된 요청 설정
 */
http.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
        // 헤더 객체가 undefined일 수 있으니 안전 가드
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/* 상태 관리에서 직접 토큰을 꺼내 쓰고 싶다면 아래 패턴을 사용하세요.
http.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state?.auth?.accessToken;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
*/

/**
 * 응답 인터셉터
 * - 정상 응답은 그대로 반환
 * - 에러 응답은 상태코드/서버메시지를 포함한 표준화 에러(HttpError)로 변환하여 throw
 * @param {import('axios').AxiosResponse} res Axios 응답
 * @returns {import('axios').AxiosResponse} 원본 응답
 * @throws {HttpError} 표준화된 에러
 */
http.interceptors.response.use(
    (res) => res,
    (err) => {
        const status = err?.response?.status;
        const msg =
            err?.response?.data?.message || err?.message || 'Request error';

        /** @type {HttpError} */
        const norm = new Error(`HTTP ${status ?? ''} ${msg}`.trim());
        norm.status = status;
        norm.data = err?.response?.data;

        return Promise.reject(norm);
    }
);

const api = {
    get: (url, cfg) => http.get(url, cfg).then((r) => r.data),
    post: (url, body, cfg) => http.post(url, body, cfg).then((r) => r.data),
    put: (url, body, cfg) => http.put(url, body, cfg).then((r) => r.data),
    delete: (url, cfg) => http.delete(url, cfg).then((r) => r.data),
};

export { http, api };
