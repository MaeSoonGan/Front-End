import { describe, it, expect } from 'vitest';

// 관리자 페이지 로직 (AdminContest/Notice/Dashboard/User/Suspension/AuditLog/Ranking 기준)

// 대회 상태 매핑
const toApiStatus = (tab: string) => (tab === 'ALL' ? undefined : tab === 'ONGOING' ? 'ACTIVE' : tab);
const toUiStatus = (s: string) =>
  s === 'ACTIVE' || s === 'ONGOING' ? 'ONGOING' : s === 'CLOSING_SOON' ? 'CLOSING_SOON' : s === 'SCHEDULED' ? 'SCHEDULED' : 'ENDED';

// 대회 생성 폼 검증 + payload 변환
const isContestFormValid = (name: string, start: string, end: string, seed: string) =>
  name.trim() !== '' && start !== '' && end !== '' && seed !== '';
function toContestPayload(name: string, seedMan: string, category: string) {
  return {
    title: name,
    seedMoney: (Number(seedMan) || 0) * 10000,
    stockType: category === '전체' ? undefined : category,
    profitCriteria: 'RATE', // 고정
  };
}

// 공지 게시상태 자동 판정
function resolveNoticeStatus(displayStatus: string, startDate: string, now: Date) {
  if (displayStatus === '숨김') return 'HIDDEN';
  if (displayStatus === '예약') return 'SCHEDULED';
  if (!startDate) return 'PUBLISHED';
  return new Date(startDate) > now ? 'SCHEDULED' : 'PUBLISHED';
}

// 대시보드 비정상 알림 액션 라우팅
const alertAction = (orderId?: string) => (orderId ? '주문취소' : '정지해제');

// 관리 활동 타입 매핑
function toActivityType(type: string) {
  if (type === 'SUSPEND' || type === 'MEMBER_SUSPEND') return 'SUSPEND';
  if (type === 'SEED' || type === 'SEED_PAYMENT') return 'SEED';
  if (type === 'CONTEST' || type === 'CONTEST_MANAGE') return 'CONTEST';
  if (type === 'ORDER_CANCEL') return 'ORDER_CANCEL';
  return 'CONTEST';
}

// 회원 정렬 3단 토글
function nextSort(curField: string | null, curDir: string | null, field: string) {
  if (curField !== field) return { field, dir: 'asc' };
  if (curDir === 'asc') return { field, dir: 'desc' };
  return { field: null, dir: null };
}

// 일괄 정지 버튼 활성 조건
const canBulkSuspend = (selected: number, hasSuspended: boolean) => selected > 0 && !hasSuspended;

// 정지 이력 행 클릭 → 처리유형 자동 설정
const processTypeOnRowClick = (status: string) => (status === 'SUSPENDED' ? '계정 해제' : '계정 정지');

// 감사로그 대상 표기
const TARGET_LABEL: Record<string, string> = { MEMBER: '회원', NOTICE: '공지', CONTEST: '대회' };
const formatTarget = (type: string | null, id: number | null) =>
  !type ? '' : id ? `${TARGET_LABEL[type] ?? type} #${id}` : (TARGET_LABEL[type] ?? type);

// 랭킹 현황 통계 (현재 페이지 기준)
function rankingStats(rates: number[]) {
  const avg = rates.length ? rates.reduce((s, v) => s + v, 0) / rates.length : 0;
  return { avg, profitCount: rates.filter((r) => r > 0).length, lossCount: rates.filter((r) => r < 0).length };
}

// 시드머니 만원 → 원
const seedToWon = (man: number) => man * 10000;

describe('대회 상태 매핑', () => {
  it('탭 ONGOING → API ACTIVE, ALL → undefined', () => {
    expect(toApiStatus('ONGOING')).toBe('ACTIVE');
    expect(toApiStatus('ALL')).toBeUndefined();
  });
  it('백엔드 ACTIVE/CLOSING_SOON → 화면 매핑', () => {
    expect(toUiStatus('ACTIVE')).toBe('ONGOING');
    expect(toUiStatus('CLOSING_SOON')).toBe('CLOSING_SOON');
  });
});

describe('대회 생성 폼 검증 & payload', () => {
  it('필수값 누락 시 무효', () => {
    expect(isContestFormValid('', '2026-06-01', '2026-06-30', '1000')).toBe(false);
    expect(isContestFormValid('대회', '2026-06-01', '2026-06-30', '1000')).toBe(true);
  });
  it('시드 만원→원, 종목 전체→미전송, profitCriteria=RATE 고정', () => {
    const p = toContestPayload('6월 대회', '1000', '전체');
    expect(p.seedMoney).toBe(10000000);
    expect(p.stockType).toBeUndefined();
    expect(p.profitCriteria).toBe('RATE');
  });
});

describe('공지 게시상태 자동 판정', () => {
  const now = new Date('2026-06-13T00:00:00');
  it('시작일 미래 → SCHEDULED', () => {
    expect(resolveNoticeStatus('게시', '2026-06-20', now)).toBe('SCHEDULED');
  });
  it('시작일 과거/당일 → PUBLISHED, 숨김 → HIDDEN', () => {
    expect(resolveNoticeStatus('게시', '2026-06-01', now)).toBe('PUBLISHED');
    expect(resolveNoticeStatus('숨김', '2026-06-01', now)).toBe('HIDDEN');
  });
});

describe('대시보드 비정상 알림 라우팅', () => {
  it('orderId 有 → 주문취소, 無 → 정지해제', () => {
    expect(alertAction('1001')).toBe('주문취소');
    expect(alertAction(undefined)).toBe('정지해제');
  });
  it('활동 타입 매핑', () => {
    expect(toActivityType('MEMBER_SUSPEND')).toBe('SUSPEND');
    expect(toActivityType('SEED_PAYMENT')).toBe('SEED');
  });
});

describe('회원 관리', () => {
  it('정렬 3단 토글 asc→desc→해제', () => {
    expect(nextSort(null, null, 'joinedAt')).toEqual({ field: 'joinedAt', dir: 'asc' });
    expect(nextSort('joinedAt', 'asc', 'joinedAt')).toEqual({ field: 'joinedAt', dir: 'desc' });
    expect(nextSort('joinedAt', 'desc', 'joinedAt')).toEqual({ field: null, dir: null });
  });
  it('일괄 정지: 선택 있고 정지계정 미포함일 때만 활성', () => {
    expect(canBulkSuspend(2, false)).toBe(true);
    expect(canBulkSuspend(2, true)).toBe(false);
    expect(canBulkSuspend(0, false)).toBe(false);
  });
});

describe('계정 정지 / 감사로그 / 랭킹 / 시드', () => {
  it('정지중 행 클릭 → 처리유형 계정 해제', () => {
    expect(processTypeOnRowClick('SUSPENDED')).toBe('계정 해제');
  });
  it('감사로그 대상 표기 (회원 #5)', () => {
    expect(formatTarget('MEMBER', 5)).toBe('회원 #5');
    expect(formatTarget('SYSTEM', null)).toBe('SYSTEM');
  });
  it('랭킹 현황 통계 계산', () => {
    const s = rankingStats([10, -5, 0, 20]);
    expect(s.profitCount).toBe(2);
    expect(s.lossCount).toBe(1);
    expect(s.avg).toBeCloseTo(6.25);
  });
  it('시드머니 만원→원 환산', () => {
    expect(seedToWon(100)).toBe(1000000);
  });
});
