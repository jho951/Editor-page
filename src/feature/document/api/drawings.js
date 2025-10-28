import { api } from '@/lib/axios/client';

/**
 * @file drawings.js
 * @author YJH
 * @description Drawing API 모듈
 */
const drawings = {
    create: (body) => api.post('/drawings', body),

    list: (page = 1, size = 20, deleted = false) =>
        api.get(`/drawings?page=${page}&size=${size}&deleted=${deleted}`),
    get: (id) => api.get(`/drawings/${encodeURIComponent(id)}`),

    update: (body) => {
        const id = body?.id;
        if (!id) throw new Error('update body에 id가 없습니다.');
        return api.put(`/drawings/${encodeURIComponent(id)}`, body);
    },

    remove: (id, { hard = false } = {}) =>
        api.delete(
            `/drawings/${encodeURIComponent(id)}${hard ? '?hard=true' : ''}`
        ),

    restore: (id, body) =>
        api.put(`/drawings/${encodeURIComponent(id)}/restore`, body),

    delete: (id) => api.delete(`/drawings/${encodeURIComponent(id)}`),
};

export { drawings };
