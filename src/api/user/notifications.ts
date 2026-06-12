import client from '../client';

export interface NotificationSettingsPayload {
  tradeComplete: boolean;
  orderCancel: boolean;
  pendingOrder: boolean;
  contestStart: boolean;
  contestEnd: boolean;
  rankChange: boolean;
  marketOpen: boolean;
  marketClose: boolean;
}

export interface NotificationItem {
  notificationId: number;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationsApi = {
  // 알림 목록 + 안읽은 개수 ({ unreadCount, items })
  getNotifications: () =>
    client.get('/api/notifications').then(r => r.data.data),

  // 안읽은 개수만
  getUnreadCount: () =>
    client.get('/api/notifications/unread-count').then(r => r.data.data),

  // 개별 읽음 처리
  markRead: (notificationId: number) =>
    client.patch(`/api/notifications/${notificationId}/read`).then(r => r.data.data),

  // 모두 읽음
  markAllRead: () =>
    client.patch('/api/notifications/read-all').then(r => r.data.data),

  getSettings: () =>
    client.get('/api/notifications/settings').then(r => r.data.data),

  updateSettings: (data: Partial<NotificationSettingsPayload>) =>
    client.patch('/api/notifications/settings', data).then(r => r.data.data),
};
