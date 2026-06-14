import { describe, it, expect } from 'vitest';

// 잔고/체결 로직 (BalancePage / BalanceExecutionHistoryTab 기준)

// 보유종목 실시간 평가손익 재계산 (평단 대비)
function recalcHolding(avg: number, qty: number, currentPrice: number) {
  const profitAmount = (currentPrice - avg) * qty;
  const profitRate = avg > 0 ? ((currentPrice - avg) / avg) * 100 : 0;
  return { profitAmount, profitRate };
}

// 체결 상태 enum 매핑
function toExecutionStatus(status: string) {
  switch ((status ?? '').toUpperCase()) {
    case 'FILLED': return 'FILLED';
    case 'PARTIALLY_FILLED':
    case 'PARTIAL': return 'PARTIAL';
    case 'ACCEPTED':
    case 'OPEN':
    case 'PENDING': return 'OPEN';
    default: return 'CANCELLED';
  }
}

// 체결내역 상태 필터
function matchFilter(filter: 'ALL' | 'FILLED' | 'OPEN', remaining: number, status: string) {
  if (filter === 'ALL') return true;
  if (filter === 'FILLED') return remaining === 0 && status !== 'CANCELLED';
  return remaining > 0 && status !== 'CANCELLED'; // 미체결
}

describe('보유종목 평가손익 재계산', () => {
  it('현재가 변동분으로 손익·수익률 계산', () => {
    const r = recalcHolding(10000, 5, 12000);
    expect(r.profitAmount).toBe(10000); // (12000-10000)*5
    expect(r.profitRate).toBeCloseTo(20);
  });
  it('평단 0이면 수익률 0', () => {
    expect(recalcHolding(0, 5, 12000).profitRate).toBe(0);
  });
});

describe('체결 상태 enum 매핑', () => {
  it('PARTIALLY_FILLED → PARTIAL', () => {
    expect(toExecutionStatus('PARTIALLY_FILLED')).toBe('PARTIAL');
  });
  it('PENDING/ACCEPTED → OPEN, 그 외 → CANCELLED', () => {
    expect(toExecutionStatus('PENDING')).toBe('OPEN');
    expect(toExecutionStatus('REJECTED')).toBe('CANCELLED');
  });
});

describe('체결내역 상태 필터', () => {
  it('미체결: 잔량>0 & 취소 아님', () => {
    expect(matchFilter('OPEN', 3, 'OPEN')).toBe(true);
    expect(matchFilter('OPEN', 0, 'FILLED')).toBe(false);
    expect(matchFilter('OPEN', 3, 'CANCELLED')).toBe(false);
  });
  it('체결: 잔량 0 & 취소 아님', () => {
    expect(matchFilter('FILLED', 0, 'FILLED')).toBe(true);
  });
});
