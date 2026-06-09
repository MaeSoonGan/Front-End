import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { PageContainer } from '../../components/common/PageContainer';
import { useContestMode } from '../../contexts/ContestModeContext';
import { marketApi } from '../../api/user/market';
import { portfolioApi } from '../../api/user/portfolio';
import { contestsApi } from '../../api/user/contests';

interface AssetView {
  total: string;
  change: string;
  rate: string;
  cash: string;
  evaluation: string;
}

interface MarketStatusCard {
  title: string;
  value: string;
  changeRate: string;
  icon: string;
}

interface RankingStock {
  name: string;
  code: string;
  price: string;
  changeRate: string;
}

interface MyContestView {
  id: string;
  title: string;
  rank: number;
  participants: number;
  myAsset: string;
  endDate: string;
}

interface ContestHomeView {
  title: string;
  total: string;
  change: string;
  rate: string;
  rank: number;
  participants: number;
}

const EMPTY_ASSET: AssetView = {
  total: '-',
  change: '-',
  rate: '-',
  cash: '-',
  evaluation: '-',
};

function getChangeClass(changeRate: string) {
  if (changeRate.startsWith('-')) {
    return 'text-blue-600';
  }

  if (changeRate.startsWith('+')) {
    return 'text-red-500';
  }

  return 'text-emerald-600';
}

function formatWon(value: number) {
  return `${Math.round(value).toLocaleString('ko-KR')}원`;
}

function formatSignedWon(value: number) {
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  return `${sign}${Math.abs(Math.round(value)).toLocaleString('ko-KR')}원`;
}

function formatSignedRate(value: number) {
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  return `${sign}${Math.abs(value).toFixed(2)}%`;
}

function formatIndexValue(value: number) {
  return value.toLocaleString('ko-KR', { maximumFractionDigits: 2 });
}

function formatPrice(value: number) {
  return Math.round(value).toLocaleString('ko-KR');
}

// 백엔드 지수 응답 → 카드 표시용
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toIndexCard(title: string, icon: string, data: any): MarketStatusCard {
  if (!data) {
    return { title, value: '-', changeRate: '', icon };
  }

  return {
    title,
    value: formatIndexValue(Number(data.value ?? 0)),
    changeRate: formatSignedRate(Number(data.changeRate ?? 0)),
    icon,
  };
}

// 백엔드 장 상태 응답 → 카드 표시용
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toStatusCard(data: any): MarketStatusCard {
  const isOpen = data?.status === 'open';

  return {
    title: '장 상태',
    value: data ? (isOpen ? '운영중' : '장마감') : '-',
    changeRate: data?.closeTime ? `~${data.closeTime}` : '',
    icon: '⏱️',
  };
}

// 종료일(endAt) → D-day 표시
function toDDay(endAt: string | null | undefined) {
  if (!endAt) {
    return '';
  }

  const end = new Date(`${endAt.split('T')[0]}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((end.getTime() - today.getTime()) / 86_400_000);

  if (diffDays > 0) {
    return `D-${diffDays}`;
  }

  if (diffDays === 0) {
    return 'D-DAY';
  }

  return '종료';
}

export function HomePage() {
  const navigate = useNavigate();
  const { contestId, getContestPath, isContestMode } = useContestMode();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const [summaryAsset, setSummaryAsset] = useState<AssetView | null>(null);
  const [marketStatus, setMarketStatus] = useState<MarketStatusCard[]>([]);
  const [rankingStocks, setRankingStocks] = useState<RankingStock[]>([]);
  const [myContest, setMyContest] = useState<MyContestView | null>(null);
  const [contestView, setContestView] = useState<ContestHomeView | null>(null);
  const [loading, setLoading] = useState(true);

  const getPath = (path: string) => (isContestMode ? getContestPath(path) : path);
  const normalAsset = summaryAsset ?? EMPTY_ASSET;
  const contestTitle = contestView?.title ?? '참여 대회';

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // 시장 지수 + 장 상태 (일반/대회 공통)
    const marketTask = Promise.all([
      marketApi.getIndex('KOSPI').catch(() => null),
      marketApi.getIndex('KOSDAQ').catch(() => null),
      marketApi.getStatus().catch(() => null),
    ]).then(([kospi, kosdaq, status]) => {
      if (cancelled) return;
      setMarketStatus([
        toIndexCard('KOSPI', '📊', kospi),
        toIndexCard('KOSDAQ', '📉', kosdaq),
        toStatusCard(status),
      ]);
    });

    // 실시간 순위 (공통)
    const rankingTask = marketApi
      .getRanking()
      .then((items) => {
        if (cancelled) return;
        setRankingStocks(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (items ?? []).slice(0, 5).map((it: any) => ({
            name: it.name ?? '',
            code: it.code ?? '',
            price: formatPrice(Number(it.price ?? 0)),
            changeRate: formatSignedRate(Number(it.changeRate ?? 0)),
          })),
        );
      })
      .catch(() => {
        if (!cancelled) setRankingStocks([]);
      });

    const tasks: Promise<unknown>[] = [marketTask, rankingTask];

    if (isContestMode && contestId) {
      // 대회 모드: 대회 상세로 내 총자산/순위/제목 (contest-service)
      const detailTask = contestsApi
        .getContest(Number(contestId))
        .then((d) => {
          if (cancelled || !d) return;
          const year = (d.startAt ?? '').slice(0, 4);
          const title = d.title ?? '참여 대회';
          setContestView({
            title: year ? `${year}년 ${title}` : title,
            total: formatWon(Number(d.myTotalAsset ?? 0)),
            change: formatSignedWon(Number(d.myProfitAmount ?? 0)),
            rate: formatSignedRate(Number(d.myProfitRate ?? 0)),
            rank: Number(d.myRank ?? 0),
            participants: Number(d.participantCount ?? 0),
          });
        })
        .catch(() => {});

      tasks.push(detailTask);
    } else {
      const summaryTask = portfolioApi
        .getSummary()
        .then((s) => {
          if (cancelled || !s) return;
          setSummaryAsset({
            total: formatWon(Number(s.totalAsset ?? 0)),
            change: formatSignedWon(Number(s.profitAmount ?? 0)),
            rate: formatSignedRate(Number(s.profitRate ?? 0)),
            cash: formatWon(Number(s.cashBalance ?? 0)),
            evaluation: formatWon(Number(s.stockValuation ?? 0)),
          });
        })
        .catch(() => {});

      const myContestTask = contestsApi
        .getMyContests({ status: 'ACTIVE', page: 0, size: 1 })
        .then((data) => {
          if (cancelled) return;
          const first = (data?.content ?? [])[0];
          if (!first) {
            setMyContest(null);
            return;
          }
          setMyContest({
            id: String(first.contestId),
            title: first.title ?? '',
            rank: Number(first.myRank ?? 0),
            participants: Number(first.totalParticipants ?? 0),
            myAsset: formatWon(Number(first.currentAsset ?? 0)),
            endDate: toDDay(first.endAt),
          });
        })
        .catch(() => {
          if (!cancelled) setMyContest(null);
        });

      tasks.push(summaryTask, myContestTask);
    }

    Promise.all(tasks).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [isContestMode, contestId]);

  const handleWithdrawContest = async () => {
    if (!contestId) {
      return;
    }

    setIsWithdrawing(true);
    try {
      await contestsApi.leaveContest(Number(contestId));
      setIsWithdrawModalOpen(false);
      navigate('/contests', { replace: true });
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <PageContainer>
      <button
        className="w-full rounded-2xl bg-gradient-to-br from-[#1565C0] to-[#4F8ED9] p-5 text-left text-white shadow-sm transition hover:shadow-md"
        onClick={() => navigate(getPath('/balance'))}
        type="button"
      >
        <div className={isContestMode ? 'flex items-start justify-between gap-4' : undefined}>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-blue-100">내 총 자산</p>
            <p className="mt-2 text-2xl font-extrabold">
              {isContestMode ? (contestView?.total ?? '-') : normalAsset.total}
            </p>
            <p className="mt-1 text-xs text-blue-100">
              {isContestMode ? contestTitle : `${normalAsset.change} (${normalAsset.rate})`}
            </p>
          </div>
          {isContestMode ? (
            <div className="shrink-0 rounded-2xl bg-white/15 px-4 py-3 text-right">
              <p className="text-[11px] font-bold text-blue-100">현재 순위</p>
              <p className="mt-1 text-2xl font-extrabold leading-none">
                {contestView ? `${contestView.rank}위` : '-'}
                {contestView ? (
                  <span className="ml-1 text-sm font-bold text-blue-100">
                    / {contestView.participants}명
                  </span>
                ) : null}
              </p>
            </div>
          ) : null}
        </div>
        {!isContestMode ? (
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/15 p-3">
              <p className="text-xs text-blue-100">예수금</p>
              <p className="mt-1 text-sm font-bold">{normalAsset.cash}</p>
            </div>
            <div className="rounded-xl bg-white/15 p-3">
              <p className="text-xs text-blue-100">주식평가</p>
              <p className="mt-1 text-sm font-bold">{normalAsset.evaluation}</p>
            </div>
          </div>
        ) : null}
      </button>

      <section className="mt-4 grid grid-cols-3 gap-3">
        {marketStatus.map((status) => (
          <div
            className="rounded-xl border border-blue-100 bg-white px-3 py-4 text-center shadow-sm"
            key={status.title}
          >
            <div className="mx-auto flex h-6 w-6 items-center justify-center text-base">
              {status.icon}
            </div>
            <p className="mt-2 text-xs font-bold text-[#6C88A4]">{status.title}</p>
            <p className="mt-1 text-lg font-extrabold leading-5 text-slate-950">
              {status.value}
            </p>
            <p className={`mt-1 text-xs font-bold ${getChangeClass(status.changeRate)}`}>
              {status.changeRate}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-5">
        <h2 className="mb-3 text-base font-extrabold text-slate-950">실시간 순위</h2>
        {loading && rankingStocks.length === 0 ? (
          <p className="py-6 text-center text-xs font-bold text-[#6C88A4]">불러오는 중...</p>
        ) : rankingStocks.length === 0 ? (
          <p className="py-6 text-center text-xs font-bold text-[#A3B4C6]">순위 정보가 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {rankingStocks.map((stock) => (
              <button
                className="flex w-full items-center justify-between rounded-xl border border-blue-100 bg-white px-4 py-3 text-left shadow-sm transition hover:border-blue-200 hover:bg-[#F8FBFF]"
                key={stock.code}
                onClick={() => navigate(`${getPath('/market')}?stockCode=${stock.code}`)}
                type="button"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E5F4FF] text-xs font-bold text-[#1565C0]">
                    {stock.name.slice(0, 1)}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-950">{stock.name}</p>
                    <p className="text-xs text-[#A3B4C6]">{stock.code}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-950">{stock.price}</p>
                  <p className={`text-xs font-bold ${getChangeClass(stock.changeRate)}`}>
                    {stock.changeRate}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {!isContestMode && myContest ? (
        <section className="mt-5">
          <h2 className="mb-3 text-base font-extrabold text-slate-950">참여 중인 대회</h2>
          <button
            className="w-full rounded-2xl border border-blue-100 bg-white p-4 text-left shadow-sm transition hover:border-blue-200 hover:bg-[#F8FBFF]"
            onClick={() => navigate(`/contests/${myContest.id}/home`)}
            type="button"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-[#1565C0]">참여 중</p>
                <p className="mt-1 text-base font-extrabold text-slate-950">{myContest.title}</p>
              </div>
              {myContest.endDate ? (
                <span className="rounded-full bg-[#E5F4FF] px-3 py-1 text-xs font-bold text-[#1565C0]">
                  {myContest.endDate}
                </span>
              ) : null}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#F0F6FF] p-3">
                <p className="text-xs text-[#6C88A4]">내 자산</p>
                <p className="mt-1 text-sm font-bold text-slate-950">{myContest.myAsset}</p>
              </div>
              <div className="rounded-xl bg-[#F0F6FF] p-3">
                <p className="text-xs text-[#6C88A4]">대회 순위</p>
                <p className="mt-1 text-sm font-bold text-[#1565C0]">
                  {myContest.rank}위
                  <span className="ml-1 text-xs font-medium text-[#6C88A4]">
                    / {myContest.participants}명
                  </span>
                </p>
              </div>
            </div>
          </button>
        </section>
      ) : null}

      {isContestMode ? (
        <section className="mt-5">
          <h2 className="mb-3 text-base font-extrabold text-slate-950">대회 관리</h2>
          <Button
            className="h-12 w-full rounded-xl bg-red-500 text-sm font-extrabold text-white shadow-sm hover:bg-red-600"
            onClick={() => setIsWithdrawModalOpen(true)}
            variant="danger"
          >
            대회 포기하기
          </Button>
        </section>
      ) : null}

      <Modal
        cancelText="계속 참여"
        confirmText={isWithdrawing ? '처리 중...' : '대회 포기'}
        confirmVariant="danger"
        description="대회를 포기하면 현재 순위와 거래 기록은 더 이상 대회 랭킹에 반영되지 않습니다. 일반 화면으로 이동만 하려면 하단의 나가기를 사용해 주세요."
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        onConfirm={handleWithdrawContest}
        title="대회를 포기할까요?"
      />
    </PageContainer>
  );
}
