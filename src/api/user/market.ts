import client from '../client';

export const marketApi = {
  // 종목 목록
  // TODO: 목록 API 응답 필드/페이지네이션 명세 확정 후 타입을 구체화합니다.
  getStocks: (params?: { keyword?: string; market?: string; page?: number; size?: number }) =>
    client.get('/api/stocks', { params }).then(r => r.data.data),

  // 시장 지수 (KOSPI/KOSDAQ)
  getIndex: (market: string) =>
    client.get('/api/market/index', { params: { market } }).then(r => r.data.data),

  // 장 상태 (개장/마감 등)
  getStatus: () =>
    client.get('/api/market/status').then(r => r.data.data),

  // 시장 랭킹 (거래대금/상승률 등)
  getRanking: (type?: string) =>
    client.get('/api/market/ranking', { params: type ? { type } : undefined }).then(r => r.data.data),

  // 실시간 조회상위 랭킹 (market-service, RDS 스냅샷 — 종목명 조인 + 마지막 실제값) — success/data 래퍼
  getHtsTopViewRanking: () =>
    client.get('/api/market/ranking/hts-top-view').then(r => r.data.data),

  // 코스피/코스닥 지수 (market-service, RDS 스냅샷 — 마지막 실제값 유지) — success/data 래퍼
  getRealtimeIndices: () =>
    client.get('/api/market/indices').then(r => r.data.data),

  // 종목 현재가
  getStockPrice: (code: string) =>
    client.get(`/api/stocks/${code}/price`).then(r => r.data.data),

  // 실시간 현재가 (market-realtime-service): Redis 캐시 → 없으면 한투 fetch.
  // 이 엔드포인트는 ApiResponse 래퍼 없이 raw 객체를 반환하므로 r.data 그대로 사용.
  getRealtimePrice: (code: string) =>
    client.get(`/api/market/price/${code}`).then(r => r.data),

  // 실시간 호가 (market-realtime-service): Redis 캐시 → 없으면 한투 fetch → 마지막 호가 백업. raw 응답.
  getRealtimeOrderbook: (code: string) =>
    client.get(`/api/market/orderbook/${code}`).then(r => r.data),

  // 종목 일별 정보 (시/고/저/전일종가)
  getStockDailyInfo: (code: string) =>
    client.get(`/api/stocks/${code}/daily-info`).then(r => r.data.data),

  // 종목 차트 캔들 (period D/W/M, range/from/to)
  getStockChart: (code: string, params?: { period?: string; range?: string; from?: string; to?: string }) =>
    client.get(`/api/stocks/${code}/chart`, { params }).then(r => r.data.data),

  // 종목 호가
  getStockOrderbook: (code: string) =>
    client.get(`/api/stocks/${code}/orderbook`).then(r => r.data.data),

  // 종목 체결 데이터
  // TODO: 체결 데이터 endpoint가 확정되면 /api/market/trades 후보 경로를 실제 명세로 교체합니다.
  getStockTrades: (code: string, params?: { size?: number }) =>
    client.get(`/api/stocks/${code}/trades`, { params }).then(r => r.data.data),

  // 종목 검색
  searchStocks: (keyword: string, market: string) =>
    client.get('/api/stocks/search', { params: { keyword, market } }).then(r => r.data.data),

  // 관심종목 조회 (contestId=0이면 일반 모드, 그 외 대회별)
  getWatchlist: (market: string = 'domestic', contestId: number = 0) =>
    client.get('/api/watchlist', { params: { market, contestId } }).then(r => r.data.data),

  // 관심종목 추가
  addWatchlist: (stockCode: string, contestId: number = 0) =>
    client.post(`/api/watchlist/${stockCode}`, null, { params: { contestId } }).then(r => r.data.data),

  // 관심종목 삭제
  deleteWatchlist: (stockCode: string, contestId: number = 0) =>
    client.delete(`/api/watchlist/${stockCode}`, { params: { contestId } }).then(r => r.data.data),
};
