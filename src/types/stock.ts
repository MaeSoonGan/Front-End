export type MarketTab = 'orderBook' | 'chart' | 'trades';
export type ChartPeriod = '1m' | '5m' | '15m' | 'day' | 'week' | 'month';
export type ChartType = 'line' | 'bar';

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

export interface StockChartPoint {
  date: string;
  price: number;
  ma5: number;
  ma20: number;
  ma60: number;
  volume: number;
  direction: 'rise' | 'fall';
}

export interface StockMarketData {
  summary: StockSummary;
  orderBook: OrderBookData;
  chart: Record<ChartPeriod, StockChartPoint[]>;
}
