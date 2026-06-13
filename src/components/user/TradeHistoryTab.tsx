import type { TradeHistoryItem, TradeTrendPoint } from '../../types/stock';
import { TradeHistoryChart } from './TradeHistoryChart';
import { TradeHistoryTable } from './TradeHistoryTable';

interface TradeHistoryTabProps {
  trades: TradeHistoryItem[];
  trendData: TradeTrendPoint[];
  isLoading?: boolean;
  errorMessage?: string;
}

export function TradeHistoryTab({
  trades,
  trendData,
  isLoading = false,
  errorMessage = '',
}: TradeHistoryTabProps) {
  return (
    <section className="pb-4">
      {isLoading ? (
        <p className="px-4 py-3 text-center text-xs font-bold text-[#6C88A4]">불러오는 중...</p>
      ) : errorMessage ? (
        <p className="px-4 py-3 text-center text-xs font-bold text-[#A3B4C6]">{errorMessage}</p>
      ) : null}
      <TradeHistoryChart trendData={trendData} />
      <TradeHistoryTable trades={trades} />
    </section>
  );
}
