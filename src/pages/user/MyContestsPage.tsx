import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Modal } from '../../components/common/Modal';
import { MyContestCard } from '../../components/user/MyContestCard';
import { MyContestTabs } from '../../components/user/MyContestTabs';
import type { MyContestTab } from '../../components/user/MyContestTabs';
import { contestsApi } from '../../api/user/contests';
import { parseApiError } from '../../api/parseApiError';
import type { MyContestItem } from '../../types/contest';

const PAGE_SIZE = 10;

export function MyContestsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'ENDED' ? 'ENDED' : 'ACTIVE';
  const [activeTab, setActiveTab] = useState<MyContestTab>(initialTab);
  const [contests, setContests] = useState<MyContestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [withdrawTarget, setWithdrawTarget] = useState<MyContestItem | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const pageRef = useRef(0);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadContests = useCallback(
    async (reset: boolean) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      const nextPage = reset ? 0 : pageRef.current + 1;
      if (reset) setLoading(true);
      else setLoadingMore(true);
      try {
        const data = await contestsApi.getMyContests({
          status: activeTab,
          page: nextPage,
          size: PAGE_SIZE,
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items: MyContestItem[] = (data.content ?? []).map((c: any) => ({
          contestId: String(c.contestId),
          title: c.title ?? '',
          status: c.status === 'ENDED' ? 'ENDED' : 'ACTIVE',
          startAt: (c.startAt ?? '').split('T')[0],
          endAt: (c.endAt ?? '').split('T')[0],
          seedMoney: Number(c.seedMoney ?? 0),
          myRank: c.myRank ?? 0,
          totalParticipants: c.participantCount ?? 0,
          profitRate: Number(c.profitRate ?? 0),
          profitAmount: Number(c.profitAmount ?? 0),
          currentAsset: Number(c.currentAsset ?? 0),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          topRankers: (c.topRankers ?? []).map((t: any) => ({
            rank: t.rank ?? 0,
            nickname: t.nickname ?? '',
            profitRate: Number(t.profitRate ?? 0),
          })),
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
    [activeTab],
  );

  // 탭 변경 시 처음부터 다시 로드
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadContests(true);
  }, [loadContests]);

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

  const handleChangeTab = (tab: MyContestTab) => {
    setActiveTab(tab);
    const nextSearchParams = new URLSearchParams(searchParams);

    if (tab === 'ACTIVE') {
      nextSearchParams.delete('tab');
    } else {
      nextSearchParams.set('tab', tab);
    }

    setSearchParams(nextSearchParams);
  };

  const handleConfirmWithdraw = async () => {
    if (!withdrawTarget) {
      return;
    }

    setIsWithdrawing(true);
    try {
      await contestsApi.leaveContest(Number(withdrawTarget.contestId));
      // 포기한 대회는 목록에서 즉시 제거 (스크롤 위치 유지)
      setContests((prev) => prev.filter((c) => c.contestId !== withdrawTarget.contestId));
      setWithdrawTarget(null);
    } catch (e) {
      setError(parseApiError(e));
      setWithdrawTarget(null);
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col bg-[#F3F7FC] px-4 pb-6 pt-3">
      <MyContestTabs activeTab={activeTab} onChange={handleChangeTab} />

      <section className="mt-4 flex-1 space-y-3">
        {loading ? (
          <p className="py-12 text-center text-xs font-bold text-[#6C88A4]">불러오는 중...</p>
        ) : error ? (
          <p className="py-12 text-center text-xs font-bold text-red-500">{error}</p>
        ) : contests.length > 0 ? (
          <>
            {contests.map((contest) => (
              <MyContestCard
                contest={contest}
                key={contest.contestId}
                onWithdraw={setWithdrawTarget}
              />
            ))}
            {/* 무한 스크롤 감지용 sentinel */}
            <div ref={sentinelRef} aria-hidden className="h-1" />
            {loadingMore && (
              <p className="py-3 text-center text-xs font-bold text-[#6C88A4]">불러오는 중...</p>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-blue-100 bg-white px-4 py-12 text-center shadow-sm">
            <p className="text-sm font-extrabold text-slate-950">
              {activeTab === 'ACTIVE' ? '참여 중인 대회가 없어요' : '종료된 대회가 없어요'}
            </p>
            {activeTab === 'ACTIVE' ? (
              <p className="mt-1 text-xs font-bold text-[#6C88A4]">
                대회 목록에서 새로운 대회에 참가해보세요
              </p>
            ) : null}
          </div>
        )}
      </section>

      <Modal
        cancelText="취소"
        confirmText={isWithdrawing ? '처리 중' : '포기하기'}
        confirmVariant="danger"
        description={'정말 이 대회 참여를 포기하시겠습니까?\n포기 후 순위와 수익률 기록은 복구되지 않습니다.'}
        isOpen={Boolean(withdrawTarget)}
        onClose={() => {
          if (!isWithdrawing) {
            setWithdrawTarget(null);
          }
        }}
        onConfirm={isWithdrawing ? undefined : handleConfirmWithdraw}
        title="대회 포기하기"
      />
    </div>
  );
}
