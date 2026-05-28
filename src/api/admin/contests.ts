import client from '../client';

export const contestsApi = {
  getContestSummary: () =>
    client.get('/api/admin/contests/summary').then(r => r.data.data),

  getContests: (params?: { keyword?: string; status?: string; startDate?: string; endDate?: string; page?: number; size?: number }) =>
    client.get('/api/admin/contests', { params }).then(r => r.data.data),

  createContest: (data: object) =>
    client.post('/api/admin/contests', data).then(r => r.data.data),

  getContest: (contestId: number) =>
    client.get(`/api/admin/contests/${contestId}`).then(r => r.data.data),

  updateContest: (contestId: number, data: object) =>
    client.put(`/api/admin/contests/${contestId}`, data).then(r => r.data.data),

  endContest: (contestId: number) =>
    client.patch(`/api/admin/contests/${contestId}/end`).then(r => r.data.data),

  cancelContest: (contestId: number) =>
    client.patch(`/api/admin/contests/${contestId}/cancel`).then(r => r.data.data),

  getContestResult: (contestId: number) =>
    client.get(`/api/admin/contests/${contestId}/result`).then(r => r.data.data),

  getRankingStats: (contestId: number) =>
    client.get(`/api/admin/contests/${contestId}/rankings/stats`).then(r => r.data.data),

  getRankings: (contestId: number, params?: { keyword?: string; excluded?: string; page?: number; size?: number }) =>
    client.get(`/api/admin/contests/${contestId}/rankings`, { params }).then(r => r.data.data),

  exportRankings: (contestId: number, params?: { keyword?: string; excluded?: string }) =>
    client.get(`/api/admin/contests/${contestId}/rankings/export`, { params, responseType: 'blob' }).then(r => r.data),

  excludeRanking: (contestId: number, memberId: number, data: { reason: string }) =>
    client.patch(`/api/admin/contests/${contestId}/rankings/${memberId}/exclude`, data).then(r => r.data.data),

  restoreRanking: (contestId: number, memberId: number) =>
    client.patch(`/api/admin/contests/${contestId}/rankings/${memberId}/restore`).then(r => r.data.data),
};
