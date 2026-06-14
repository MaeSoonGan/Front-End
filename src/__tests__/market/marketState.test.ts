import { describe, it, expect } from 'vitest';

// 종목 상세: REST 초기 시세에 ws 실시간 값 덮어쓰기 (MarketPage 기준)
interface Quote { currentPrice: number; changeRate: number; volume: number }
function mergeLive(apiSummary: Quote, live: Quote | undefined): Quote {
  if (!live) return apiSummary;
  return {
    ...apiSummary,
    currentPrice: live.currentPrice,
    changeRate: live.changeRate,
    volume: live.volume || apiSummary.volume,
  };
}

// 점검 모드: status.maintenance → boolean (useMaintenanceStatus 기준)
const toMaintenance = (status: { maintenance?: boolean } | null) => Boolean(status?.maintenance);

// URL 쿼리 → 초기 탭 / 주문방향 (MarketPage getInitialTab / getInitialOrderSide)
const getInitialTab = (tab: string | null) => (tab === 'chart' || tab === 'trades' ? tab : 'orderBook');
const getInitialOrderSide = (s: string | null) => (s === 'BUY' || s === 'SELL' ? s : null);

describe('REST→WS 시세 덮어쓰기', () => {
  const api: Quote = { currentPrice: 70000, changeRate: 0, volume: 1000 };
  it('ws 수신 시 현재가/등락률을 ws 값으로 갱신', () => {
    const merged = mergeLive(api, { currentPrice: 70500, changeRate: 0.71, volume: 2000 });
    expect(merged.currentPrice).toBe(70500);
    expect(merged.changeRate).toBeCloseTo(0.71);
  });
  it('ws 미수신 시 REST 초기값 유지', () => {
    expect(mergeLive(api, undefined).currentPrice).toBe(70000);
  });
});

describe('점검 모드 폴링 반영', () => {
  it('maintenance=true면 true', () => {
    expect(toMaintenance({ maintenance: true })).toBe(true);
  });
  it('없거나 false면 false', () => {
    expect(toMaintenance({ maintenance: false })).toBe(false);
    expect(toMaintenance(null)).toBe(false);
  });
});

describe('URL 쿼리 → 초기 상태(딥링크)', () => {
  it('tab 파라미터로 초기 탭 결정', () => {
    expect(getInitialTab('trades')).toBe('trades');
    expect(getInitialTab(null)).toBe('orderBook');
    expect(getInitialTab('xxx')).toBe('orderBook');
  });
  it('orderSide 파라미터로 주문 시트 방향 결정', () => {
    expect(getInitialOrderSide('BUY')).toBe('BUY');
    expect(getInitialOrderSide('etc')).toBeNull();
  });
});
