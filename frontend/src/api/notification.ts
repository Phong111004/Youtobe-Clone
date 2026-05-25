import api from '@/services/api';

export interface INotification {
  _id: string;
  sender: {
    _id: string;
    username: string;
    avatar: string;
  };
  type: string;
  video?: {
    _id: string;
    title: string;
  };
  comment?: {
    _id: string;
    text: string;
  };
  message?: string;
  isRead: boolean;
  createdAt: string;
}

export const getNotifications = async () => {
  const { data } = await api.get<INotification[]>('/notifications');
  return data;
};

export const markAsRead = async (id: string) => {
  const { data } = await api.put(`/notifications/${id}/read`);
  return data;
};

export const markAllAsRead = async () => {
  const { data } = await api.put('/notifications/read-all');
  return data;
};
