import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { PageContainer } from '../../components/common/PageContainer';
import { ContestCard } from '../../components/user/ContestCard';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { contestMocks, loadContestPage } from '../../mocks/contestMock';
import type { ContestStatus } from '../../types/contest';
import { cn } from '../../utils/cn';

type ContestFilter = 'ALL' | ContestStatus;

const CONTEST_FILTER_OPTIONS: Array<{ label: string; value: ContestFilter }> = [
  { label: '전체', value: 'ALL' },
  { label: '진행중', value: 'ACTIVE' },
  { label: '예정', value: 'SCHEDULED' },
  { label: '마감', value: 'ENDED' },
];

const CONTEST_PAGE_SIZE = 4;

export function ContestListPage() {
  const [contests, setContests] = useState(contestMocks);
  const [joiningContestId, setJoiningContestId] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeFilter, setActiveFilter] = useState<ContestFilter>('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreElement, setLoadMoreElement] = useState<HTMLDivElement | null>(null);

  const filteredContests = useMemo(() => contests.filter((contest) => {
    const keyword = searchKeyword.trim().toLowerCase();
    const isMatchedFilter = activeFilter === 'ALL' || contest.status === activeFilter;

    if (!isMatchedFilter) {
      return false;
    }

    if (!keyword) {
      return true;
    }

    const contestYear = contest.startAt.slice(0, 4);

    return (
      contest.title.toLowerCase().includes(keyword) ||
      contest.stockType.toLowerCase().includes(keyword) ||
      contestYear.includes(keyword)
    );
  }), [activeFilter, contests, searchKeyword]);
  const visibleContests = useMemo(
    () =>
      Array.from({ length: currentPage + 1 }).flatMap((_, page) =>
        loadContestPage(page, CONTEST_PAGE_SIZE, filteredContests),
      ),
    [currentPage, filteredContests],
  );
  const hasMore = visibleContests.length < filteredContests.length;

  const handleLoadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    window.setTimeout(() => {
      setCurrentPage((page) => page + 1);
      setIsLoadingMore(false);
    }, 350);
  }, [hasMore, isLoadingMore]);

  useInfiniteScroll({
    hasMore,
    isLoading: isLoadingMore,
    onLoadMore: handleLoadMore,
    target: loadMoreElement,
  });

  useEffect(() => {
    setCurrentPage(0);
    setIsLoadingMore(false);
  }, [activeFilter, searchKeyword]);

  const handleJoinContest = (contestId: string) => {
    setJoiningContestId(contestId);
    console.log('mock contest join:', contestId);

    window.setTimeout(() => {
      // TODO: 실제 참가 API 연동 후 서버 응답 기준으로 참가 상태와 참가자 수를 갱신합니다.
      setContests((currentContests) =>
        currentContests.map((contest) =>
          contest.id === contestId
            ? {
                ...contest,
                currentParticipants: contest.currentParticipants + 1,
                isJoined: true,
              }
            : contest,
        ),
      );
      setJoiningContestId(null);
    }, 500);
  };

  return (
    <PageContainer className="min-h-full bg-[#F3F7FC] pt-3">
      {/* TODO: 상태 판단은 startAt/endAt 기준 서버 처리 값으로 내려받아 사용합니다. */}
      {/* TODO: 실제 참가자 수 API 연동 후 mock data를 제거합니다. */}
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

      <section className="space-y-3">
        {filteredContests.length > 0 ? (
          visibleContests.map((contest) => (
            <ContestCard
              contest={contest}
              isJoining={joiningContestId === contest.id}
              key={contest.id}
              onJoin={handleJoinContest}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-blue-100 bg-white px-4 py-10 text-center shadow-sm">
            <p className="text-sm font-extrabold text-slate-950">검색 결과가 없습니다.</p>
            <p className="mt-1 text-xs font-bold text-[#6C88A4]">
              다른 대회명이나 종목으로 다시 검색해 주세요.
            </p>
          </div>
        )}
      </section>

      {filteredContests.length > 0 ? (
        <div ref={setLoadMoreElement} className="py-5 text-center">
          {isLoadingMore ? (
            <p className="text-xs font-bold text-[#6C88A4]">대회를 불러오는 중...</p>
          ) : hasMore ? (
            <p className="text-xs font-bold text-[#6C88A4]">아래로 스크롤하면 더 불러와요</p>
          ) : (
            <p className="text-xs font-bold text-[#A3B4C6]">
              더 이상 불러올 대회가 없어요
            </p>
          )}
        </div>
      ) : null}
    </PageContainer>
  );
}
