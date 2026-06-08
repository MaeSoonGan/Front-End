import client from '../client';

export const contestsApi = {
  getMyContests: (params?: { status?: 'ALL' | 'ACTIVE' | 'ENDED'; page?: number; size?: number }) =>
    client.get('/api/contests/my', { params }).then(r => r.data.data),

  leaveContest: (contestId: number) =>
    client.patch(`/api/contests/${contestId}/leave`).then(r => r.data.data),

  // 대회 목록 조회
  getContests: (params?: {
    keyword?: string;
    status?: 'ALL' | 'ACTIVE' | 'ENDED';
    participation?: 'ALL' | 'JOINED' | 'NOT_JOINED';
    page?: number;
    size?: number;
  }) => client.get('/api/contests', { params }).then(r => r.data.data),

  // 대회 상세
  getContest: (contestId: number) =>
    client.get(`/api/contests/${contestId}`).then(r => r.data.data),

  // 대회 참가
  joinContest: (contestId: number) =>
    client.post(`/api/contests/${contestId}/join`).then(r => r.data.data),

  // 대회 랭킹 목록
  getRankings: (contestId: number, params?: { page?: number; size?: number }) =>
    client.get(`/api/contests/${contestId}/rankings`, { params }).then(r => r.data.data),

  // 내 랭킹
  getMyRanking: (contestId: number) =>
    client.get(`/api/contests/${contestId}/rankings/me`).then(r => r.data.data),

  // 마감 대회 결과
  getContestResult: (contestId: number, params?: { page?: number; size?: number }) =>
    client.get(`/api/contests/${contestId}/result`, { params }).then(r => r.data.data),
};
