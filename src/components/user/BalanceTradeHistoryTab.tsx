import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { BalanceTradeHistoryItem, TradeSide } from '../../types/balance';
import { cn } from '../../utils/cn';

interface BalanceTradeHistoryTabProps {
  trades: BalanceTradeHistoryItem[];
}

type TradeFilter = 'ALL' | TradeSide;

function formatWon(value: number) {
  return `${value.toLocaleString('ko-KR')}원`;
}

export function BalanceTradeHistoryTab({ trades }: BalanceTradeHistoryTabProps) {
  const [sideFilter, setSideFilter] = useState<TradeFilter>('ALL');
  const [startDate, setStartDate] = useState('2026-05-01');
  const [endDate, setEndDate] = useState('2026-05-21');
  const filteredTrades = useMemo(
    () =>
      trades.filter((trade) => {
        const tradeDate = trade.tradeDate.replaceAll('.', '-');
        const isSideMatched = sideFilter === 'ALL' || trade.side === sideFilter;
        const isDateMatched = tradeDate >= startDate && tradeDate <= endDate;

        return isSideMatched && isDateMatched;
      }),
    [endDate, sideFilter, startDate, trades],
  );
  const buyQuantity = filteredTrades
    .filter((trade) => trade.side === 'BUY')
    .reduce((sum, trade) => sum + trade.quantity, 0);
  const sellQuantity = filteredTrades
    .filter((trade) => trade.side === 'SELL')
    .reduce((sum, trade) => sum + trade.quantity, 0);
  const totalExecutionAmount = filteredTrades.reduce((sum, trade) => sum + trade.executionAmount, 0);

  return (
    <section className="px-4 pb-24 pt-4">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <input
          className="min-w-0 rounded-xl border border-blue-100 bg-white px-3 py-3 text-center text-sm font-extrabold text-slate-950 outline-none"
          onChange={(event) => setStartDate(event.target.value)}
          type="date"
          value={startDate}
        />
        <span className="text-[#6C88A4]">~</span>
        <input
          className="min-w-0 rounded-xl border border-blue-100 bg-white px-3 py-3 text-center text-sm font-extrabold text-slate-950 outline-none"
          onChange={(event) => setEndDate(event.target.value)}
          type="date"
          value={endDate}
        />
      </div>
      <div className="mt-3 flex gap-2">
        <select
          className="h-11 flex-1 rounded-xl border border-blue-100 bg-white px-3 text-sm font-extrabold text-slate-950 outline-none"
          onChange={(event) => setSideFilter(event.target.value as TradeFilter)}
          value={sideFilter}
        >
          <option value="ALL">전체</option>
          <option value="BUY">매수</option>
          <option value="SELL">매도</option>
        </select>
        <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-100 bg-white text-[#6C88A4]" type="button">
          <Search size={18} strokeWidth={2.5} />
        </button>
      </div>

      <section className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-white p-3 text-center shadow-sm">
          <p className="text-xs text-[#6C88A4]">매수 체결량</p>
          <p className="mt-1 text-sm font-extrabold text-red-500">{buyQuantity}주</p>
        </div>
        <div className="rounded-xl bg-white p-3 text-center shadow-sm">
          <p className="text-xs text-[#6C88A4]">매도 체결량</p>
          <p className="mt-1 text-sm font-extrabold text-[#1565C0]">{sellQuantity}주</p>
        </div>
        <div className="rounded-xl bg-white p-3 text-center shadow-sm">
          <p className="text-xs text-[#6C88A4]">체결금액</p>
          <p className="mt-1 text-sm font-extrabold text-slate-950">{formatWon(totalExecutionAmount)}</p>
        </div>
      </section>

      <div className="mt-4 space-y-2">
        {filteredTrades.length > 0 ? (
          filteredTrades.map((trade) => {
            const isBuy = trade.side === 'BUY';

            return (
              <article className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm" key={trade.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={cn('text-xs font-extrabold', isBuy ? 'text-red-500' : 'text-[#1565C0]')}>
                      {isBuy ? '매수' : '매도'} · {trade.tradeDate}
                    </p>
                    <p className="mt-1 text-sm font-extrabold text-slate-950">{trade.stockName}</p>
                  </div>
                  <p className="text-sm font-extrabold text-slate-950">{formatWon(trade.executionAmount)}</p>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold text-[#6C88A4]">
                  <p>수량 {trade.quantity}주</p>
                  <p>단가 {formatWon(trade.unitPrice)}</p>
                  <p>정산 {formatWon(trade.settlementAmount)}</p>
                  <p>수수료 {formatWon(trade.fee)}</p>
                  <p>거래세 {formatWon(trade.tax)}</p>
                </div>
              </article>
            );
          })
        ) : (
          <EmptyState />
        )}
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-blue-100 bg-white px-4 py-16 text-center shadow-sm">
      <p className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-[#A3B4C6]">!</p>
      <p className="mt-4 text-sm font-extrabold text-[#A3B4C6]">조회내역이 없어요.</p>
    </div>
  );
}
