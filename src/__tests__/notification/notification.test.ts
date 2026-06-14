import { describe, it, expect } from 'vitest';

// 알림 로직 (NotificationListPage 기준)
function resolveType(rawType: string): { type: string; direction?: string } {
  const t = (rawType ?? '').toUpperCase();
  const direction = t.includes('BUY') ? 'BUY' : t.includes('SELL') ? 'SELL' : undefined;
  if (t.includes('CANCEL')) return { type: 'ORDER_CANCEL', direction };
  if (t.includes('CONTEST') || t.includes('RANK')) return { type: 'CONTEST' };
  if (t.includes('MARKET')) return { type: 'MARKET_OPEN' };
  if (t.includes('NOTICE')) return { type: 'NOTICE' };
  if (['TRADE', 'FILL', 'EXEC', 'ORDER', 'PENDING'].some((k) => t.includes(k))) return { type: 'EXECUTION', direction };
  return { type: 'NOTICE' };
}

function toDisplayTime(iso: string, now: number): string {
  const min = Math.floor((now - new Date(iso).getTime()) / 60000);
  if (min < 1) return '방금 전';
  if (min < 60) return `${min}분 전`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}시간 전`;
  const day = Math.floor(hour / 24);
  if (day < 30) return `${day}일 전`;
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function resolvePath(type: string, targetId?: number): string | null {
  switch (type) {
    case 'EXECUTION':
    case 'ORDER_CANCEL': return '/executions';
    case 'CONTEST': return targetId ? `/contests/${targetId}` : '/my-contests';
    case 'NOTICE': return targetId ? `/notices/${targetId}` : '/notices';
    default: return null;
  }
}

describe('알림 종류 매핑', () => {
  it('CANCEL 포함 → ORDER_CANCEL', () => {
    expect(resolveType('ORDER_CANCEL_SELL').type).toBe('ORDER_CANCEL');
  });
  it('TRADE/FILL → EXECUTION, 매수/매도 방향 추출', () => {
    expect(resolveType('TRADE_BUY')).toEqual({ type: 'EXECUTION', direction: 'BUY' });
  });
  it('CONTEST/RANK → CONTEST', () => {
    expect(resolveType('RANK_CHANGE').type).toBe('CONTEST');
  });
});

describe('상대시간 표시', () => {
  const now = new Date('2026-06-13T12:00:00').getTime();
  it('3분 전', () => {
    expect(toDisplayTime('2026-06-13T11:57:00', now)).toBe('3분 전');
  });
  it('방금 전 / 시간 / 일', () => {
    expect(toDisplayTime('2026-06-13T11:59:40', now)).toBe('방금 전');
    expect(toDisplayTime('2026-06-13T09:00:00', now)).toBe('3시간 전');
    expect(toDisplayTime('2026-06-11T12:00:00', now)).toBe('2일 전');
  });
});

describe('알림 클릭 이동 경로', () => {
  it('공지(targetId 有) → /notices/:id + 읽음 처리 전제', () => {
    expect(resolvePath('NOTICE', 5)).toBe('/notices/5');
  });
  it('체결 → /executions, 대회(id 無) → /my-contests', () => {
    expect(resolvePath('EXECUTION')).toBe('/executions');
    expect(resolvePath('CONTEST')).toBe('/my-contests');
  });
});
