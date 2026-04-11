import api from './api';

export const notebookService = {
    // GET /api/notebooks
    getAll: async () => {
        const res = await api.get('/notebooks');
        return res.data;
    },

    // GET /api/notebooks/public — all public notebooks (Knowledge Center)
    getPublic: async () => {
        const res = await api.get('/notebooks/public');
        return res.data; // { success, notebooks }
    },

    // POST /api/notebooks
    create: async (data) => {
        const res = await api.post('/notebooks', data);
        return res.data;
    },

    // PUT /api/notebooks/:id
    update: async (id, data) => {
        const res = await api.put(`/notebooks/${id}`, data);
        return res.data; // { success, notebook }
    },

    // DELETE /api/notebooks/:id
    delete: async (id) => {
        const res = await api.delete(`/notebooks/${id}`);
        return res.data;
    },

    // GET /api/notebooks/:identifier
    getOne: async (identifier) => {
        const res = await api.get(`/notebooks/${identifier}`);
        return res.data; // { success, notebook }
    },

    // POST /api/notebooks/:notebookId/add-article
    addArticle: async (notebookId, article, notes = '') => {
        const res = await api.post(`/notebooks/${notebookId}/add-article`, {
            ...article,
            notes,
        });
        return res.data; // { success, page }
    },

    // PATCH /api/notebooks/:notebookId/pages/:pageId — update notes
    updateNotes: async (notebookId, pageId, notes) => {
        const res = await api.patch(`/notebooks/${notebookId}/pages/${pageId}`, { notes });
        return res.data;
    },

    // DELETE /api/notebooks/:notebookId/pages/:pageId — remove article from notebook
    deletePage: async (notebookId, pageId) => {
        const res = await api.delete(`/notebooks/${notebookId}/pages/${pageId}`);
        return res.data;
    },

    // GET /api/notebooks/:id/download — returns a blob
    downloadPDF: async (notebookId) => {
        const res = await api.get(`/notebooks/${notebookId}/download`, {
            responseType: 'blob',
        });
        return res.data;
    },
};


