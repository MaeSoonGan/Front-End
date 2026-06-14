import { describe, it, expect } from 'vitest';

// 호가창 로직 (OrderBookRow / HomePage getChangeClass 기준)
const orderbookRate = (price: number, currentPrice: number) =>
  currentPrice > 0 ? ((price - currentPrice) / currentPrice) * 100 : 0;

const barWidthPct = (quantity: number, maxQuantity: number) =>
  Math.max((quantity / maxQuantity) * 100, 8);

function getChangeClass(changeRate: string) {
  if (changeRate.startsWith('-')) return 'text-blue-600';
  if (changeRate.startsWith('+')) return 'text-red-500';
  return 'text-emerald-600';
}

describe('호가 등락률 계산', () => {
  it('현재가 대비 (호가-현재가)/현재가 ×100', () => {
    expect(orderbookRate(70700, 70000)).toBeCloseTo(1.0, 5);
    expect(orderbookRate(69300, 70000)).toBeCloseTo(-1.0, 5);
  });
  it('현재가 0이면 0 반환', () => {
    expect(orderbookRate(100, 0)).toBe(0);
  });
});

describe('호가 잔량 막대 비율', () => {
  it('잔량/최대잔량 비율(%)', () => {
    expect(barWidthPct(50, 100)).toBe(50);
  });
  it('최소 8% 보장', () => {
    expect(barWidthPct(1, 1000)).toBe(8);
  });
});

describe('등락 방향 색상 분류', () => {
  it('상승 빨강 / 하락 파랑 / 보합 초록', () => {
    expect(getChangeClass('+1.50%')).toBe('text-red-500');
    expect(getChangeClass('-0.80%')).toBe('text-blue-600');
    expect(getChangeClass('0.00%')).toBe('text-emerald-600');
  });
});
