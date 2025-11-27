import apiClient from '../axios';
export const TYPE_NOTIFICATION_SYSTEM: Record<string, number> = {
  system: 1,
  users: 2,
  payments: 3,
  all: 4,
};

export const getNotifications = async (
  type: 'system' | 'users' | 'payments' | 'all',
  page: number,
  perPage: number = 20
) => {
  const qParams: Record<string, number | string> = {
    type: TYPE_NOTIFICATION_SYSTEM[type],
    page: page,
    per_page: perPage,
  };
  const response = await apiClient.get('/notifications', { params: qParams });
  return response.data;
};

export const readNotification = async (
  type: 'system' | 'users' | 'payments' | 'all',
  notificationId: string,
  userId: string
) => {
  const request = {
    type: TYPE_NOTIFICATION_SYSTEM[type],
    user_id: userId,
    notification_id: notificationId,
  };
  const response = await apiClient.patch(`/notifications/read`, { ...request });
  console.log('Read notification', response);
  return response;
};

export const getNotificationUnreadCount = async () => {
  const response = await apiClient.get(`/notifications/unread-count`);
  return response;
};
