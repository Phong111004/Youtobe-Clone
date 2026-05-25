import api from '@/services/api';

export const getAdminStats = async () => {
  const { data } = await api.get('/admin/stats');
  return data;
};

export const getAllUsers = async (page = 1, limit = 50) => {
  const { data } = await api.get(`/admin/users?page=${page}&limit=${limit}`);
  return data;
};

export const deleteUser = async (id: string) => {
  const { data } = await api.delete(`/admin/users/${id}`);
  return data;
};

export const getAllPlatformVideos = async (page = 1, limit = 50) => {
  const { data } = await api.get(`/admin/videos?page=${page}&limit=${limit}`);
  return data;
};

export const deleteAnyVideo = async (id: string) => {
  const { data } = await api.delete(`/admin/videos/${id}`);
  return data;
};

export const makeMeAdmin = async () => {
  const { data } = await api.get('/admin/make-me-admin');
  return data;
};
