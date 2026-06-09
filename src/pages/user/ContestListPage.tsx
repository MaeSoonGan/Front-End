import { useCallback, useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { ContestCard } from '../../components/user/ContestCard';
import { contestsApi } from '../../api/user/contests';
import { parseApiError } from '../../api/parseApiError';
import type { ContestListItem, ContestStatus, ContestStockType } from '../../types/contest';
import { cn } from '../../utils/cn';

// 프론트 필터(예정 포함) → 백엔드 status 파라미터. SCHEDULED는 ACTIVE 계열로 함께 조회 후 클라이언트에서 구분 표시.
type ContestFilter = 'ALL' | ContestStatus;

const CONTEST_FILTER_OPTIONS: Array<{ label: string; value: ContestFilter }> = [
  { label: '전체', value: 'ALL' },
  { label: '진행중', value: 'ACTIVE' },
  { label: '예정', value: 'SCHEDULED' },
  { label: '마감', value: 'ENDED' },
];

const CONTEST_PAGE_SIZE = 10;

// 백엔드 status → 프론트 ContestStatus 매핑 (CLOSING_SOON은 진행중으로 표시)
function toContestStatus(status: string): ContestStatus {
  if (status === 'ENDED') return 'ENDED';
  if (status === 'SCHEDULED') return 'SCHEDULED';
  return 'ACTIVE'; // ACTIVE, CLOSING_SOON
}

// 백엔드 stockType → 표시용. 'ALL'/빈값은 '전체 종목', 그 외는 값 그대로 표시
function toStockType(stockType: string | null | undefined): ContestStockType {
  if (!stockType || stockType === 'ALL') return '전체 종목';
  return stockType as ContestStockType;
}

export function ContestListPage() {
  const [contests, setContests] = useState<ContestListItem[]>([]);
  const [joiningContestId, setJoiningContestId] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [activeFilter, setActiveFilter] = useState<ContestFilter>('ALL');
  const [loading, setLoading] = useState(true); // 초기/필터 변경 로딩
  const [loadingMore, setLoadingMore] = useState(false); // 다음 페이지 로딩
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(false);

  const pageRef = useRef(0); // 마지막으로 불러온 페이지(0-based)
  const loadingRef = useRef(false); // 중복 요청 방지
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadContests = useCallback(
    async (reset: boolean) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      const nextPage = reset ? 0 : pageRef.current + 1;
      if (reset) setLoading(true);
      else setLoadingMore(true);
      try {
        const data = await contestsApi.getContests({
          keyword: appliedKeyword || undefined,
          status: activeFilter,
          page: nextPage,
          size: CONTEST_PAGE_SIZE,
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items: ContestListItem[] = (data.content ?? []).map((c: any) => ({
          id: String(c.contestId),
          title: c.title ?? '',
          stockType: toStockType(c.stockType),
          status: toContestStatus(c.status),
          startAt: (c.startAt ?? '').split('T')[0],
          endAt: (c.endAt ?? '').split('T')[0],
          currentParticipants: c.participantCount ?? 0,
          maxParticipants: c.maxParticipants ?? null,
          seedMoney: Number(c.seedMoney ?? 0),
          isJoined: Boolean(c.joined),
          joinable: Boolean(c.joinable),
          joinDisabledReason: c.joinDisabledReason ?? null,
        }));
        pageRef.current = nextPage;
        setContests((prev) => (reset ? items : [...prev, ...items]));
        const totalPages = data.totalPages && data.totalPages > 0 ? data.totalPages : 1;
        setHasMore(nextPage + 1 < totalPages);
        setError('');
      } catch (e) {
        setError(parseApiError(e));
      } finally {
        if (reset) setLoading(false);
        else setLoadingMore(false);
        loadingRef.current = false;
      }
    },
    [appliedKeyword, activeFilter],
  );

  // 필터/검색어 변경 시 처음부터 다시 로드
  useEffect(() => {
    // 의도된 초기/리셋 로드(내부에서 로딩 상태 set) — 룰 예외
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadContests(true);
  }, [loadContests]);

  // 검색어 디바운스 (입력 후 300ms)
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAppliedKeyword(searchKeyword.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchKeyword]);

  // 무한 스크롤: 하단 sentinel이 보이면 다음 페이지 로드
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          loadContests(false);
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadContests]);

  const handleJoinContest = async (contestId: string) => {
    setJoiningContestId(contestId);
    try {
      await contestsApi.joinContest(Number(contestId));
      // 참가 성공 시 해당 카드만 즉시 갱신(스크롤 위치 유지)
      setContests((prev) =>
        prev.map((c) =>
          c.id === contestId
            ? { ...c, isJoined: true, joinable: false, currentParticipants: c.currentParticipants + 1 }
            : c,
        ),
      );
    } catch (e) {
      setError(parseApiError(e));
    } finally {
      setJoiningContestId(null);
    }
  };

  return (
    <div className="flex min-h-full flex-col bg-[#F3F7FC] px-4 pb-6 pt-3">
      <section className="mb-4 space-y-3">
        <div className="flex h-11 items-center gap-2 rounded-2xl border border-blue-100 bg-white px-3 shadow-sm">
          <Search className="shrink-0 text-[#6C88A4]" size={17} strokeWidth={2.5} />
          <input
            className="min-w-0 flex-1 bg-transparent text-sm font-bold text-slate-950 outline-none placeholder:text-[#A3B4C6]"
            onChange={(event) => setSearchKeyword(event.target.value)}
            placeholder="대회명 또는 종목 검색"
            value={searchKeyword}
          />
        </div>

        <div className="grid grid-cols-4 gap-2 rounded-2xl bg-[#E8F0FA] p-1">
          {CONTEST_FILTER_OPTIONS.map((option) => (
            <button
              className={cn(
                'h-9 rounded-xl text-xs font-extrabold transition',
                activeFilter === option.value
                  ? 'bg-white text-[#1565C0] shadow-sm'
                  : 'text-[#6C88A4] hover:bg-white/60',
              )}
              key={option.value}
              onClick={() => setActiveFilter(option.value)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="flex-1 space-y-3">
        {loading ? (
          <p className="py-10 text-center text-xs font-bold text-[#6C88A4]">불러오는 중...</p>
        ) : error ? (
          <p className="py-10 text-center text-xs font-bold text-red-500">{error}</p>
        ) : contests.length > 0 ? (
          <>
            {contests.map((contest) => (
              <ContestCard
                contest={contest}
                isJoining={joiningContestId === contest.id}
                key={contest.id}
                onJoin={handleJoinContest}
              />
            ))}
            {/* 무한 스크롤 감지용 sentinel */}
            <div ref={sentinelRef} aria-hidden className="h-1" />
            {loadingMore && (
              <p className="py-3 text-center text-xs font-bold text-[#6C88A4]">불러오는 중...</p>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-blue-100 bg-white px-4 py-10 text-center shadow-sm">
            <p className="text-sm font-extrabold text-slate-950">검색 결과가 없습니다.</p>
            <p className="mt-1 text-xs font-bold text-[#6C88A4]">
              다른 대회명이나 종목으로 다시 검색해 주세요.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
