import client from '../client';

export interface OrderListParams {
  contestId?: number;
  status?: string;
  date?: string;
  page?: number;
  size?: number;
}

export interface TradeListParams {
  contestId?: number;
  from?: string;
  to?: string;
  side?: string;
  page?: number;
  size?: number;
}

export interface CreateOrderBody {
  contestId?: number;
  stockId: number;
  stockCode: string;
  side: 'BUY' | 'SELL';
  orderType: 'LIMIT' | 'MARKET';
  price?: number;
  quantity: number;
}

// 빈 값 파라미터 제거
function clean<T extends object>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  ) as Partial<T>;
}

export const orderApi = {
  // 체결내역(주문 현황)
  getOrders: (params: OrderListParams = {}) =>
    client.get('/api/orders', { params: clean(params) }).then(r => r.data.data),

  // 매매내역(체결된 거래)
  getTrades: (params: TradeListParams = {}) =>
    client.get('/api/trades', { params: clean(params) }).then(r => r.data.data),

  // 주문 생성
  createOrder: (body: CreateOrderBody) =>
    client.post('/api/orders', body).then(r => r.data.data),
};
