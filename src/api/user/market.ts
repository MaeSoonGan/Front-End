import client from '../client';

export const marketApi = {
  // 시장 지수 (KOSPI/KOSDAQ)
  getIndex: (market: string) =>
    client.get('/api/market/index', { params: { market } }).then(r => r.data.data),

  // 장 상태 (개장/마감 등)
  getStatus: () =>
    client.get('/api/market/status').then(r => r.data.data),

  // 시장 랭킹 (거래대금/상승률 등)
  getRanking: (type?: string) =>
    client.get('/api/market/ranking', { params: type ? { type } : undefined }).then(r => r.data.data),

  // 종목 현재가
  getStockPrice: (code: string) =>
    client.get(`/api/stocks/${code}/price`).then(r => r.data.data),

  // 종목 일별 정보 (시/고/저/전일종가)
  getStockDailyInfo: (code: string) =>
    client.get(`/api/stocks/${code}/daily-info`).then(r => r.data.data),

  // 종목 호가
  getStockOrderbook: (code: string) =>
    client.get(`/api/stocks/${code}/orderbook`).then(r => r.data.data),

  // 종목 검색
  searchStocks: (keyword: string, market: string) =>
    client.get('/api/stocks/search', { params: { keyword, market } }).then(r => r.data.data),

  // 관심종목 조회
  getWatchlist: (market: string = 'domestic') =>
    client.get('/api/watchlist', { params: { market } }).then(r => r.data.data),

  // 관심종목 추가
  addWatchlist: (stockCode: string) =>
    client.post(`/api/watchlist/${stockCode}`).then(r => r.data.data),

  // 관심종목 삭제
  deleteWatchlist: (stockCode: string) =>
    client.delete(`/api/watchlist/${stockCode}`).then(r => r.data.data),
};
