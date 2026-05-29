import client from '../client';

export const noticesApi = {
  getNotices: (params?: { keyword?: string; status?: string; page?: number; size?: number }) =>
    client.get('/api/admin/notices', { params }).then(r => r.data.data),

  getNotice: (noticeId: number) =>
    client.get(`/api/admin/notices/${noticeId}`).then(r => r.data.data),

  createNotice: (data: { title: string; content: string; isPinned?: boolean; status?: string; startAt?: string; endAt?: string }) =>
    client.post('/api/admin/notices', data).then(r => r.data.data),

  updateNotice: (noticeId: number, data: { title: string; content: string; isPinned?: boolean; status?: string; startAt?: string; endAt?: string }) =>
    client.put(`/api/admin/notices/${noticeId}`, data).then(r => r.data.data),

  deleteNotice: (noticeId: number) =>
    client.delete(`/api/admin/notices/${noticeId}`).then(r => r.data.data),
};
