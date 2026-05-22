import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageContainer } from '../../components/common/PageContainer';
import { ContestRankingList } from '../../components/user/ContestRankingList';
import { ContestRankingSummaryCard } from '../../components/user/ContestRankingSummaryCard';
import { contestRankingMocks } from '../../mocks/contestMock';

const RANKING_PAGE_SIZE = 20;

export function ContestRankingPage() {
  const { contestId } = useParams();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [visibleCount, setVisibleCount] = useState(RANKING_PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const rankingData =
    contestRankingMocks[contestId ?? ''] ?? contestRankingMocks['may-regular-2026'];
  const visibleRankingList = useMemo(
    () => rankingData.rankingList.slice(0, visibleCount),
    [rankingData.rankingList, visibleCount],
  );
  const hasMoreRanking = visibleCount < rankingData.rankingList.length;

  useEffect(() => {
    setVisibleCount(RANKING_PAGE_SIZE);
    setIsLoadingMore(false);
  }, [contestId]);

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;

    if (!loadMoreElement || !hasMoreRanking) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || isLoadingMore) {
          return;
        }

        setIsLoadingMore(true);

        window.setTimeout(() => {
          // TODO: GET /api/contests/{contestId}/ranking?page=0&size=20 연동 후 page 값을 증가시키며 호출합니다.
          setVisibleCount((currentCount) =>
            Math.min(currentCount + RANKING_PAGE_SIZE, rankingData.rankingList.length),
          );
          setIsLoadingMore(false);
        }, 350);
      },
      { rootMargin: '120px 0px' },
    );

    observer.observe(loadMoreElement);

    return () => observer.disconnect();
  }, [hasMoreRanking, isLoadingMore, rankingData.rankingList.length]);

  return (
    <PageContainer className="min-h-full bg-[#F3F7FC] pb-0 pt-3">
      <section className="mb-3 rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-sm">
        <p className="text-sm font-extrabold text-slate-950">{rankingData.contestTitle}</p>
      </section>

      <div className="space-y-4 pb-4">
        <ContestRankingSummaryCard
          myRanking={rankingData.myRanking}
          totalParticipants={rankingData.totalParticipants}
        />
        <ContestRankingList
          myRank={rankingData.myRanking.rank}
          rankingList={visibleRankingList}
        />
        {hasMoreRanking ? (
          <div ref={loadMoreRef} className="py-3 text-center">
            <p className="text-xs font-bold text-[#6C88A4]">
              {isLoadingMore ? '다음 순위를 불러오는 중...' : '아래로 스크롤하면 더 불러와요'}
            </p>
          </div>
        ) : visibleRankingList.length > 0 ? (
          <div className="py-3 text-center">
            <p className="text-xs font-bold text-[#A3B4C6]">마지막 순위입니다.</p>
          </div>
        ) : null}
      </div>

    </PageContainer>
  );
}
