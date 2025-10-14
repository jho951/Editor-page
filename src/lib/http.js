import axios from 'axios';

let getToken = () => null;
const attachAuthTokenProvider = (fn) => {
    getToken = typeof fn === 'function' ? fn : () => null;
};

const BASE_URL = 'http://localhost:8080/api';

const http = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use((config) => {
    const token = getToken?.();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

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

const api = {
    get: (url, cfg) => http.get(url, cfg).then((r) => r.data),
    post: (url, body, cfg) => http.post(url, body, cfg).then((r) => r.data),
    put: (url, body, cfg) => http.put(url, body, cfg).then((r) => r.data),
    delete: (url, cfg) => http.delete(url, cfg).then((r) => r.data),
};

export { attachAuthTokenProvider, http, api };
