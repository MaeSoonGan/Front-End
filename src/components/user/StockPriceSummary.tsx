import { Heart } from 'lucide-react';
import type { StockSummary } from '../../types/stock';
import { cn } from '../../utils/cn';

interface StockPriceSummaryProps {
  isFavorite: boolean;
  onToggleFavorite: () => void;
  summary: StockSummary;
}

function formatPrice(value: number) {
  return value.toLocaleString('ko-KR');
}

export function StockPriceSummary({
  isFavorite,
  onToggleFavorite,
  summary,
}: StockPriceSummaryProps) {
  const isRise = summary.changeAmount > 0;
  const changeSymbol = isRise ? '▲' : summary.changeAmount < 0 ? '▼' : '';

  return (
    <section className="bg-white px-4 py-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold text-[#6C88A4]">{summary.stockCode}</p>
          <p
            className={cn(
              'mt-1 text-3xl font-extrabold tracking-normal',
              isRise ? 'text-red-500' : 'text-blue-600',
            )}
          >
            {formatPrice(summary.currentPrice)}원
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 pb-1">
          <button
            aria-label={isFavorite ? '관심종목 해제' : '관심종목 등록'}
            className="flex h-9 w-9 items-center justify-center rounded-full text-red-500 transition hover:bg-red-50"
            onClick={onToggleFavorite}
            type="button"
          >
            <Heart
              className={cn(isFavorite ? 'fill-red-500' : 'fill-transparent')}
              size={18}
              strokeWidth={2.5}
            />
          </button>
          <p className="text-xs font-bold text-[#6C88A4]">거래량 {summary.volume}</p>
        </div>
      </div>
      <p
        className={cn(
          'mt-2 text-sm font-extrabold',
          isRise ? 'text-red-500' : 'text-blue-600',
        )}
      >
        {changeSymbol}
        {Math.abs(summary.changeAmount).toLocaleString('ko-KR')}원 (
        {isRise ? '+' : ''}
        {summary.changeRate.toFixed(2)}%)
      </p>
    </section>
  );
}
