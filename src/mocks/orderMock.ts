import type { OpenOrderItem, OrderAccountInfo } from '../types/order';

export const orderAccountMock: OrderAccountInfo = {
  availableBalance: 9245200,
  holdingQuantity: 10,
  feeRate: 0.0015,
};

export const openOrderMock: OpenOrderItem[] = [
  {
    id: 'open-order-1',
    stockName: 'SK하이닉스',
    side: 'SELL',
    quantity: 5,
    price: 182000,
    status: 'PENDING',
  },
  {
    id: 'open-order-2',
    stockName: '카카오',
    side: 'BUY',
    quantity: 20,
    price: 44200,
    status: 'PARTIAL',
  },
];
