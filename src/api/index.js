import { http } from '../lib/http';

const api = {
    get: (url, cfg) => http.get(url, cfg).then((r) => r.data),
    post: (url, body, cfg) => http.post(url, body, cfg).then((r) => r.data),
    put: (url, body, cfg) => http.put(url, body, cfg).then((r) => r.data),
    delete: (url, cfg) => http.delete(url, cfg).then((r) => r.data),
};
export { api };
