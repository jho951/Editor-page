import { api } from '@shared/api/client.ts';
import type {DrawingId} from "@features/document/ui/types.ts";


export const drawings = {
  create: (body: unknown): Promise<unknown> => api.post('/drawings', body),

  list: (page: number = 1, size: number = 20, deleted: boolean = false): Promise<unknown> =>
    api.get(`/drawings?page=${page}&size=${size}&deleted=${deleted}`),

  get: (id: DrawingId): Promise<unknown> => api.get(`/drawings/${encodeURIComponent(String(id))}`),

  update: (body: unknown): Promise<unknown> => {
    if (!body || typeof body !== 'object') throw new Error('update body가 객체가 아닙니다.');
    const maybe = body as { id?: DrawingId };
    const id = maybe.id;
    if (id == null || id === '') throw new Error('update body에 id가 없습니다.');
    return api.put(`/drawings/${encodeURIComponent(String(id))}`, body);
  },

  remove: (id: DrawingId, opts: { hard?: boolean } = {}): Promise<unknown> => {
    const hard = opts.hard === true;
    return api.delete(`/drawings/${encodeURIComponent(String(id))}${hard ? '?hard=true' : ''}`);
  },

  restore: (id: DrawingId, body?: unknown): Promise<unknown> =>
    api.put(`/drawings/${encodeURIComponent(String(id))}/restore`, body ?? {}),

  /**
   * hard-delete 전용 (remove(id, {hard:true})의 alias)
   */
  delete: (id: DrawingId): Promise<unknown> => drawings.remove(id, { hard: true }),
};
