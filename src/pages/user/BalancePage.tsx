import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BalanceExecutionHistoryTab } from '../../components/user/BalanceExecutionHistoryTab';
import { BalanceSummaryCard } from '../../components/user/BalanceSummaryCard';
import { BalanceTabs } from '../../components/user/BalanceTabs';
import { BalanceTradeHistoryTab } from '../../components/user/BalanceTradeHistoryTab';
import { HoldingStockCard } from '../../components/user/HoldingStockCard';
import { ProfitTrendChart } from '../../components/user/ProfitTrendChart';
import { useContestMode } from '../../contexts/ContestModeContext';
import { useMarketSocket } from '../../hooks/useMarketSocket';
import { portfolioApi } from '../../api/user/portfolio';
import { orderApi } from '../../api/user/order';
import type {
  BalanceSummary,
  BalanceTab,
  BalanceTradeHistoryItem,
  ExecutionFilterType,
  ExecutionHistoryItem,
  ExecutionStatus,
  HoldingItem,
  ProfitTrendPoint,
  TradeSide,
} from '../../types/balance';

const EMPTY_SUMMARY: BalanceSummary = {
  totalEvaluation: 0,
  profitAmount: 0,
  profitRate: 0,
  deposit: 0,
  availableOrderAmount: 0,
};

function getInitialTab(tab: string | null): BalanceTab {
  if (tab === 'trades' || tab === 'executions') {
    return tab;
  }

  return 'holdings';
}

function toNumber(value: unknown): number {
  return Number(value ?? 0);
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

// N일 전 날짜를 'YYYY-MM-DD'로
function ymdDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// ISO → 'YYYY.MM.DD'
function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.split('T')[0]?.replaceAll('-', '.') ?? '';
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

// ISO → 'YYYY.MM.DD HH:mm:ss'
function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.replace('T', ' ');
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// 날짜 → 'M/D'
function formatMonthDay(date: string | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function toTradeSide(side: string): TradeSide {
  return side === 'SELL' ? 'SELL' : 'BUY';
}

function toOrderTypeLabel(orderType: string): '지정가' | '시장가' {
  return orderType === 'MARKET' ? '시장가' : '지정가';
}

function toExecutionStatus(status: string): ExecutionStatus {
  switch ((status ?? '').toUpperCase()) {
    case 'FILLED':
      return 'FILLED';
    case 'PARTIALLY_FILLED':
    case 'PARTIAL':
      return 'PARTIAL';
    case 'ACCEPTED':
    case 'OPEN':
    case 'PENDING':
      return 'OPEN';
    default:
      // CANCELED, CANCELLED, CANCEL_REQUESTED, CANCEL_FAILED, REJECTED 등
      return 'CANCELLED';
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toHoldingItem(h: any): HoldingItem {
  return {
    stockName: h.stockName ?? '',
    stockCode: h.stockCode ?? '',
    quantity: toNumber(h.quantity),
    averagePrice: toNumber(h.avgPrice),
    currentPrice: toNumber(h.currentPrice),
    profitAmount: toNumber(h.profitAmount),
    profitRate: toNumber(h.profitRate),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toTradeItem(t: any): BalanceTradeHistoryItem {
  return {
    id: String(t.tradeId),
    tradeDate: formatDate(t.executedAt),
    side: toTradeSide(t.side),
    stockName: t.stockName ?? '',
    quantity: toNumber(t.quantity),
    unitPrice: toNumber(t.price),
    executionAmount: toNumber(t.totalAmount),
    settlementAmount: toNumber(t.netAmount),
    fee: toNumber(t.fee),
    tax: toNumber(t.tax),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toExecutionItem(o: any): ExecutionHistoryItem {
  const quantity = toNumber(o.quantity);
  const remaining = toNumber(o.remainingQuantity);
  return {
    id: String(o.orderId),
    stockName: o.stockName ?? '',
    side: toTradeSide(o.side),
    orderType: toOrderTypeLabel(o.orderType),
    orderPrice: toNumber(o.price),
    orderQuantity: quantity,
    filledQuantity: Math.max(0, quantity - remaining),
    remainingQuantity: remaining,
    orderNumber: o.orderNumber ?? String(o.orderId),
    orderedAt: formatDateTime(o.createdAt),
    status: toExecutionStatus(o.status),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toProfitPoint(p: any, index: number, total: number): ProfitTrendPoint {
  return {
    label: index === total - 1 ? '오늘' : formatMonthDay(p.date),
    rate: toNumber(p.profitRate),
  };
}

export function BalancePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { contestId, isContestMode } = useContestMode();
  const [activeTab, setActiveTab] = useState<BalanceTab>(() => getInitialTab(searchParams.get('tab')));

  const [summary, setSummary] = useState<BalanceSummary>(EMPTY_SUMMARY);
  const [holdings, setHoldings] = useState<HoldingItem[]>([]);
  const [profitTrend, setProfitTrend] = useState<ProfitTrendPoint[]>([]);
  const [trades, setTrades] = useState<BalanceTradeHistoryItem[]>([]);
  const [executions, setExecutions] = useState<ExecutionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 보유 종목 실시간 현재가 구독 (현재가만, 호가 X)
  const { prices: livePrices } = useMarketSocket(holdings.map((h) => h.stockCode));
  // live 시세로 현재가/평가손익/수익률 재계산 (평단 대비)
  const liveHoldings: HoldingItem[] = holdings.map((h) => {
    const live = livePrices[h.stockCode];
    if (!live || !live.currentPrice) {
      return h;
    }
    const currentPrice = live.currentPrice;
    const profitAmount = (currentPrice - h.averagePrice) * h.quantity;
    const profitRate =
      h.averagePrice > 0 ? ((currentPrice - h.averagePrice) / h.averagePrice) * 100 : 0;
    return { ...h, currentPrice, profitAmount, profitRate };
  });

  // 요약 카드도 live 평가금액으로 재계산 (총평가금액 = 예수금 + Σ(live가 × 수량), 수익 = 총자산 - 시드)
  const liveSummary: BalanceSummary = (() => {
    if (holdings.length === 0) {
      return summary;
    }
    const liveEvaluation = liveHoldings.reduce((sum, h) => sum + h.currentPrice * h.quantity, 0);
    const seed = summary.totalEvaluation - summary.profitAmount;
    const total = summary.deposit + liveEvaluation;
    return {
      ...summary,
      totalEvaluation: total,
      profitAmount: total - seed,
      profitRate: seed > 0 ? ((total - seed) / seed) * 100 : 0,
    };
  })();

  // 매매내역 필터 (날짜/구분) — 백엔드 조회에 사용
  const [tradeFrom, setTradeFrom] = useState(() => ymdDaysAgo(0));
  const [tradeTo, setTradeTo] = useState(() => ymdDaysAgo(0));
  const [tradeSide, setTradeSide] = useState<'ALL' | TradeSide>('ALL');

  // 체결내역 필터 (날짜 = 백엔드 조회, 상태 = 클라이언트 필터)
  const [executionDate, setExecutionDate] = useState(() => ymdDaysAgo(0));
  const [executionFilter, setExecutionFilter] = useState<ExecutionFilterType>('ALL');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // 대회 모드면 해당 대회 계좌, 일반 모드면 일반 계좌(contestId 미전달)
    const cid = isContestMode && contestId ? Number(contestId) : undefined;

    // 요약 카드 — 대회: 대회계좌 / 일반: 포트폴리오 요약 (주문가능금액은 Redis 의존)
    const summaryTask = (
      cid != null ? portfolioApi.getContestAccount(cid) : portfolioApi.getSummary()
    )
      .then((s) => {
        if (cancelled || !s) return;
        setSummary({
          totalEvaluation: toNumber(cid != null ? s.currentAsset : s.totalAsset),
          profitAmount: toNumber(s.profitAmount),
          profitRate: toNumber(s.profitRate),
          deposit: toNumber(s.cashBalance),
          availableOrderAmount: toNumber(s.availableBalance),
        });
      })
      .catch(() => {});

    const holdingsTask = portfolioApi
      .getHoldings(cid)
      .then((items) => {
        if (cancelled) return;
        setHoldings((items ?? []).map(toHoldingItem));
      })
      .catch(() => {
        if (!cancelled) setHoldings([]);
      });

    // 수익률 추이는 일반 계좌 기준만 제공(백엔드 contestId 미지원) → 대회 모드에선 생략
    const profitTask = cid != null
      ? Promise.resolve(setProfitTrend([]))
      : portfolioApi
          .getProfitHistory('1M')
          .then((items) => {
            if (cancelled) return;
            const list = items ?? [];
            setProfitTrend(list.map((p: unknown, i: number) => toProfitPoint(p, i, list.length)));
          })
          .catch(() => {
            if (!cancelled) setProfitTrend([]);
          });

    Promise.all([summaryTask, holdingsTask, profitTask]).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [isContestMode, contestId]);

  // 매매내역 — 날짜/구분 필터로 백엔드 조회 (필터 변경 시 재조회)
  useEffect(() => {
    let cancelled = false;
    const cid = isContestMode && contestId ? Number(contestId) : undefined;
    orderApi
      .getTrades({
        contestId: cid,
        from: tradeFrom,
        to: tradeTo,
        side: tradeSide === 'ALL' ? undefined : tradeSide,
      })
      .then((data) => {
        if (!cancelled) setTrades((data?.content ?? []).map(toTradeItem));
      })
      .catch(() => {
        if (!cancelled) setTrades([]);
      });
    return () => {
      cancelled = true;
    };
  }, [isContestMode, contestId, tradeFrom, tradeTo, tradeSide]);

  // 체결내역 — 선택 날짜의 주문 조회 (상태 필터는 탭에서 클라이언트 처리)
  useEffect(() => {
    let cancelled = false;
    const cid = isContestMode && contestId ? Number(contestId) : undefined;
    orderApi
      .getOrders({ contestId: cid, date: executionDate })
      .then((data) => {
        if (!cancelled) setExecutions((data?.content ?? []).map(toExecutionItem));
      })
      .catch(() => {
        if (!cancelled) setExecutions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [isContestMode, contestId, executionDate]);

  const handleChangeTab = (tab: BalanceTab) => {
    setActiveTab(tab);
    const nextSearchParams = new URLSearchParams(searchParams);

    if (tab === 'holdings') {
      nextSearchParams.delete('tab');
    } else {
      nextSearchParams.set('tab', tab);
    }

    setSearchParams(nextSearchParams);
  };

  return (
    <div className="min-h-full bg-[#F3F7FC]">
      <div>
        <BalanceTabs activeTab={activeTab} onChangeTab={handleChangeTab} />
      </div>

      {activeTab === 'holdings' ? (
        <section className="space-y-5 px-4 pb-24 pt-4">
          <BalanceSummaryCard summary={liveSummary} />

          <section>
            <h2 className="mb-3 text-base font-extrabold text-slate-950">보유 종목</h2>
            {loading && holdings.length === 0 ? (
              <p className="py-6 text-center text-xs font-bold text-[#6C88A4]">불러오는 중...</p>
            ) : holdings.length === 0 ? (
              <p className="py-6 text-center text-xs font-bold text-[#A3B4C6]">보유 중인 종목이 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {liveHoldings.map((holding) => (
                  <HoldingStockCard holding={holding} key={holding.stockCode} />
                ))}
              </div>
            )}
          </section>

          {profitTrend.length > 0 ? (
            <section>
              <h2 className="mb-3 text-base font-extrabold text-slate-950">수익률 추이</h2>
              <ProfitTrendChart points={profitTrend} />
            </section>
          ) : null}
        </section>
      ) : activeTab === 'trades' ? (
        <BalanceTradeHistoryTab
          endDate={tradeTo}
          onChangeEndDate={setTradeTo}
          onChangeSide={setTradeSide}
          onChangeStartDate={setTradeFrom}
          side={tradeSide}
          startDate={tradeFrom}
          trades={trades}
        />
      ) : (
        <BalanceExecutionHistoryTab
          date={executionDate}
          executions={executions}
          filter={executionFilter}
          onChangeDate={setExecutionDate}
          onChangeFilter={setExecutionFilter}
        />
      )}
    </div>
  );
}
