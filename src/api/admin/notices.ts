import client from '../client';

const ADMIN_NOTICES_PATH = '/api/admin/notices';

export const noticesApi = {
  getNotices: (params?: { keyword?: string; status?: string; page?: number; size?: number; sort?: string }) =>
    client.get(ADMIN_NOTICES_PATH, { params }).then(r => r.data.data),

  getNotice: (noticeId: number) =>
    client.get(`${ADMIN_NOTICES_PATH}/${noticeId}`).then(r => r.data.data),

  createNotice: (data: { title: string; content: string; isPinned?: boolean; status?: string; startAt?: string; endAt?: string }) =>
    client.post(ADMIN_NOTICES_PATH, data).then(r => r.data.data),

  updateNotice: (noticeId: number, data: { title: string; content: string; isPinned?: boolean; status?: string; startAt?: string; endAt?: string }) =>
    client.put(`${ADMIN_NOTICES_PATH}/${noticeId}`, data).then(r => r.data.data),

  deleteNotice: (noticeId: number) =>
    client.delete(`${ADMIN_NOTICES_PATH}/${noticeId}`).then(r => r.data.data),
};
