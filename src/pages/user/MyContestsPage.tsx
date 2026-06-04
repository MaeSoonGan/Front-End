import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Modal } from '../../components/common/Modal';
import { MyContestCard } from '../../components/user/MyContestCard';
import { MyContestTabs } from '../../components/user/MyContestTabs';
import type { MyContestTab } from '../../components/user/MyContestTabs';
import { contestsApi } from '../../api/user/contests';
import { parseApiError } from '../../api/parseApiError';
import { getPaginationPages } from '../../utils/pagination';
import type { MyContestItem } from '../../types/contest';

const PAGE_SIZE = 2;

// 카드 영역 높이 고정을 위한 투명 placeholder 카드 (실제 카드와 동일 구조)
function createGhostContest(status: MyContestTab, index: number): MyContestItem {
  return {
    contestId: `ghost-${index}`,
    title: ' ',
    status,
    startAt: '2024-01-01',
    endAt: '2024-01-01',
    seedMoney: 0,
    myRank: 0,
    totalParticipants: 0,
    profitRate: 0,
    profitAmount: 0,
    currentAsset: 0,
    topRankers: [
      { rank: 1, nickname: ' ', profitRate: 0 },
      { rank: 2, nickname: ' ', profitRate: 0 },
      { rank: 3, nickname: ' ', profitRate: 0 },
    ],
  };
}

export function MyContestsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'ENDED' ? 'ENDED' : 'ACTIVE';
  const [activeTab, setActiveTab] = useState<MyContestTab>(initialTab);
  const [contests, setContests] = useState<MyContestItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [withdrawTarget, setWithdrawTarget] = useState<MyContestItem | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const safePage = Math.min(currentPage, totalPages);

  const fetchContests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await contestsApi.getMyContests({
        status: activeTab,
        page: currentPage - 1,
        size: PAGE_SIZE,
      });
      setContests(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data.content ?? []).map((c: any) => ({
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
        })),
      );
      setTotalPages(data.totalPages && data.totalPages > 0 ? data.totalPages : 1);
      setError('');
    } catch (e) {
      setError(parseApiError(e));
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage]);

  useEffect(() => {
    fetchContests();
  }, [fetchContests]);

  const handleChangeTab = (tab: MyContestTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
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
      setWithdrawTarget(null);
      // 마지막 페이지의 마지막 항목을 포기한 경우 이전 페이지로 이동
      if (contests.length === 1 && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      } else {
        await fetchContests();
      }
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
            {Array.from({ length: PAGE_SIZE - contests.length }).map((_, i) => (
              <div key={`ghost-${i}`} aria-hidden className="invisible">
                <MyContestCard contest={createGhostContest(activeTab, i)} onWithdraw={() => {}} />
              </div>
            ))}
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
