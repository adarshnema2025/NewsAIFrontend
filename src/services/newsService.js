import api from './api';

export const newsService = {
    // GET /api/news/top-headlines?category=general&lang=en&country=in
    getTopHeadlines: async ({ category = 'general', lang = 'en', country = 'in' } = {}) => {
        const res = await api.get('/news/top-headlines', {
            params: { category, lang, country },
        });
        return res.data; // { success, totalArticles, articles }
    },
};
