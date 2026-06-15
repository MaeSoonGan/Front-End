import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { PageContainer } from '../../components/common/PageContainer';
import { useContestMode } from '../../contexts/ContestModeContext';
import { marketApi } from '../../api/user/market';
import { portfolioApi } from '../../api/user/portfolio';
import { contestsApi } from '../../api/user/contests';
import { useMarketSocket } from '../../hooks/useMarketSocket';
import { useLiveContestRank } from '../../hooks/useLiveContestRank';
import { cn } from '../../utils/cn';

interface AssetView {
  total: string;
  change: string;
  rate: string;
  cash: string;
  evaluation: string;
  available: string;
}

interface MarketStatusCard {
  title: string;
  value: string;
  changeRate: string;
  icon: string;
}

interface RankingStock {
  rank: number;
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
  period: string;
  badge: string;
  statusLabel: string;
  notStarted: boolean;
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
  available: '-',
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
function isContestEnded(endAt: string | null | undefined) {
  if (!endAt) {
    return false;
  }
  const end = new Date(`${endAt.split('T')[0]}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // 종료일이 오늘보다 이전이면 종료된 대회
  return end.getTime() < today.getTime();
}

function daysFromToday(dateStr: string | null | undefined) {
  if (!dateStr) {
    return null;
  }
  const target = new Date(`${dateStr.split('T')[0]}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
}

// 대회 기간 표기: "2026.06.07 ~ 2026.06.29"
function formatPeriod(startAt: string | null | undefined, endAt: string | null | undefined) {
  const ymd = (s: string | null | undefined) => (s ? s.split('T')[0].replace(/-/g, '.') : '');
  const start = ymd(startAt);
  const end = ymd(endAt);
  if (!start && !end) {
    return '';
  }
  return `${start} ~ ${end}`;
}

// 시작 전이면 "시작까지", 진행 중이면 "종료까지" 남은 일수를 표기
function toContestBadge(
  status: string | null | undefined,
  startAt: string | null | undefined,
  endAt: string | null | undefined,
): { badge: string; statusLabel: string; notStarted: boolean } {
  const notStarted = status === 'SCHEDULED';

  if (notStarted) {
    const d = daysFromToday(startAt) ?? 0;
    return {
      badge: d > 0 ? `시작까지 ${d}일` : '오늘 시작',
      statusLabel: '시작 예정',
      notStarted: true,
    };
  }

  const daysToEnd = daysFromToday(endAt);
  let badge = '';
  if (daysToEnd !== null) {
    badge = daysToEnd > 0 ? `종료까지 ${daysToEnd}일` : daysToEnd === 0 ? '오늘 종료' : '종료';
  }
  return { badge, statusLabel: '진행 중', notStarted: false };
}

export function HomePage() {
  const navigate = useNavigate();
  const { contestId, getContestPath, isContestMode } = useContestMode();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const [summaryAsset, setSummaryAsset] = useState<AssetView | null>(null);
  const [summaryRaw, setSummaryRaw] = useState<{ cash: number; seed: number; available: number } | null>(null);
  const [assetHoldings, setAssetHoldings] = useState<{ code: string; quantity: number; price: number }[]>([]);
  const [assetHoldingsLoaded, setAssetHoldingsLoaded] = useState(false);
  const [marketStatus, setMarketStatus] = useState<MarketStatusCard[]>([]);
  const [rankingStocks, setRankingStocks] = useState<RankingStock[]>([]);
  const [myContests, setMyContests] = useState<MyContestView[]>([]);
  const [contestView, setContestView] = useState<ContestHomeView | null>(null);
  const [loading, setLoading] = useState(true);

  const getPath = (path: string) => (isContestMode ? getContestPath(path) : path);
  const contestTitle = contestView?.title ?? '참여 대회';

  // 보유 종목 현재가만 ws 구독. 순위·지수는 REST 폴링이라 KIS 등록 한도를 쓰지 않음.
  const { prices: livePrices } = useMarketSocket(assetHoldings.map((h) => h.code));

  // 보유 종목 live 평가금액 → 총자산/수익 동적 계산 (예수금 + Σ(live가 × 수량))
  const liveEvaluation = assetHoldings.reduce(
    (sum, h) => sum + (livePrices[h.code]?.currentPrice || h.price) * h.quantity,
    0,
  );
  const normalAsset: AssetView =
    summaryRaw && assetHoldingsLoaded
      ? {
          total: formatWon(summaryRaw.cash + liveEvaluation),
          change: formatSignedWon(summaryRaw.cash + liveEvaluation - summaryRaw.seed),
          rate: formatSignedRate(
            summaryRaw.seed > 0
              ? ((summaryRaw.cash + liveEvaluation - summaryRaw.seed) / summaryRaw.seed) * 100
              : 0,
          ),
          cash: formatWon(summaryRaw.cash),
          evaluation: formatWon(liveEvaluation),
          available: formatWon(summaryRaw.available),
        }
      : summaryAsset ?? EMPTY_ASSET;

  // 일반 모드 총자산 증감(부호) — 수익률 화살표 방향 결정용
  const normalChange =
    summaryRaw && assetHoldingsLoaded
      ? summaryRaw.cash + liveEvaluation - summaryRaw.seed
      : 0;

  // 대회 모드: 내 live 수익률로 실시간 순위 계산 (다른 참여자는 mock 고정)
  const liveContestProfitRate =
    isContestMode && summaryRaw && assetHoldingsLoaded && summaryRaw.seed > 0
      ? ((summaryRaw.cash + liveEvaluation - summaryRaw.seed) / summaryRaw.seed) * 100
      : null;
  const { rank: liveRank, totalParticipants: liveTotalParticipants } = useLiveContestRank(
    isContestMode && contestId ? Number(contestId) : null,
    liveContestProfitRate,
  );

  // 실시간 조회상위 순위 (market-realtime-service API) — 상위 3종목, 15초 폴링
  useEffect(() => {
    let cancelled = false;
    const fetchRanking = () => {
      marketApi
        .getHtsTopViewRanking()
        .then((res) => {
          if (cancelled) return;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const items: any[] = res?.items ?? [];
          setRankingStocks(
            items.slice(0, 5).map((it, idx) => ({
              rank: Number(it.rank ?? idx + 1),
              name: it.stockName ?? '',
              code: it.stockCode ?? '',
              price: formatPrice(Number(it.currentPrice ?? 0)),
              changeRate: formatSignedRate(Number(it.changeRate ?? 0)),
            })),
          );
        })
        .catch(() => {
          // 폴링 실패(캐시 없음 등)는 기존 값 유지
        });
    };
    fetchRanking();
    const timer = window.setInterval(fetchRanking, 15000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  // 코스피/코스닥 지수 + 장 상태 (REST 폴링, 15초) — ws 미사용
  useEffect(() => {
    let cancelled = false;
    const fetchStatus = () => {
      Promise.all([
        marketApi.getRealtimeIndices().catch(() => []),
        marketApi.getStatus().catch(() => null),
      ]).then(([indices, status]) => {
        if (cancelled) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const list: any[] = Array.isArray(indices) ? indices : [];
        const find = (market: string) => list.find((i) => i.market === market);
        setMarketStatus([
          toIndexCard('KOSPI', '📊', find('KOSPI')),
          toIndexCard('KOSDAQ', '📉', find('KOSDAQ')),
          toStatusCard(status),
        ]);
      });
    };
    fetchStatus();
    const timer = window.setInterval(fetchStatus, 15000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  // 관심종목 상태 (하트 토글)
  const [watchset, setWatchset] = useState<Set<string>>(new Set());
  const watchContestId = isContestMode && contestId ? Number(contestId) : 0;
  useEffect(() => {
    marketApi
      .getWatchlist('domestic', watchContestId)
      .then((data) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const codes = (data?.items ?? data?.stocks ?? []).map((i: any) => i.code ?? i.stockCode);
        setWatchset(new Set(codes.filter(Boolean)));
      })
      .catch(() => {});
  }, [watchContestId]);

  const toggleWatch = async (code: string) => {
    const has = watchset.has(code);
    setWatchset((prev) => {
      const next = new Set(prev);
      if (has) next.delete(code);
      else next.add(code);
      return next;
    });
    try {
      if (has) await marketApi.deleteWatchlist(code, watchContestId);
      else await marketApi.addWatchlist(code, watchContestId);
    } catch {
      setWatchset((prev) => {
        const next = new Set(prev);
        if (has) next.add(code);
        else next.delete(code);
        return next;
      });
    }
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // 시장 지수 + 장 상태 + 실시간 순위는 별도 폴링 effect에서 처리(아래)
    const tasks: Promise<unknown>[] = [];

    if (isContestMode && contestId) {
      const cid = Number(contestId);
      // 대회 상세: 순위/제목/참여자 (총자산은 아래 계좌+보유종목으로 live 계산)
      const detailTask = contestsApi
        .getContest(cid)
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

      // 대회 계좌(예수금/시드) — 총자산 live 계산용 (잔고 페이지와 동일 기준)
      const accountTask = portfolioApi
        .getContestAccount(cid)
        .then((s) => {
          if (cancelled || !s) return;
          const total = Number(s.currentAsset ?? 0);
          const profit = Number(s.profitAmount ?? 0);
          setSummaryRaw({ cash: Number(s.cashBalance ?? 0), seed: total - profit, available: Number(s.availableBalance ?? 0) });
        })
        .catch(() => {});

      // 대회 보유 종목 — 총자산 live 계산 + ws 구독
      const holdingsTask = portfolioApi
        .getHoldings(cid)
        .then((items) => {
          if (cancelled) return;
          setAssetHoldings(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ((items as any[]) ?? [])
              .map((h) => ({
                code: h.stockCode ?? '',
                quantity: Number(h.quantity ?? 0),
                price: Number(h.currentPrice ?? 0),
              }))
              .filter((h) => h.code),
          );
          setAssetHoldingsLoaded(true);
        })
        .catch(() => {
          if (!cancelled) setAssetHoldingsLoaded(true);
        });

      tasks.push(detailTask, accountTask, holdingsTask);
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
            available: formatWon(Number(s.availableBalance ?? 0)),
          });
          // 총자산 live 계산용 원시값 (시드 = 총자산 - 수익)
          setSummaryRaw({
            cash: Number(s.cashBalance ?? 0),
            seed: Number(s.totalAsset ?? 0) - Number(s.profitAmount ?? 0),
            available: Number(s.availableBalance ?? 0),
          });
        })
        .catch(() => {});

      // 보유 종목 (총자산 live 계산용)
      const assetHoldingsTask = portfolioApi
        .getHoldings()
        .then((items) => {
          if (cancelled) return;
          setAssetHoldings(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ((items as any[]) ?? [])
              .map((h) => ({
                code: h.stockCode ?? '',
                quantity: Number(h.quantity ?? 0),
                price: Number(h.currentPrice ?? 0),
              }))
              .filter((h) => h.code),
          );
          setAssetHoldingsLoaded(true);
        })
        .catch(() => {
          if (!cancelled) setAssetHoldingsLoaded(true);
        });

      const myContestTask = contestsApi
        .getMyContests({ status: 'ACTIVE', page: 0, size: 50 })
        .then(async (data) => {
          if (cancelled) return;
          // 홈 "참여 중" 목록에는 실제 진행 중 대회만 표시.
          // 대회 상태(c.status)를 신뢰: SCHEDULED(시작 예정)·ENDED(종료) 제외.
          // status가 갱신 안 된 채 종료일만 지난 경우도 대비해 endAt도 함께 확인.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const list = ((data?.content ?? []) as any[]).filter((c: any) => {
            if (c.status === 'ENDED' || isContestEnded(c.endAt)) {
              return false;
            }
            if (c.status === 'SCHEDULED') {
              return false;
            }
            return true;
          });

          const enrichedList = await Promise.all(
            list.map(async (c: any) => {
              const contestId = Number(c.contestId ?? c.id);
              const [detail, account, myRanking] = await Promise.all([
                contestsApi.getContest(contestId).catch(() => null),
                portfolioApi.getContestAccount(contestId).catch(() => null),
                contestsApi.getMyRanking(contestId).catch(() => null),
              ]);
              const { badge, statusLabel, notStarted } = toContestBadge(c.status, c.startAt, c.endAt);
              const rank = Number(myRanking?.rank ?? detail?.myRank ?? c.myRank ?? 0);
              const participants = Number(
                detail?.participantCount ??
                  detail?.totalParticipants ??
                  c.participantCount ??
                  c.totalParticipants ??
                  0,
              );
              const currentAsset = Number(
                account?.currentAsset ??
                  account?.totalAsset ??
                  account?.totalEvaluation ??
                  c.currentAsset ??
                  c.totalAsset ??
                  0,
              );

              return {
                id: String(c.contestId ?? c.id),
                title: detail?.title ?? c.title ?? '',
                rank,
                participants,
                // getMyContests.currentAsset은 랭킹 스냅샷 기준일 수 있어 대회 홈과 동일하게 계좌 API를 우선 사용합니다.
                myAsset: formatWon(currentAsset),
                period: formatPeriod(c.startAt, c.endAt),
                badge,
                statusLabel,
                notStarted,
              };
            }),
          );

          if (!cancelled) {
            setMyContests(enrichedList);
          }
        })
        .catch(() => {
          if (!cancelled) setMyContests([]);
        });

      tasks.push(summaryTask, assetHoldingsTask, myContestTask);
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
        className="w-full cursor-pointer rounded-2xl bg-gradient-to-br from-[#1565C0] to-[#4F8ED9] p-5 text-left text-white shadow-sm transition hover:shadow-md"
        onClick={() => navigate(getPath('/balance'))}
        type="button"
      >
        <div className={isContestMode ? 'flex items-start justify-between gap-4' : undefined}>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-blue-100">내 총 자산</p>
            <p className="mt-2 text-2xl font-extrabold">
              {normalAsset.total}
            </p>
            <p className="mt-1 text-xs text-blue-100">
              {isContestMode
                ? contestTitle
                : `${normalChange >= 0 ? '▲' : '▼'} ${normalAsset.change} (${normalAsset.rate})`}
            </p>
          </div>
          {isContestMode ? (
            <div className="shrink-0 rounded-2xl bg-white/15 px-4 py-3 text-right">
              <p className="text-[11px] font-bold text-blue-100">현재 순위</p>
              <p className="mt-1 text-2xl font-extrabold leading-none">
                {(liveRank ?? contestView?.rank) ? `${liveRank ?? contestView?.rank}위` : '-'}
                {(liveTotalParticipants || contestView?.participants) ? (
                  <span className="ml-1 text-sm font-bold text-blue-100">
                    / {liveTotalParticipants || contestView?.participants}명
                  </span>
                ) : null}
              </p>
            </div>
          ) : null}
        </div>
        {!isContestMode ? (
          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-white/15 p-3">
              <p className="text-xs text-blue-100">예수금</p>
              <p className="mt-1 text-xs font-bold">{normalAsset.cash}</p>
            </div>
            <div className="rounded-xl bg-white/15 p-3">
              <p className="text-xs text-blue-100">주식평가</p>
              <p className="mt-1 text-xs font-bold">{normalAsset.evaluation}</p>
            </div>
            <div className="rounded-xl bg-white/15 p-3">
              <p className="text-xs text-blue-100">주문 가능</p>
              <p className="mt-1 text-xs font-bold">{normalAsset.available}</p>
            </div>
          </div>
        ) : null}
      </button>

      <section className="mt-4 grid grid-cols-3 gap-3">
        {marketStatus.map((status) => {
          const value = status.value;
          const changeRate = status.changeRate;
          return (
            <div
              className="rounded-xl border border-blue-100 bg-white px-3 py-4 text-center shadow-sm"
              key={status.title}
            >
              <div className="mx-auto flex h-6 w-6 items-center justify-center text-base">
                {status.icon}
              </div>
              <p className="mt-2 text-xs font-bold text-[#6C88A4]">{status.title}</p>
              <p className="mt-1 text-lg font-extrabold leading-5 text-slate-950">{value}</p>
              <p className={`mt-1 text-xs font-bold ${getChangeClass(changeRate)}`}>
                {changeRate}
              </p>
            </div>
          );
        })}
      </section>

      <section className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-950">실시간 순위</h2>
          <button
            className="cursor-pointer text-xs font-bold text-[#1565C0] hover:underline"
            onClick={() => navigate(getPath('/market-ranking'))}
            type="button"
          >
            더보기 ›
          </button>
        </div>
        {loading && rankingStocks.length === 0 ? (
          <p className="py-6 text-center text-xs font-bold text-[#6C88A4]">불러오는 중...</p>
        ) : rankingStocks.length === 0 ? (
          <p className="py-6 text-center text-xs font-bold text-[#A3B4C6]">순위 정보가 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {rankingStocks.map((stock) => {
              // 순위는 REST(15초 폴링) 값만 사용 — ws 실시간 시세 오버레이 안 함(종목 상세에서만 실시간)
              const price = stock.price;
              const changeRate = stock.changeRate;
              const favorite = watchset.has(stock.code);
              return (
                <div
                  className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-blue-100 bg-white px-4 py-3 text-left shadow-sm transition hover:border-blue-200 hover:bg-[#F8FBFF]"
                  key={stock.code}
                  onClick={() => navigate(`${getPath('/market')}?stockCode=${stock.code}`)}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E5F4FF] text-sm font-extrabold text-[#1565C0]">
                      {stock.rank}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-950">{stock.name}</p>
                      <p className="text-xs text-[#A3B4C6]">{stock.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-950">{price}</p>
                      <p className={`text-xs font-bold ${getChangeClass(changeRate)}`}>
                        {changeRate}
                      </p>
                    </div>
                    <button
                      aria-label={favorite ? '관심종목 해제' : '관심종목 등록'}
                      className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-[#F0F6FF]"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWatch(stock.code);
                      }}
                      type="button"
                    >
                      <Heart
                        size={18}
                        className={favorite ? 'fill-red-500 text-red-500' : 'fill-transparent text-[#A3B4C6]'}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {!isContestMode && myContests.length > 0 ? (
        <section className="mt-5">
          <h2 className="mb-3 text-base font-extrabold text-slate-950">참여 중인 대회</h2>
          <div className="space-y-3">
            {myContests.map((contest) => (
              <button
                key={contest.id}
                className="w-full cursor-pointer rounded-2xl border border-blue-100 bg-white p-4 text-left shadow-sm transition hover:border-blue-200 hover:bg-[#F8FBFF]"
                onClick={() => navigate(`/contests/${contest.id}/home`, { state: { from: '/' } })}
                type="button"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={cn('text-xs font-bold', contest.notStarted ? 'text-[#6C88A4]' : 'text-[#1565C0]')}>
                      {contest.statusLabel}
                    </p>
                    <p className="mt-1 text-base font-extrabold text-slate-950">{contest.title}</p>
                    {contest.period ? (
                      <p className="mt-1 text-xs font-bold text-[#6C88A4]">🗓️ {contest.period}</p>
                    ) : null}
                  </div>
                  {contest.badge ? (
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-bold',
                        contest.notStarted ? 'bg-slate-100 text-[#6C88A4]' : 'bg-[#E5F4FF] text-[#1565C0]',
                      )}
                    >
                      {contest.badge}
                    </span>
                  ) : null}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-[#F0F6FF] p-3">
                    <p className="text-xs text-[#6C88A4]">내 자산</p>
                    <p className="mt-1 text-sm font-bold text-slate-950">{contest.myAsset}</p>
                  </div>
                  <div className="rounded-xl bg-[#F0F6FF] p-3">
                    <p className="text-xs text-[#6C88A4]">대회 순위</p>
                    <p className="mt-1 text-sm font-bold text-[#1565C0]">
                      {contest.rank}위
                      <span className="ml-1 text-xs font-medium text-[#6C88A4]">
                        / {contest.participants}명
                      </span>
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {isContestMode ? (
        <section className="mt-5">
          <h2 className="mb-3 text-base font-extrabold text-slate-950">대회 관리</h2>
          <Button
            className="h-12 w-full cursor-pointer rounded-xl bg-red-500 text-sm font-extrabold text-white shadow-sm hover:bg-red-600"
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
