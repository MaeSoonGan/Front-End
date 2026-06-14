import { describe, it, expect } from 'vitest';

// 차트 이동평균 계산 (MarketPage toChartPoints 기준)
// 부족 구간(window 미만)은 가용분 평균.
function movingAverage(closes: number[], endIdx: number, window: number) {
  const start = Math.max(0, endIdx - window + 1);
  const slice = closes.slice(start, endIdx + 1);
  return slice.length === 0 ? 0 : Math.round(slice.reduce((s, v) => s + v, 0) / slice.length);
}

describe('차트 이동평균(MA) 계산', () => {
  const closes = [100, 200, 300, 400, 500];

  it('window=5, 마지막 시점은 5개 평균', () => {
    expect(movingAverage(closes, 4, 5)).toBe(300); // (100+200+300+400+500)/5
  });

  it('데이터 부족 구간은 가용분 평균', () => {
    expect(movingAverage(closes, 1, 5)).toBe(150); // (100+200)/2
    expect(movingAverage(closes, 0, 5)).toBe(100); // 첫 시점
  });

  it('window=20도 부족하면 가용분으로 계산', () => {
    expect(movingAverage(closes, 4, 20)).toBe(300);
  });
});
