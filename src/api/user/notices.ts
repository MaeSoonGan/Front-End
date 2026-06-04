import client from '../client';

export const noticesApi = {
  getNotices: () =>
    client.get('/api/notices').then(r => r.data.data),

  getNotice: (noticeId: number) =>
    client.get(`/api/notices/${noticeId}`).then(r => r.data.data),
};
