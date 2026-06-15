import client from '../client';

const ADMIN_MEMBERS_PATH = '/api/admin/members';

export const membersApi = {
  getMemberSummary: () =>
    client.get(`${ADMIN_MEMBERS_PATH}/summary`).then(r => r.data.data),

  getMembers: (params?: { keyword?: string; status?: string; startDate?: string; endDate?: string; page?: number; size?: number; sort?: string }) =>
    client.get(ADMIN_MEMBERS_PATH, { params }).then(r => r.data.data),

  getMember: (memberId: number) =>
    client.get(`${ADMIN_MEMBERS_PATH}/${memberId}`).then(r => r.data.data),

  exportMembers: (params?: { keyword?: string; status?: string; startDate?: string; endDate?: string }) =>
    client.get(`${ADMIN_MEMBERS_PATH}/export`, { params, responseType: 'blob' }).then(r => r.data),

  suspendMembers: (data: { memberIds: number[]; reason: string }) =>
    client.patch(`${ADMIN_MEMBERS_PATH}/suspend`, data).then(r => r.data.data),

  searchMembers: (params?: { keyword?: string; limit?: number }) =>
    client.get(`${ADMIN_MEMBERS_PATH}/search`, { params }).then(r => r.data.data),

  getSuspensionSummary: () =>
    client.get(`${ADMIN_MEMBERS_PATH}/suspensions/summary`).then(r => r.data.data),

  getSuspensions: (params?: { keyword?: string; status?: string; startDate?: string; endDate?: string; page?: number; size?: number; sort?: string }) =>
    client.get(`${ADMIN_MEMBERS_PATH}/suspensions`, { params }).then(r => r.data.data),

  getSuspension: (suspensionId: number) =>
    client.get(`${ADMIN_MEMBERS_PATH}/suspensions/${suspensionId}`).then(r => r.data.data),

  releaseSuspension: (suspensionId: number, data: { reason: string }) =>
    client.patch(`${ADMIN_MEMBERS_PATH}/suspensions/${suspensionId}/release`, data).then(r => r.data.data),

  releaseSuspensionByMember: (memberId: number, data: { reason: string }) =>
    client.patch(`${ADMIN_MEMBERS_PATH}/${memberId}/suspensions/release`, data).then(r => r.data.data),

  exportSuspensions: (params?: { keyword?: string; status?: string; startDate?: string; endDate?: string }) =>
    client.get(`${ADMIN_MEMBERS_PATH}/suspensions/export`, { params, responseType: 'blob' }).then(r => r.data),

  getSeedPaymentSummary: () =>
    client.get(`${ADMIN_MEMBERS_PATH}/seed-payments/summary`).then(r => r.data.data),

  getSeedPayments: (params?: { keyword?: string; status?: string; startDate?: string; endDate?: string; page?: number; size?: number; sort?: string }) =>
    client.get(`${ADMIN_MEMBERS_PATH}/seed-payments`, { params }).then(r => r.data.data),

  paySeedMoney: (data: { memberIds: number[]; contestId?: number; amount: number; reason: string }) =>
    client.post(`${ADMIN_MEMBERS_PATH}/seed-payments`, data).then(r => r.data.data),

  exportSeedPayments: (params?: { keyword?: string; status?: string; startDate?: string; endDate?: string }) =>
    client.get(`${ADMIN_MEMBERS_PATH}/seed-payments/export`, { params, responseType: 'blob' }).then(r => r.data),
};
