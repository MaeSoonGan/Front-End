import { describe, it, expect } from 'vitest';

// 대회 로직 (ContestCard / ContestListPage / HomePage / ContestRankingPage 기준)

// 대회 카드 액션 버튼 라벨 분기
function actionLabel(status: string, joined: boolean, joinable: boolean, isJoining = false) {
  const canEnter = joined && status === 'ACTIVE';
  const canJoin = joinable && !joined && status !== 'SCHEDULED';
  if (status === 'ENDED') return '결과 보기';
  if (status === 'SCHEDULED') return '개최 예정';
  if (canEnter) return '입장하기';
  if (joined) return '참가 완료';
  if (canJoin) return isJoining ? '참가 처리 중' : '참가하기';
  return '참가 불가';
}

// 대회 목록 상태/종목 매핑
const toContestStatus = (s: string) => (s === 'ENDED' ? 'ENDED' : s === 'SCHEDULED' ? 'SCHEDULED' : 'ACTIVE');
const toStockType = (t?: string | null) => (!t || t === 'ALL' ? '전체 종목' : t);

// D-day 배지 (시작/종료까지 일수)
function daysFromToday(target: Date, today: Date) {
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
}

// 라이브 순위: 내 수익률 갱신 후 내림차순 재정렬 → 순위 재부여
function reRank(list: { id: number; rate: number }[]) {
  return [...list].sort((a, b) => b.rate - a.rate).map((p, i) => ({ ...p, rank: i + 1 }));
}

describe('대회 카드 액션 버튼 분기', () => {
  it('종료 대회 → 결과 보기', () => {
    expect(actionLabel('ENDED', true, false)).toBe('결과 보기');
  });
  it('진행중 미참가 → 참가하기', () => {
    expect(actionLabel('ACTIVE', false, true)).toBe('참가하기');
  });
  it('진행중 참가완료 → 입장하기', () => {
    expect(actionLabel('ACTIVE', true, false)).toBe('입장하기');
  });
  it('예정 → 개최 예정', () => {
    expect(actionLabel('SCHEDULED', false, true)).toBe('개최 예정');
  });
});

describe('대회 목록 상태/종목유형 매핑', () => {
  it('CLOSING_SOON → ACTIVE(진행중)', () => {
    expect(toContestStatus('CLOSING_SOON')).toBe('ACTIVE');
  });
  it('빈값/ALL → 전체 종목', () => {
    expect(toStockType(null)).toBe('전체 종목');
    expect(toStockType('ALL')).toBe('전체 종목');
    expect(toStockType('반도체')).toBe('반도체');
  });
});

describe('대회 D-day 계산', () => {
  it('3일 후면 3', () => {
    const today = new Date('2026-06-13T00:00:00');
    const target = new Date('2026-06-16T00:00:00');
    expect(daysFromToday(target, today)).toBe(3);
  });
});

describe('대회 실시간 순위 재정렬', () => {
  it('수익률 내림차순으로 순위 재부여', () => {
    const ranked = reRank([{ id: 1, rate: 2 }, { id: 2, rate: 9 }, { id: 3, rate: 5 }]);
    expect(ranked.map((r) => r.id)).toEqual([2, 3, 1]);
    expect(ranked[0].rank).toBe(1);
  });
});
