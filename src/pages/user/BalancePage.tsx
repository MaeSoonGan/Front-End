import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BalanceExecutionHistoryTab } from '../../components/user/BalanceExecutionHistoryTab';
import { BalanceSummaryCard } from '../../components/user/BalanceSummaryCard';
import { BalanceTabs } from '../../components/user/BalanceTabs';
import { BalanceTradeHistoryTab } from '../../components/user/BalanceTradeHistoryTab';
import { HoldingStockCard } from '../../components/user/HoldingStockCard';
import { ProfitTrendChart } from '../../components/user/ProfitTrendChart';
import { useContestMode } from '../../contexts/ContestModeContext';
import { portfolioApi } from '../../api/user/portfolio';
import { orderApi } from '../../api/user/order';
import type {
  BalanceSummary,
  BalanceTab,
  BalanceTradeHistoryItem,
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
  switch (status) {
    case 'FILLED':
      return 'FILLED';
    case 'PARTIAL':
      return 'PARTIAL';
    case 'OPEN':
    case 'PENDING':
      return 'OPEN';
    default:
      // CANCELLED, CANCELED, CANCEL_REQUESTED, CANCEL_FAILED, REJECTED 등
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

    const tradesTask = orderApi
      .getTrades({ contestId: cid })
      .then((data) => {
        if (cancelled) return;
        setTrades((data?.content ?? []).map(toTradeItem));
      })
      .catch(() => {
        if (!cancelled) setTrades([]);
      });

    const executionsTask = orderApi
      .getOrders({ contestId: cid })
      .then((data) => {
        if (cancelled) return;
        setExecutions((data?.content ?? []).map(toExecutionItem));
      })
      .catch(() => {
        if (!cancelled) setExecutions([]);
      });

    Promise.all([summaryTask, holdingsTask, profitTask, tradesTask, executionsTask]).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [isContestMode, contestId]);

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
          <BalanceSummaryCard summary={summary} />

          <section>
            <h2 className="mb-3 text-base font-extrabold text-slate-950">보유 종목</h2>
            {loading && holdings.length === 0 ? (
              <p className="py-6 text-center text-xs font-bold text-[#6C88A4]">불러오는 중...</p>
            ) : holdings.length === 0 ? (
              <p className="py-6 text-center text-xs font-bold text-[#A3B4C6]">보유 중인 종목이 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {holdings.map((holding) => (
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
        <BalanceTradeHistoryTab trades={trades} />
      ) : (
        <BalanceExecutionHistoryTab executions={executions} />
      )}
    </div>
  );
}
