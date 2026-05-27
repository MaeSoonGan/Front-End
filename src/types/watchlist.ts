export type WatchlistMarketType = 'DOMESTIC' | 'OVERSEAS';

export interface WatchlistStockItem {
  id: string;
  stockName: string;
  stockCode: string;
  marketType: WatchlistMarketType;
  exchange: string;
  currentPrice: number;
  changeRate: number;
}
