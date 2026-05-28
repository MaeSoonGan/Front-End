import client from '../client';

export const membersApi = {
  getMemberSummary: () =>
    client.get('/api/admin/members/summary').then(r => r.data.data),

  getMembers: (params?: { keyword?: string; status?: string; startDate?: string; endDate?: string; page?: number; size?: number }) =>
    client.get('/api/admin/members', { params }).then(r => r.data.data),

  getMember: (memberId: number) =>
    client.get(`/api/admin/members/${memberId}`).then(r => r.data.data),

  exportMembers: (params?: { keyword?: string; status?: string; startDate?: string; endDate?: string }) =>
    client.get('/api/admin/members/export', { params, responseType: 'blob' }).then(r => r.data),

  suspendMembers: (data: { memberIds: number[]; reason: string }) =>
    client.patch('/api/admin/members/suspend', data).then(r => r.data.data),

  searchMembers: (params?: { keyword?: string; limit?: number }) =>
    client.get('/api/admin/members/search', { params }).then(r => r.data.data),

  getSuspensionSummary: () =>
    client.get('/api/admin/members/suspensions/summary').then(r => r.data.data),

  getSuspensions: (params?: { keyword?: string; status?: string; startDate?: string; endDate?: string; page?: number; size?: number }) =>
    client.get('/api/admin/members/suspensions', { params }).then(r => r.data.data),

  getSuspension: (suspensionId: number) =>
    client.get(`/api/admin/members/suspensions/${suspensionId}`).then(r => r.data.data),

  releaseSuspension: (suspensionId: number, data: { reason: string }) =>
    client.patch(`/api/admin/members/suspensions/${suspensionId}/release`, data).then(r => r.data.data),

  exportSuspensions: (params?: { keyword?: string; status?: string; startDate?: string; endDate?: string }) =>
    client.get('/api/admin/members/suspensions/export', { params, responseType: 'blob' }).then(r => r.data),

  getSeedPaymentSummary: () =>
    client.get('/api/admin/members/seed-payments/summary').then(r => r.data.data),

  getSeedPayments: (params?: { keyword?: string; status?: string; startDate?: string; endDate?: string; page?: number; size?: number }) =>
    client.get('/api/admin/members/seed-payments', { params }).then(r => r.data.data),

  paySeedMoney: (data: { memberIds: number[]; contestId?: number; amount: number; reason: string }) =>
    client.post('/api/admin/members/seed-payments', data).then(r => r.data.data),

  exportSeedPayments: (params?: { keyword?: string; status?: string; startDate?: string; endDate?: string }) =>
    client.get('/api/admin/members/seed-payments/export', { params, responseType: 'blob' }).then(r => r.data),
};
