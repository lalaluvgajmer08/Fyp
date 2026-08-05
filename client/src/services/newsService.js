import api from './api';

/** Public: newest published articles for the home page strip. */
export const fetchLatestNews = async (limit = 3) => {
  const { data } = await api.get('/news/latest', { params: { limit } });
  return data.data;
};

/** Paginated list. Staff tokens may pass `status` to see drafts. */
export const fetchNews = async (params = {}) => {
  const { data } = await api.get('/news', { params });
  return { items: data.data, meta: data.meta };
};

export const fetchNewsBySlug = async (slug) => {
  const { data } = await api.get(`/news/${slug}`);
  return data.data;
};

/** The same endpoint accepts an ObjectId — used by the admin editor. */
export const fetchNewsById = fetchNewsBySlug;

export const createNews = async (payload) => {
  const { data } = await api.post('/news', payload);
  return data.data;
};

export const updateNews = async (id, payload) => {
  const { data } = await api.put(`/news/${id}`, payload);
  return data.data;
};

/** Archives by default; pass permanent:true to hard-delete. */
export const deleteNews = async (id, permanent = false) => {
  const { data } = await api.delete(`/news/${id}`, { params: { permanent } });
  return data;
};
