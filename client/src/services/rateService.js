import api from './api';

/** Today's published gold and silver rates. */
export const fetchTodayRates = async () => {
  const { data } = await api.get('/rates/today');
  return data.data;
};

/** Rate history for the admin table and charts. */
export const fetchRateHistory = async (params = {}) => {
  const { data } = await api.get('/rates/history', { params });
  return { items: data.data, meta: data.meta };
};

/**
 * Publish a rate. Upserts on (category, effectiveDate), so saving twice on the
 * same day corrects the entry instead of creating a duplicate.
 */
export const saveRate = async (payload) => {
  const { data } = await api.post('/rates', payload);
  return data.data;
};

export const updateRate = async (id, payload) => {
  const { data } = await api.put(`/rates/${id}`, payload);
  return data.data;
};

export const deleteRate = async (id) => {
  const { data } = await api.delete(`/rates/${id}`);
  return data;
};
