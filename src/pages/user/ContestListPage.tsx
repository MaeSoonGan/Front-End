import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react';
import { ContestCard } from '../../components/user/ContestCard';
import { contestsApi } from '../../api/user/contests';
import { parseApiError } from '../../api/parseApiError';
import { getPaginationPages } from '../../utils/pagination';
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

const CONTEST_PAGE_SIZE = 3;

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

// 카드 영역 높이 고정을 위한 투명 placeholder 카드 (실제 카드와 동일 구조)
function createGhostContest(index: number): ContestListItem {
  return {
    id: `ghost-${index}`,
    title: ' ',
    stockType: '전체 종목',
    status: 'ENDED',
    startAt: '2024-01-01',
    endAt: '2024-01-01',
    currentParticipants: 0,
    maxParticipants: null,
    seedMoney: 0,
    isJoined: false,
    joinable: false,
    joinDisabledReason: null,
  };
}

export function ContestListPage() {
  const [contests, setContests] = useState<ContestListItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [joiningContestId, setJoiningContestId] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [activeFilter, setActiveFilter] = useState<ContestFilter>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const safePage = Math.min(currentPage, totalPages);

  const fetchContests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await contestsApi.getContests({
        keyword: appliedKeyword || undefined,
        status: activeFilter,
        page: currentPage - 1,
        size: CONTEST_PAGE_SIZE,
      });
      setContests(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data.content ?? []).map((c: any) => ({
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
        })),
      );
      setTotalPages(data.totalPages && data.totalPages > 0 ? data.totalPages : 1);
      setError('');
    } catch (e) {
      setError(parseApiError(e));
    } finally {
      setLoading(false);
    }
  }, [appliedKeyword, activeFilter, currentPage]);

  useEffect(() => {
    fetchContests();
  }, [fetchContests]);

  // 검색어 디바운스 (입력 후 300ms)
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAppliedKeyword(searchKeyword.trim());
      setCurrentPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchKeyword]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  const handleJoinContest = async (contestId: string) => {
    setJoiningContestId(contestId);
    try {
      await contestsApi.joinContest(Number(contestId));
      await fetchContests();
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
            {Array.from({ length: CONTEST_PAGE_SIZE - contests.length }).map((_, i) => (
              <div key={`ghost-${i}`} aria-hidden className="invisible">
                <ContestCard contest={createGhostContest(i)} isJoining={false} onJoin={() => {}} />
              </div>
            ))}
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

      {!loading && !error && contests.length > 0 && (
        <div className="mt-auto flex items-center justify-center gap-1 pt-5">
          <button
            className="cursor-pointer rounded p-1 text-[#6C88A4] hover:bg-blue-50 disabled:cursor-default disabled:opacity-40"
            disabled={safePage === 1}
            onClick={() => setCurrentPage(1)}
            type="button"
          >
            <ChevronsLeft size={16} />
          </button>
          <button
            className="cursor-pointer rounded p-1 text-[#6C88A4] hover:bg-blue-50 disabled:cursor-default disabled:opacity-40"
            disabled={safePage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            type="button"
          >
            <ChevronLeft size={16} />
          </button>
          {getPaginationPages(safePage, totalPages).map((page) => (
            <button
              className={`min-w-7 cursor-pointer rounded px-2 py-1 text-xs font-bold ${
                safePage === page ? 'bg-[#1565C0] text-white' : 'text-[#6C88A4] hover:bg-blue-50'
              }`}
              key={page}
              onClick={() => setCurrentPage(page)}
              type="button"
            >
              {page}
            </button>
          ))}
          <button
            className="cursor-pointer rounded p-1 text-[#6C88A4] hover:bg-blue-50 disabled:cursor-default disabled:opacity-40"
            disabled={safePage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            type="button"
          >
            <ChevronRight size={16} />
          </button>
          <button
            className="cursor-pointer rounded p-1 text-[#6C88A4] hover:bg-blue-50 disabled:cursor-default disabled:opacity-40"
            disabled={safePage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
            type="button"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
