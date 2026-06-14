import client from '../client';

export const portfolioApi = {
  // 접속 하트비트 (현재 접속자 집계용) — 로그인 상태에서 주기 호출
  heartbeat: () =>
    client.post('/api/portfolio/heartbeat').then(r => r.data),

  // 잔고 요약 (총자산/예수금/주문가능금액/수익) — Redis 의존(주문가능금액)
  getSummary: () =>
    client.get('/api/portfolio/summary').then(r => r.data.data),

  // 포트폴리오 전체 조회
  // TODO: /api/portfolio 단일 응답 명세가 확정되면 BalancePage 매핑을 이 함수로 통합합니다.
  getPortfolio: () =>
    client.get('/api/portfolio').then(r => r.data.data),

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

  // TODO: 백엔드가 /api/portfolio/profit-trend로 제공할 경우 getProfitHistory 대체 여부를 확인합니다.
  getProfitTrend: (period: string = '1M') =>
    client.get('/api/portfolio/profit-trend', { params: { period } }).then(r => r.data.data),

  resetSeedMoney: (data: { contestId?: number; holdingsAndCashResetAgreed: boolean; irreversibleAgreed: boolean }) =>
    client.post('/api/portfolio/seed-money/reset', data).then(r => r.data.data),
};
