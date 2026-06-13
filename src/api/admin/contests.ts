import client from '../client';

const ADMIN_CONTESTS_PATH = '/api/admin/contests';

export const contestsApi = {
  getContestSummary: () =>
    client.get(`${ADMIN_CONTESTS_PATH}/summary`).then(r => r.data.data),

  getContests: (params?: { keyword?: string; status?: string; startDate?: string; endDate?: string; page?: number; size?: number }) =>
    client.get(ADMIN_CONTESTS_PATH, { params }).then(r => r.data.data),

  createContest: (data: object) =>
    client.post(ADMIN_CONTESTS_PATH, data).then(r => r.data.data),

  getContest: (contestId: number) =>
    client.get(`${ADMIN_CONTESTS_PATH}/${contestId}`).then(r => r.data.data),

  updateContest: (contestId: number, data: object) =>
    client.put(`${ADMIN_CONTESTS_PATH}/${contestId}`, data).then(r => r.data.data),

  endContest: (contestId: number) =>
    client.patch(`${ADMIN_CONTESTS_PATH}/${contestId}/end`).then(r => r.data.data),

  cancelContest: (contestId: number) =>
    client.patch(`${ADMIN_CONTESTS_PATH}/${contestId}/cancel`).then(r => r.data.data),

  getContestResult: (contestId: number) =>
    client.get(`${ADMIN_CONTESTS_PATH}/${contestId}/result`).then(r => r.data.data),

  getRankingStats: (contestId: number) =>
    client.get(`${ADMIN_CONTESTS_PATH}/${contestId}/rankings/stats`).then(r => r.data.data),

  getRankings: (contestId: number, params?: { keyword?: string; excluded?: string; page?: number; size?: number }) =>
    client.get(`${ADMIN_CONTESTS_PATH}/${contestId}/rankings`, { params }).then(r => r.data.data),

  exportRankings: (contestId: number, params?: { keyword?: string; excluded?: string }) =>
    client.get(`${ADMIN_CONTESTS_PATH}/${contestId}/rankings/export`, { params, responseType: 'blob' }).then(r => r.data),

  excludeRanking: (contestId: number, memberId: number, data: { reason: string }) =>
    client.patch(`${ADMIN_CONTESTS_PATH}/${contestId}/rankings/${memberId}/exclude`, data).then(r => r.data.data),

  restoreRanking: (contestId: number, memberId: number) =>
    client.patch(`${ADMIN_CONTESTS_PATH}/${contestId}/rankings/${memberId}/restore`).then(r => r.data.data),
};
