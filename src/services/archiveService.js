import api from './api';

export const archiveService = {
    // GET /api/archives
    getAll: async () => {
        const res = await api.get('/archives');
        return res.data; // { success, archives }
    },

    // POST /api/archives  body: article object
    add: async (article) => {
        const res = await api.post('/archives', article);
        return res.data; // { success, archive, article, alreadyArchived }
    },

    // DELETE /api/archives/:id
    remove: async (archiveId) => {
        const res = await api.delete(`/archives/${archiveId}`);
        return res.data;
    },
};
