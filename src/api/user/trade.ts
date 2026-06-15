import client from '../client';

export interface TradeHistoryParams {
  contestId?: number;
  from?: string;
  to?: string;
  side?: string;
  status?: 'ALL' | 'FILLED' | 'OPEN';
  page?: number;
  size?: number;
}

function clean<T extends object>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  ) as Partial<T>;
}

const contestOrdersPath = (contestId: number) => `/api/contest-orders/contests/${contestId}`;

function withoutContestId<T extends { contestId?: number }>(params: T) {
  const { contestId: _contestId, ...rest } = params;
  return rest;
}

export const tradeApi = {
  // 매매내역 조회
  getTrades: (params: TradeHistoryParams = {}) => {
    const query = clean(withoutContestId(params));
    return params.contestId != null
      ? client.get(`${contestOrdersPath(params.contestId)}/trades`, { params: query }).then(response => response.data.data)
      : client.get('/api/trades', { params: query }).then(response => response.data.data);
  },

  // 체결내역 조회
  getExecutions: (params: TradeHistoryParams = {}) =>
    client.get('/api/trades/executions', { params: clean(params) }).then(response => response.data.data),

  // 주문/체결 상태 필터 조회
  // TODO: 실제 명세가 /api/orders 또는 /api/trades/orders 중 무엇인지 확정되면 호출부와 함께 고정합니다.
  getTradeOrders: (params: TradeHistoryParams = {}) =>
    client.get('/api/trades/orders', { params: clean(params) }).then(response => response.data.data),
};
