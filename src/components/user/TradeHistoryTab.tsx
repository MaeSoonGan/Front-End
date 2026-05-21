import type { TradeHistoryItem, TradeTrendPoint } from '../../types/stock';
import { TradeHistoryChart } from './TradeHistoryChart';
import { TradeHistoryTable } from './TradeHistoryTable';

interface TradeHistoryTabProps {
  trades: TradeHistoryItem[];
  trendData: TradeTrendPoint[];
}

export function TradeHistoryTab({ trades, trendData }: TradeHistoryTabProps) {
  return (
    <section className="pb-4">
      <TradeHistoryChart trendData={trendData} />
      <TradeHistoryTable trades={trades} />
    </section>
  );
}
