import { useEffect, useRef, useState } from 'react';

export interface LivePrice {
  stockCode: string;
  stockName: string;
  currentPrice: number;
  changePrice: number;
  changeRate: number;
  volume: number;
  high: number;
  low: number;
  open: number;
}

export interface LiveIndex {
  market: string;
  value: number;
  change: number;
  changeRate: number;
  volume: number;
}

export interface OrderbookLevel {
  price: number;
  quantity: number;
}

export interface LiveOrderbook {
  asks: OrderbookLevel[];
  bids: OrderbookLevel[];
}

interface UseMarketSocketOptions {
  indexMarkets?: string[];
  orderbookCodes?: string[];
}

// ws URL: VITE_MARKET_WS_URL 우선, 없으면 현재 호스트의 /ws/market (vite 프록시 경유)
function resolveWsUrl(): string {
  const fromEnv = import.meta.env.VITE_MARKET_WS_URL as string | undefined;
  if (fromEnv) {
    return fromEnv;
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws/market`;
}

function sortedKey(values: string[]): string {
  return Array.from(new Set(values.filter(Boolean))).sort().join(',');
}

/**
 * market-realtime-service(/ws/market)에 연결해 실시간 현재가/지수/호가를 구독한다.
 * - 연결은 마운트 동안 1회 유지(끊기면 자동 재연결)
 * - stockCodes(현재가) / options.indexMarkets(지수) / options.orderbookCodes(호가) 변경 시 차이분만 구독/해제
 */
export function useMarketSocket(stockCodes: string[], options: UseMarketSocketOptions = {}) {
  const { indexMarkets = [], orderbookCodes = [] } = options;

  const [prices, setPrices] = useState<Record<string, LivePrice>>({});
  const [indices, setIndices] = useState<Record<string, LiveIndex>>({});
  const [orderbooks, setOrderbooks] = useState<Record<string, LiveOrderbook>>({});

  const socketRef = useRef<WebSocket | null>(null);
  const priceRef = useRef<Set<string>>(new Set());
  const indexRef = useRef<Set<string>>(new Set());
  const orderbookRef = useRef<Set<string>>(new Set());

  const priceKey = sortedKey(stockCodes);
  const indexKey = sortedKey(indexMarkets);
  const orderbookKey = sortedKey(orderbookCodes);

  // 연결 (마운트 1회, 끊기면 재연결)
  useEffect(() => {
    let closedByUs = false;
    let reconnectTimer: number | undefined;

    const connect = () => {
      let ws: WebSocket;
      try {
        ws = new WebSocket(resolveWsUrl());
      } catch {
        reconnectTimer = window.setTimeout(connect, 2000);
        return;
      }
      socketRef.current = ws;

      ws.onopen = () => {
        const priceCodes = Array.from(priceRef.current);
        const markets = Array.from(indexRef.current);
        const orderbookCodesNow = Array.from(orderbookRef.current);
        if (priceCodes.length > 0) {
          ws.send(JSON.stringify({ action: 'SUBSCRIBE_PRICE', stockCodes: priceCodes }));
        }
        if (markets.length > 0) {
          ws.send(JSON.stringify({ action: 'SUBSCRIBE_INDEX', markets }));
        }
        if (orderbookCodesNow.length > 0) {
          ws.send(JSON.stringify({ action: 'SUBSCRIBE_ORDERBOOK', stockCodes: orderbookCodesNow }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          const d = msg.data;
          if (!d) return;

          if (msg.type === 'PRICE_UPDATE' && d.stockCode) {
            setPrices((cur) => ({
              ...cur,
              [d.stockCode]: {
                stockCode: d.stockCode,
                stockName: d.stockName ?? '',
                currentPrice: Number(d.currentPrice ?? 0),
                changePrice: Number(d.changePrice ?? 0),
                changeRate: Number(d.changeRate ?? 0),
                volume: Number(d.volume ?? 0),
                high: Number(d.high ?? 0),
                low: Number(d.low ?? 0),
                open: Number(d.open ?? 0),
              },
            }));
          } else if (msg.type === 'INDEX_UPDATE' && d.market) {
            setIndices((cur) => ({
              ...cur,
              [d.market]: {
                market: d.market,
                value: Number(d.value ?? 0),
                change: Number(d.change ?? 0),
                changeRate: Number(d.changeRate ?? 0),
                volume: Number(d.volume ?? 0),
              },
            }));
          } else if (msg.type === 'ORDERBOOK_UPDATE' && d.stockCode) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const toLevels = (arr: any[]): OrderbookLevel[] =>
              (arr ?? []).map((l) => ({ price: Number(l.price ?? 0), quantity: Number(l.quantity ?? 0) }));
            setOrderbooks((cur) => ({
              ...cur,
              [d.stockCode]: { asks: toLevels(d.asks), bids: toLevels(d.bids) },
            }));
          }
        } catch {
          // 파싱 실패 무시
        }
      };

      ws.onclose = () => {
        socketRef.current = null;
        if (!closedByUs) {
          reconnectTimer = window.setTimeout(connect, 2000);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connect();

    return () => {
      closedByUs = true;
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
      }
      // 페이지 이동(언마운트) 시: 닫기 전에 현재 구독을 모두 명시적으로 해제해
      // KIS 실시간 등록 슬롯을 즉시 반납한다 (소켓 close만으론 서버 정리가 늦을 수 있음)
      const ws = socketRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        const priceCodes = Array.from(priceRef.current);
        const orderbookCodes = Array.from(orderbookRef.current);
        const markets = Array.from(indexRef.current);
        try {
          if (priceCodes.length > 0) {
            ws.send(JSON.stringify({ action: 'UNSUBSCRIBE_PRICE', stockCodes: priceCodes }));
          }
          if (orderbookCodes.length > 0) {
            ws.send(JSON.stringify({ action: 'UNSUBSCRIBE_ORDERBOOK', stockCodes: orderbookCodes }));
          }
          if (markets.length > 0) {
            ws.send(JSON.stringify({ action: 'UNSUBSCRIBE_INDEX', markets }));
          }
        } catch {
          // 전송 실패는 무시 (close로 서버가 세션 구독을 정리함)
        }
      }
      ws?.close();
      socketRef.current = null;
    };
  }, []);

  // 구독 동기화 헬퍼 (추가/해제분만 전송)
  function syncSubscription(
    ref: React.MutableRefObject<Set<string>>,
    nextValues: string[],
    field: 'stockCodes' | 'markets',
    subscribeAction: string,
    unsubscribeAction: string,
  ) {
    const next = new Set(nextValues.filter(Boolean));
    const prev = ref.current;
    const toAdd = [...next].filter((v) => !prev.has(v));
    const toRemove = [...prev].filter((v) => !next.has(v));
    ref.current = next;

    const ws = socketRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      if (toAdd.length > 0) {
        ws.send(JSON.stringify({ action: subscribeAction, [field]: toAdd }));
      }
      if (toRemove.length > 0) {
        ws.send(JSON.stringify({ action: unsubscribeAction, [field]: toRemove }));
      }
    }
  }

  useEffect(() => {
    syncSubscription(priceRef, priceKey ? priceKey.split(',') : [], 'stockCodes', 'SUBSCRIBE_PRICE', 'UNSUBSCRIBE_PRICE');
  }, [priceKey]);

  useEffect(() => {
    syncSubscription(indexRef, indexKey ? indexKey.split(',') : [], 'markets', 'SUBSCRIBE_INDEX', 'UNSUBSCRIBE_INDEX');
  }, [indexKey]);

  useEffect(() => {
    syncSubscription(orderbookRef, orderbookKey ? orderbookKey.split(',') : [], 'stockCodes', 'SUBSCRIBE_ORDERBOOK', 'UNSUBSCRIBE_ORDERBOOK');
  }, [orderbookKey]);

  return { prices, indices, orderbooks };
}
