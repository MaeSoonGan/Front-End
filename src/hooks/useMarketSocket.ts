import { useEffect, useState } from 'react';

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

interface MarketSnapshot {
  prices: Record<string, LivePrice>;
  indices: Record<string, LiveIndex>;
  orderbooks: Record<string, LiveOrderbook>;
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

type Channel = 'price' | 'orderbook' | 'index';

const CHANNEL_ACTIONS: Record<Channel, { sub: string; unsub: string; field: 'stockCodes' | 'markets' }> = {
  price: { sub: 'SUBSCRIBE_PRICE', unsub: 'UNSUBSCRIBE_PRICE', field: 'stockCodes' },
  orderbook: { sub: 'SUBSCRIBE_ORDERBOOK', unsub: 'UNSUBSCRIBE_ORDERBOOK', field: 'stockCodes' },
  index: { sub: 'SUBSCRIBE_INDEX', unsub: 'UNSUBSCRIBE_INDEX', field: 'markets' },
};

/**
 * 앱 전역에서 단 1개의 WebSocket 연결만 유지하는 매니저.
 * - 페이지마다 연결을 새로 열지 않고, 구독만 추가/해제(diff)한다.
 * - 같은 종목/지수를 여러 컴포넌트가 구독해도 ref-count로 KIS에는 1번만 구독/해제한다.
 *   → KIS 실시간 등록 한도(MAX SUBSCRIBE OVER) 및 연결 churn 방지.
 */
class MarketSocketManager {
  private ws: WebSocket | null = null;
  private reconnectTimer: number | undefined;
  private idleCloseTimer: number | undefined;
  private readonly counts: Record<Channel, Map<string, number>> = {
    price: new Map(),
    orderbook: new Map(),
    index: new Map(),
  };
  private snapshot: MarketSnapshot = { prices: {}, indices: {}, orderbooks: {} };
  private readonly listeners = new Set<(snapshot: MarketSnapshot) => void>();

  getSnapshot(): MarketSnapshot {
    return this.snapshot;
  }

  addListener(listener: (snapshot: MarketSnapshot) => void): void {
    this.listeners.add(listener);
    if (this.idleCloseTimer) {
      window.clearTimeout(this.idleCloseTimer);
      this.idleCloseTimer = undefined;
    }
    this.ensureConnection();
    listener(this.snapshot);
  }

  removeListener(listener: (snapshot: MarketSnapshot) => void): void {
    this.listeners.delete(listener);
    this.scheduleIdleCloseIfUnused();
  }

  // 구독 획득: ref-count 증가, 0→1인 키만 실제 SUBSCRIBE 전송
  acquire(channel: Channel, keys: string[]): void {
    if (keys.length === 0) {
      return;
    }
    const map = this.counts[channel];
    const toSubscribe: string[] = [];
    for (const key of keys) {
      const count = map.get(key) ?? 0;
      map.set(key, count + 1);
      if (count === 0) {
        toSubscribe.push(key);
      }
    }
    this.ensureConnection();
    if (toSubscribe.length > 0) {
      this.send(CHANNEL_ACTIONS[channel].sub, channel, toSubscribe);
    }
  }

  // 구독 해제: ref-count 감소, 1→0인 키만 실제 UNSUBSCRIBE 전송
  release(channel: Channel, keys: string[]): void {
    if (keys.length === 0) {
      return;
    }
    const map = this.counts[channel];
    const toUnsubscribe: string[] = [];
    for (const key of keys) {
      const count = map.get(key) ?? 0;
      if (count <= 1) {
        map.delete(key);
        if (count === 1) {
          toUnsubscribe.push(key);
        }
      } else {
        map.set(key, count - 1);
      }
    }
    if (toUnsubscribe.length > 0) {
      this.send(CHANNEL_ACTIONS[channel].unsub, channel, toUnsubscribe);
    }
    this.scheduleIdleCloseIfUnused();
  }

  private hasSubscriptions(): boolean {
    return this.counts.price.size + this.counts.orderbook.size + this.counts.index.size > 0;
  }

  private ensureConnection(): void {
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }
    this.connect();
  }

  private connect(): void {
    let ws: WebSocket;
    try {
      ws = new WebSocket(resolveWsUrl());
    } catch {
      this.scheduleReconnect();
      return;
    }
    this.ws = ws;

    ws.onopen = () => {
      // 재연결/최초 연결 시: 현재 ref-count 중인 구독을 모두 다시 등록
      (Object.keys(this.counts) as Channel[]).forEach((channel) => {
        const keys = Array.from(this.counts[channel].keys());
        if (keys.length > 0) {
          this.send(CHANNEL_ACTIONS[channel].sub, channel, keys);
        }
      });
    };

    ws.onmessage = (event) => this.handleMessage(event);

    ws.onclose = () => {
      this.ws = null;
      // 아직 구독/리스너가 있으면 재연결
      if (this.listeners.size > 0 || this.hasSubscriptions()) {
        this.scheduleReconnect();
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = undefined;
      this.connect();
    }, 2000);
  }

  // 리스너도 구독도 없으면 잠시 후 연결 종료(페이지 이동 중 churn 방지를 위해 지연)
  private scheduleIdleCloseIfUnused(): void {
    if (this.listeners.size > 0 || this.hasSubscriptions()) {
      return;
    }
    if (this.idleCloseTimer) {
      return;
    }
    this.idleCloseTimer = window.setTimeout(() => {
      this.idleCloseTimer = undefined;
      if (this.listeners.size === 0 && !this.hasSubscriptions()) {
        if (this.reconnectTimer) {
          window.clearTimeout(this.reconnectTimer);
          this.reconnectTimer = undefined;
        }
        this.ws?.close();
        this.ws = null;
      }
    }, 5000);
  }

  private send(action: string, channel: Channel, keys: string[]): void {
    const ws = this.ws;
    // 연결 전이면 보내지 않음 — onopen에서 일괄 재구독됨
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return;
    }
    ws.send(JSON.stringify({ action, [CHANNEL_ACTIONS[channel].field]: keys }));
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const msg = JSON.parse(event.data);
      const d = msg.data;
      if (!d) {
        return;
      }

      if (msg.type === 'PRICE_UPDATE' && d.stockCode) {
        this.snapshot = {
          ...this.snapshot,
          prices: {
            ...this.snapshot.prices,
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
          },
        };
      } else if (msg.type === 'INDEX_UPDATE' && d.market) {
        this.snapshot = {
          ...this.snapshot,
          indices: {
            ...this.snapshot.indices,
            [d.market]: {
              market: d.market,
              value: Number(d.value ?? 0),
              change: Number(d.change ?? 0),
              changeRate: Number(d.changeRate ?? 0),
              volume: Number(d.volume ?? 0),
            },
          },
        };
      } else if (msg.type === 'ORDERBOOK_UPDATE' && d.stockCode) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const toLevels = (arr: any[]): OrderbookLevel[] =>
          (arr ?? []).map((l) => ({ price: Number(l.price ?? 0), quantity: Number(l.quantity ?? 0) }));
        this.snapshot = {
          ...this.snapshot,
          orderbooks: {
            ...this.snapshot.orderbooks,
            [d.stockCode]: { asks: toLevels(d.asks), bids: toLevels(d.bids) },
          },
        };
      } else {
        return;
      }

      this.emit();
    } catch {
      // 파싱 실패 무시
    }
  }

  private emit(): void {
    for (const listener of this.listeners) {
      listener(this.snapshot);
    }
  }
}

// 앱 전역 단일 인스턴스
const marketSocketManager = new MarketSocketManager();

/**
 * market-realtime-service(/ws/market)에 연결해 실시간 현재가/지수/호가를 구독한다.
 * - 연결은 앱 전체에서 1개만 공유(MarketSocketManager). 페이지 이동 시 구독만 추가/해제된다.
 * - stockCodes(현재가) / options.indexMarkets(지수) / options.orderbookCodes(호가)가
 *   바뀌면 차이분만 구독/해제하고, 언마운트 시 이 컴포넌트가 잡은 구독을 반납한다.
 */
export function useMarketSocket(stockCodes: string[], options: UseMarketSocketOptions = {}) {
  const { indexMarkets = [], orderbookCodes = [] } = options;

  const [snapshot, setSnapshot] = useState<MarketSnapshot>(() => marketSocketManager.getSnapshot());

  const priceKey = sortedKey(stockCodes);
  const indexKey = sortedKey(indexMarkets);
  const orderbookKey = sortedKey(orderbookCodes);

  // 실시간 데이터 수신 (전역 매니저 구독)
  useEffect(() => {
    const listener = (next: MarketSnapshot) => setSnapshot(next);
    marketSocketManager.addListener(listener);
    return () => marketSocketManager.removeListener(listener);
  }, []);

  // 현재가 구독 (키 변경/언마운트 시 차이분만 반영)
  useEffect(() => {
    const keys = priceKey ? priceKey.split(',') : [];
    if (keys.length === 0) {
      return;
    }
    marketSocketManager.acquire('price', keys);
    return () => marketSocketManager.release('price', keys);
  }, [priceKey]);

  // 지수 구독
  useEffect(() => {
    const keys = indexKey ? indexKey.split(',') : [];
    if (keys.length === 0) {
      return;
    }
    marketSocketManager.acquire('index', keys);
    return () => marketSocketManager.release('index', keys);
  }, [indexKey]);

  // 호가 구독
  useEffect(() => {
    const keys = orderbookKey ? orderbookKey.split(',') : [];
    if (keys.length === 0) {
      return;
    }
    marketSocketManager.acquire('orderbook', keys);
    return () => marketSocketManager.release('orderbook', keys);
  }, [orderbookKey]);

  return { prices: snapshot.prices, indices: snapshot.indices, orderbooks: snapshot.orderbooks };
}
