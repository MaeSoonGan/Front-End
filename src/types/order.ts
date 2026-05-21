export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'LIMIT' | 'MARKET';
export type OpenOrderStatus = 'PENDING' | 'PARTIAL' | 'CANCELLED';

export interface OrderStockInfo {
  stockName: string;
  stockCode: string;
  market: string;
  currentPrice: number;
  changeRate: number;
}

export interface OrderAccountInfo {
  availableBalance: number;
  holdingQuantity: number;
  feeRate: number;
}

export interface OpenOrderItem {
  id: string;
  stockName: string;
  side: OrderSide;
  quantity: number;
  price: number;
  status: OpenOrderStatus;
}

export interface OrderFormState {
  side: OrderSide;
  orderType: OrderType;
  quantity: string;
  price: string;
}
