import api from './api';

/** Paginated product list. Staff tokens may filter by discontinued status. */
export const fetchProducts = async (params = {}) => {
  const { data } = await api.get('/products', { params });
  return { items: data.data, meta: data.meta };
};

/** Small payload for the home page. */
export const fetchFeaturedProducts = async (limit = 4) => {
  const { data } = await api.get('/products/featured', { params: { limit } });
  return data.data;
};

/** Single product with live pricing breakdown. Accepts slug or ObjectId. */
export const fetchProductBySlug = async (slug) => {
  const { data } = await api.get(`/products/${slug}`);
  return data.data;
};

/** Admin/staff: accepts an ObjectId. */
export const fetchProductById = fetchProductBySlug;

export const createProduct = async (payload) => {
  const { data } = await api.post('/products', payload);
  return data.data;
};

export const updateProduct = async (id, payload) => {
  const { data } = await api.put(`/products/${id}`, payload);
  return data.data;
};

/** Marks discontinued by default; pass permanent:true to hard-delete. */
export const deleteProduct = async (id, permanent = false) => {
  const { data } = await api.delete(`/products/${id}`, { params: { permanent } });
  return data;
};
