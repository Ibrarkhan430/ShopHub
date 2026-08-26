import API from './axios';

export const fetchCategories = async () => {
  const { data } = await API.get('/categories');
  return data;
};

export const createCategory = async (categoryData) => {
  const { data } = await API.post('/categories', categoryData);
  return data;
};

export const updateCategory = async (id, categoryData) => {
  const { data } = await API.put(`/categories/${id}`, categoryData);
  return data;
};

export const deleteCategory = async (id) => {
  const { data } = await API.delete(`/categories/${id}`);
  return data;
};