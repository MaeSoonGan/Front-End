export type MarketTab = 'orderBook' | 'chart' | 'trades';

export interface OrderBookItem {
  price: number;
  quantity: number;
  changeRate: number;
}

export interface StockSummary {
  stockName: string;
  stockCode: string;
  currentPrice: number;
  changeAmount: number;
  changeRate: number;
  volume: string;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  previousClose: number;
}

export interface OrderBookData {
  askOrders: OrderBookItem[];
  bidOrders: OrderBookItem[];
}

export interface StockMarketData {
  summary: StockSummary;
  orderBook: OrderBookData;
}
