import { api } from '../lib/http';

const drawings = {
    list: () => api.get('/drawings?page=1&size=5'),
    get: (id) => api.get(`/drawings/${id}`),
};

export { drawings };
