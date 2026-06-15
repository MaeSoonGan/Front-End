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

const contestOrdersPath = (contestId: number) => `/api/contest-orders/contests/${contestId}`;

function withoutContestId<T extends { contestId?: number }>(params: T) {
  const { contestId: _contestId, ...rest } = params;
  return rest;
}

export const orderApi = {
  // 체결내역(주문 현황)
  getOrders: (params: OrderListParams = {}) => {
    const query = clean(withoutContestId(params));
    return params.contestId != null
      ? client.get(`${contestOrdersPath(params.contestId)}/orders`, { params: query }).then(r => r.data.data)
      : client.get('/api/orders', { params: query }).then(r => r.data.data);
  },

  // 매매내역(체결된 거래)
  getTrades: (params: TradeListParams = {}) => {
    const query = clean(withoutContestId(params));
    return params.contestId != null
      ? client.get(`${contestOrdersPath(params.contestId)}/trades`, { params: query }).then(r => r.data.data)
      : client.get('/api/trades', { params: query }).then(r => r.data.data);
  },

  // 주문 생성
  createOrder: (body: CreateOrderBody) => {
    if (body.contestId != null) {
      const { contestId, ...requestBody } = body;
      return client.post(`${contestOrdersPath(contestId)}/orders`, requestBody).then(r => r.data.data);
    }

    return client.post('/api/orders', body).then(r => r.data.data);
  },

  // 미체결 주문 취소
  cancelOrder: (orderId: string | number, contestId?: number) =>
    contestId != null
      ? client.delete(`${contestOrdersPath(contestId)}/orders/${orderId}`).then(r => r.data.data)
      : client.patch(`/api/orders/${orderId}/cancel`).then(r => r.data.data),
};
