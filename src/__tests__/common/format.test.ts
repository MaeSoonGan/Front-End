import { describe, it, expect } from 'vitest';

// 금액/수익률 포맷 (HomePage 등 공통 포맷터 기준)
const formatWon = (v: number) => `${Math.round(v).toLocaleString('ko-KR')}원`;
const formatSignedWon = (v: number) => {
  const sign = v > 0 ? '+' : v < 0 ? '-' : '';
  return `${sign}${Math.abs(Math.round(v)).toLocaleString('ko-KR')}원`;
};
const formatSignedRate = (v: number) => {
  const sign = v > 0 ? '+' : v < 0 ? '-' : '';
  return `${sign}${Math.abs(v).toFixed(2)}%`;
};

// 무한 스크롤 콜백 (useInfiniteScroll / IntersectionObserver 콜백 조건)
function onIntersect(isIntersecting: boolean, hasMore: boolean, loading: boolean, load: () => void) {
  if (isIntersecting && hasMore && !loading) load();
}

describe('금액 부호·천단위 포맷', () => {
  it('천단위 콤마 + 원', () => {
    expect(formatWon(3333000)).toBe('3,333,000원');
  });
  it('부호 포함 금액', () => {
    expect(formatSignedWon(-3333000)).toBe('-3,333,000원');
    expect(formatSignedWon(1000)).toBe('+1,000원');
  });
  it('부호 포함 수익률(소수 2자리)', () => {
    expect(formatSignedRate(7.2)).toBe('+7.20%');
    expect(formatSignedRate(-1.5)).toBe('-1.50%');
  });
});

describe('무한 스크롤 콜백', () => {
  it('교차 + hasMore + 미로딩일 때만 1회 호출', () => {
    let called = 0;
    const load = () => { called += 1; };
    onIntersect(true, true, false, load);
    expect(called).toBe(1);
  });
  it('이미 로딩 중이거나 더 없으면 호출 안 함', () => {
    let called = 0;
    const load = () => { called += 1; };
    onIntersect(true, true, true, load); // loading
    onIntersect(true, false, false, load); // !hasMore
    onIntersect(false, true, false, load); // not intersecting
    expect(called).toBe(0);
  });
});
