import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PageContainer } from '../../components/common/PageContainer';
import { ContestRankingList } from '../../components/user/ContestRankingList';
import { ContestRankingSummaryCard } from '../../components/user/ContestRankingSummaryCard';
import { contestsApi } from '../../api/user/contests';
import { parseApiError } from '../../api/parseApiError';
import type { ContestRankingItem } from '../../types/contest';

const RANKING_PAGE_SIZE = 20;

const EMPTY_MY_RANKING: ContestRankingItem = {
  rank: 0,
  nickname: '나',
  profitAmount: 0,
  profitRate: 0,
};

export function ContestRankingPage() {
  const { contestId } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const [contestTitle, setContestTitle] = useState('');
  const [rankingList, setRankingList] = useState<ContestRankingItem[]>([]);
  const [myRanking, setMyRanking] = useState<ContestRankingItem>(EMPTY_MY_RANKING);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isEnded, setIsEnded] = useState(false);
  const [page, setPage] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isMyContestRanking = pathname.startsWith('/my-contests/');
  const hasMoreRanking = page + 1 < totalPages;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRanking = (r: any): ContestRankingItem => ({
    rank: r.rank ?? 0,
    nickname: r.nickname ?? '',
    profitAmount: Number(r.profitAmount ?? 0),
    profitRate: Number(r.profitRate ?? 0),
  });

  // 내 순위 응답(MyRankingResponse) → 요약 카드용 매핑
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const applyMyRanking = (mine: any) => {
    if (mine && mine.joined) {
      setMyRanking({
        rank: mine.rank ?? 0,
        nickname: mine.nickname ?? '나',
        profitAmount: Number(mine.profitAmount ?? 0),
        profitRate: Number(mine.profitRate ?? 0),
      });
    } else {
      setMyRanking(EMPTY_MY_RANKING);
    }
  };

  // 초기 로드: 대회 상세로 상태 판별 후, 마감 대회는 결과(result) / 진행 중은 랭킹(rankings)
  useEffect(() => {
    if (!contestId) return;
    const id = Number(contestId);
    setLoading(true);
    setPage(0);

    contestsApi
      .getContest(id)
      .catch(() => null)
      .then((detail) => {
        if (detail) setContestTitle(detail.title ?? '');
        const ended = detail?.status === 'ENDED';
        setIsEnded(ended);

        if (ended) {
          // 마감 대회: 결과 데이터 사용
          return contestsApi
            .getContestResult(id, { page: 0, size: RANKING_PAGE_SIZE })
            .then((result) => {
              applyMyRanking(result?.myResult);
              setRankingList((result?.rankings ?? []).map(mapRanking));
              setTotalParticipants(result?.totalParticipants ?? 0);
              const tp = result?.pagination?.totalPages;
              setTotalPages(tp && tp > 0 ? tp : 1);
              setError('');
            });
        }

        // 진행 중 대회: 기존 랭킹 데이터 사용
        return Promise.all([
          contestsApi.getMyRanking(id).catch(() => null),
          contestsApi.getRankings(id, { page: 0, size: RANKING_PAGE_SIZE }),
        ]).then(([mine, rankings]) => {
          applyMyRanking(mine);
          setRankingList((rankings.content ?? []).map(mapRanking));
          setTotalParticipants(rankings.totalElements ?? 0);
          setTotalPages(rankings.totalPages && rankings.totalPages > 0 ? rankings.totalPages : 1);
          setError('');
        });
      })
      .catch((e) => setError(parseApiError(e)))
      .finally(() => setLoading(false));
  }, [contestId]);

  // 다음 페이지 로드
  const loadMore = useCallback(async () => {
    if (!contestId || isLoadingMore || !hasMoreRanking) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const id = Number(contestId);
      const items = isEnded
        ? (await contestsApi.getContestResult(id, { page: nextPage, size: RANKING_PAGE_SIZE }))?.rankings ?? []
        : (await contestsApi.getRankings(id, { page: nextPage, size: RANKING_PAGE_SIZE }))?.content ?? [];
      setRankingList((current) => [...current, ...items.map(mapRanking)]);
      setPage(nextPage);
    } catch {
      // 다음 페이지 로드 실패는 조용히 무시
    } finally {
      setIsLoadingMore(false);
    }
  }, [contestId, isLoadingMore, hasMoreRanking, page, isEnded]);

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;
    if (!loadMoreElement || !hasMoreRanking) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: '120px 0px' },
    );
    observer.observe(loadMoreElement);
    return () => observer.disconnect();
  }, [hasMoreRanking, loadMore]);

  return (
    <PageContainer className="min-h-full bg-[#F3F7FC] pb-0 pt-3">
      {isMyContestRanking ? (
        <header className="mb-4">
          <button
            className="flex cursor-pointer items-center gap-1 text-base font-extrabold text-slate-950"
            onClick={() =>
              navigate(
                `/my-contests${searchParams.get('fromTab') === 'ENDED' ? '?tab=ENDED' : ''}`,
              )
            }
            type="button"
          >
            <span className="text-2xl leading-none text-[#1565C0]">‹</span>
            대회 랭킹
          </button>
        </header>
      ) : null}

      <section className="mb-3 rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-sm">
        <p className="text-sm font-extrabold text-slate-950">{contestTitle}</p>
      </section>

      {loading ? (
        <p className="py-10 text-center text-xs font-bold text-[#6C88A4]">불러오는 중...</p>
      ) : error ? (
        <p className="py-10 text-center text-xs font-bold text-red-500">{error}</p>
      ) : (
        <div className="space-y-4 pb-4">
          <ContestRankingSummaryCard
            myRanking={myRanking}
            totalParticipants={totalParticipants}
          />
          <ContestRankingList myRank={myRanking.rank} rankingList={rankingList} />
          {hasMoreRanking ? (
            <div ref={loadMoreRef} className="py-3 text-center">
              <p className="text-xs font-bold text-[#6C88A4]">
                {isLoadingMore ? '다음 순위를 불러오는 중...' : '아래로 스크롤하면 더 불러와요'}
              </p>
            </div>
          ) : rankingList.length > 0 ? (
            <div className="py-3 text-center">
              <p className="text-xs font-bold text-[#A3B4C6]">마지막 순위입니다.</p>
            </div>
          ) : (
            <div className="py-3 text-center">
              <p className="text-xs font-bold text-[#A3B4C6]">랭킹 정보가 없습니다.</p>
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
}
