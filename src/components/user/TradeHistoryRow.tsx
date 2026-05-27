import type { TradeHistoryItem } from '../../types/stock';
import { cn } from '../../utils/cn';

interface TradeHistoryRowProps {
  trade: TradeHistoryItem;
}

function formatNumber(value: number) {
  return Math.abs(value).toLocaleString('ko-KR');
}

export function TradeHistoryRow({ trade }: TradeHistoryRowProps) {
  const isRise = trade.direction === 'UP';
  const quantityIsBuy = trade.quantityDirection === 'UP';

  return (
    <tr className="border-b border-slate-100 bg-white text-center text-[11px] font-extrabold">
      <td className="px-1 py-3 text-center text-[#5F6B7A]">
        <span
          className={cn(
            'mr-0.5 inline-block h-0 w-0 border-y-[4px] border-l-[4px] border-y-transparent',
            isRise ? 'border-l-emerald-600' : 'border-l-orange-400',
          )}
        />
        {trade.tradeTime}
      </td>
      <td className={cn('px-1 py-3', isRise ? 'text-red-500' : 'text-blue-600')}>
        {trade.price.toLocaleString('ko-KR')}
      </td>
      <td className={cn('px-1 py-3', isRise ? 'text-red-500' : 'text-blue-600')}>
        {isRise ? '▲' : '▼'} {formatNumber(trade.changeAmount)}
      </td>
      <td className={cn('px-1 py-3 text-center', quantityIsBuy ? 'text-red-500' : 'text-[#1565C0]')}>
        {trade.quantity.toLocaleString('ko-KR')}
      </td>
      <td className={cn('px-1 py-3', isRise ? 'text-red-500' : 'text-blue-600')}>
        {trade.strength.toFixed(2)}%
      </td>
    </tr>
  );
}
