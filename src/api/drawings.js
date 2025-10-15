import { api } from '../lib/axios/method';

/**
 * @file drawings.js
 * @author YJH
 * @description Drawing API 모듈
 * @module api/drawings
 * @example
 * import { drawings } from './api/drawings';
 * // 목록 조회
 * const res = await drawings.list(1, 20);
 * // 도면 조회
 * const res = await drawings.get('drawingId');
 * // 도면 생성
 * const res = await drawings.create({ title: 'New Drawing', vectorJson: {} });
 * // 도면 수정
 * const res = await drawings.update('drawingId', { title: 'Updated Title' });
 * // 도면 삭제
 * const res = await drawings.remove('drawingId');
 *
 * @returns {Promise} Axios Response Promise
 */
const drawings = {
    list: (page = 1, size = 20) =>
        api.get(`/drawings?page=${page}&size=${size}`),
    get: (id) => api.get(`/drawings/${encodeURIComponent(id)}`),
    create: (body) => api.post('/drawings', body),
    update: (id, body) => api.put(`/drawings/${encodeURIComponent(id)}`, body),
    remove: (id) => api.delete(`/drawings/${encodeURIComponent(id)}`),
};

export { drawings };
