import client from '../client';

export const portfolioApi = {
  // 잔고 요약 (총자산/예수금/주문가능금액/수익) — Redis 의존(주문가능금액)
  getSummary: () =>
    client.get('/api/portfolio/summary').then(r => r.data.data),

  // 대회 계좌 요약 (총자산/예수금/순위 등) — order-service
  getContestAccount: (contestId: number) =>
    client.get(`/api/contests/${contestId}/account`).then(r => r.data.data),

  // 보유종목 (contestId 지정 시 대회 계좌 기준)
  getHoldings: (contestId?: number) =>
    client.get('/api/portfolio/holdings', { params: contestId != null ? { contestId } : undefined })
      .then(r => r.data.data),

  // 주문가능금액 (예수금/주문가능/예약)
  getAvailableCash: () =>
    client.get('/api/portfolio/available-cash').then(r => r.data.data),

  // 단일 종목 보유 상세 (보유수량/매도가능수량/현재가)
  getHolding: (stockCode: string, contestId?: number) =>
    client.get(`/api/portfolio/holdings/${stockCode}`, { params: contestId != null ? { contestId } : undefined })
      .then(r => r.data.data),

  // 수익률 추이
  getProfitHistory: (period: string = '1M') =>
    client.get('/api/portfolio/profit-history', { params: { period } }).then(r => r.data.data),

  resetSeedMoney: (data: { contestId?: number; holdingsAndCashResetAgreed: boolean; irreversibleAgreed: boolean }) =>
    client.post('/api/portfolio/seed-money/reset', data).then(r => r.data.data),
};
