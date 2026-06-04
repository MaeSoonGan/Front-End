import client from '../client';

export const noticesApi = {
  getNotices: (params?: { page?: number; size?: number }) =>
    client.get('/api/notices', { params }).then(r => r.data.data),

  getNotice: (noticeId: number) =>
    client.get(`/api/notices/${noticeId}`).then(r => r.data.data),
};
