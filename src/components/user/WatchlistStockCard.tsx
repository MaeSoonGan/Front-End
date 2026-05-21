import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { WatchlistStockItem } from '../../types/watchlist';
import { cn } from '../../utils/cn';

interface WatchlistStockCardProps {
  onRemove: (id: string) => void;
  stock: WatchlistStockItem;
}

export function WatchlistStockCard({ onRemove, stock }: WatchlistStockCardProps) {
  const navigate = useNavigate();
  const isRise = stock.changeRate >= 0;

  return (
    <button
      className="flex w-full items-center justify-between rounded-xl border border-blue-100 bg-white p-4 text-left shadow-sm transition hover:border-blue-200 hover:bg-[#F8FBFF]"
      onClick={() => navigate(`/market?stockCode=${stock.stockCode}`)}
      type="button"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E5F4FF] text-sm font-extrabold text-[#1565C0]">
          {stock.stockName.slice(0, 1)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold text-slate-950">{stock.stockName}</p>
          <p className="mt-1 text-xs font-bold text-[#A3B4C6]">
            {stock.stockCode} · {stock.exchange}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-extrabold text-slate-950">
            {stock.currentPrice.toLocaleString('ko-KR')}
          </p>
          <p className={cn('mt-1 text-xs font-extrabold', isRise ? 'text-red-500' : 'text-blue-600')}>
            {isRise ? '+' : ''}
            {stock.changeRate.toFixed(2)}%
          </p>
        </div>
        <button
          aria-label={`${stock.stockName} 관심종목 해제`}
          className="flex h-9 w-9 items-center justify-center rounded-full text-red-500 hover:bg-red-50"
          onClick={(event) => {
            event.stopPropagation();
            // TODO: 관심종목 삭제 API 연동 후 서버 상태와 동기화합니다.
            onRemove(stock.id);
          }}
          type="button"
        >
          <Heart className="fill-red-500" size={18} strokeWidth={2.5} />
        </button>
      </div>
    </button>
  );
}
