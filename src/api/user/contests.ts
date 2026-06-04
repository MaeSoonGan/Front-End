import client from '../client';

export const contestsApi = {
  getMyContests: (params?: { status?: 'ALL' | 'ACTIVE' | 'ENDED'; page?: number; size?: number }) =>
    client.get('/api/contests/my', { params }).then(r => r.data.data),

  leaveContest: (contestId: number) =>
    client.patch(`/api/contests/${contestId}/leave`).then(r => r.data.data),
};
