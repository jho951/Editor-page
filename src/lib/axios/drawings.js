import { api } from './method';

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
 * const res = await drawings.update({ title: 'Updated Title' });
 * // 도면 삭제
 * const res = await drawings.remove('drawingId');
 *
 * @returns {Promise} Axios Response Promise
 */
const drawings = {
    create: (body) => api.post('/drawings', body),

    list: (page = 1, size = 20) =>
        api.get(`/drawings?page=${page}&size=${size}`),
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
        api.post(`/drawings/${encodeURIComponent(id)}/restore`, body),
};

export default drawings;

export { drawings };
