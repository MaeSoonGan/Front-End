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

export const tradeApi = {
  // 매매내역 조회
  getTrades: (params: TradeHistoryParams = {}) =>
    client.get('/api/trades', { params: clean(params) }).then(response => response.data.data),

  // 체결내역 조회
  getExecutions: (params: TradeHistoryParams = {}) =>
    client.get('/api/trades/executions', { params: clean(params) }).then(response => response.data.data),

  // 주문/체결 상태 필터 조회
  // TODO: 실제 명세가 /api/orders 또는 /api/trades/orders 중 무엇인지 확정되면 호출부와 함께 고정합니다.
  getTradeOrders: (params: TradeHistoryParams = {}) =>
    client.get('/api/trades/orders', { params: clean(params) }).then(response => response.data.data),
};
