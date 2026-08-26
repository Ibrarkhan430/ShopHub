import API from './axios';

export const fetchUsers = async () => {
  const { data } = await API.get('/users');
  return data;
};

export const fetchUserById = async (id) => {
  const { data } = await API.get(`/users/${id}`);
  return data;
};

export const deleteUser = async (id) => {
  const { data } = await API.delete(`/users/${id}`);
  return data;
};