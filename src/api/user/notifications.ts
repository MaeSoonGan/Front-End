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

export const notificationsApi = {
  getSettings: () =>
    client.get('/api/notifications/settings').then(r => r.data.data),

  updateSettings: (data: Partial<NotificationSettingsPayload>) =>
    client.patch('/api/notifications/settings', data).then(r => r.data.data),
};
