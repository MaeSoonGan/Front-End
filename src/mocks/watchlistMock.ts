import type { WatchlistStockItem } from '../types/watchlist';

export const watchlistMock: WatchlistStockItem[] = [
  {
    id: 'watch-005930',
    stockName: '삼성전자',
    stockCode: '005930',
    marketType: 'DOMESTIC',
    exchange: 'KOSPI',
    currentPrice: 75400,
    changeRate: 1.62,
  },
  {
    id: 'watch-000660',
    stockName: 'SK하이닉스',
    stockCode: '000660',
    marketType: 'DOMESTIC',
    exchange: 'KOSPI',
    currentPrice: 182500,
    changeRate: 2.8,
  },
  {
    id: 'watch-035420',
    stockName: 'NAVER',
    stockCode: '035420',
    marketType: 'DOMESTIC',
    exchange: 'KOSPI',
    currentPrice: 198000,
    changeRate: -0.5,
  },
  {
    id: 'watch-005380',
    stockName: '현대차',
    stockCode: '005380',
    marketType: 'DOMESTIC',
    exchange: 'KOSPI',
    currentPrice: 215500,
    changeRate: 0.9,
  },
  {
    id: 'watch-aapl',
    stockName: 'Apple',
    stockCode: 'AAPL',
    marketType: 'OVERSEAS',
    exchange: 'NASDAQ',
    currentPrice: 192,
    changeRate: 1.15,
  },
];
