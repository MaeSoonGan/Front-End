import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Modal } from '../../components/common/Modal';
import { PageContainer } from '../../components/common/PageContainer';
import { MyContestCard } from '../../components/user/MyContestCard';
import { MyContestTabs } from '../../components/user/MyContestTabs';
import type { MyContestTab } from '../../components/user/MyContestTabs';
import { myContestMocks } from '../../mocks/contestMock';
import type { MyContestItem } from '../../types/contest';

export function MyContestsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'ENDED' ? 'ENDED' : 'ACTIVE';
  const [activeTab, setActiveTab] = useState<MyContestTab>(initialTab);
  const [contests, setContests] = useState(myContestMocks);
  const [withdrawTarget, setWithdrawTarget] = useState<MyContestItem | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const filteredContests = contests.filter((contest) => contest.status === activeTab);

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

  const handleConfirmWithdraw = () => {
    if (!withdrawTarget) {
      return;
    }

    setIsWithdrawing(true);

    window.setTimeout(() => {
      // TODO: 대회 포기 API 연동 후 서버 응답 기준으로 참여 대회 목록을 갱신합니다.
      console.log('mock my contest withdraw:', withdrawTarget.contestId);
      setContests((currentContests) =>
        currentContests.filter((contest) => contest.contestId !== withdrawTarget.contestId),
      );
      setWithdrawTarget(null);
      setIsWithdrawing(false);
    }, 400);
  };

  return (
    <PageContainer className="min-h-full bg-[#F3F7FC] pt-3">
      <MyContestTabs activeTab={activeTab} onChange={handleChangeTab} />

      <section className="mt-4 space-y-3">
        {filteredContests.length > 0 ? (
          filteredContests.map((contest) => (
            <MyContestCard
              contest={contest}
              key={contest.contestId}
              onWithdraw={setWithdrawTarget}
            />
          ))
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
        description="정말 이 대회 참여를 포기하시겠습니까? 포기 후에는 현재 순위와 수익률 기록이 더 이상 반영되지 않을 수 있습니다."
        isOpen={Boolean(withdrawTarget)}
        onClose={() => {
          if (!isWithdrawing) {
            setWithdrawTarget(null);
          }
        }}
        onConfirm={isWithdrawing ? undefined : handleConfirmWithdraw}
        title="대회 포기하기"
      />
    </PageContainer>
  );
}
