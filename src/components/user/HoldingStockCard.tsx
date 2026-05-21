import { useNavigate } from 'react-router-dom';
import type { HoldingItem } from '../../types/balance';
import { cn } from '../../utils/cn';

interface HoldingStockCardProps {
  holding: HoldingItem;
}

function formatWon(value: number) {
  return `${Math.abs(value).toLocaleString('ko-KR')}원`;
}

export function HoldingStockCard({ holding }: HoldingStockCardProps) {
  const navigate = useNavigate();
  const isProfit = holding.profitAmount >= 0;
  const evaluationAmount = holding.currentPrice * holding.quantity;

  return (
    <article className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E5F4FF] text-sm font-extrabold text-[#1565C0]">
            {holding.stockName.slice(0, 1)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-slate-950">{holding.stockName}</p>
            <p className="mt-1 text-xs font-bold text-[#6C88A4]">
              {holding.quantity}주 · 평균 {holding.averagePrice.toLocaleString('ko-KR')}원
            </p>
            <p className="mt-1 text-xs font-extrabold text-[#1565C0]">
              평가액 {evaluationAmount.toLocaleString('ko-KR')}원
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-extrabold text-slate-950">
            {holding.currentPrice.toLocaleString('ko-KR')}원
          </p>
          <p className={cn('mt-1 text-xs font-extrabold', isProfit ? 'text-red-500' : 'text-blue-600')}>
            {isProfit ? '+' : '-'}
            {Math.abs(holding.profitRate).toFixed(1)}%
          </p>
          <p className={cn('text-[11px] font-bold', isProfit ? 'text-red-400' : 'text-blue-500')}>
            {isProfit ? '+' : '-'}
            {formatWon(holding.profitAmount)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        <button
          className="h-10 rounded-xl border border-blue-100 bg-white text-xs font-extrabold text-slate-700 transition hover:bg-[#F8FBFF]"
          onClick={() => navigate(`/market?stockCode=${holding.stockCode}&from=balance`)}
          type="button"
        >
          현재가
        </button>
        <button
          className="h-10 rounded-xl border border-blue-100 bg-white text-xs font-extrabold text-slate-700 transition hover:bg-[#F8FBFF]"
          onClick={() => navigate(`/market?stockCode=${holding.stockCode}&tab=chart&from=balance`)}
          type="button"
        >
          차트
        </button>
        <button
          className="h-10 rounded-xl border border-red-200 bg-white text-xs font-extrabold text-red-500 transition hover:bg-red-50"
          onClick={() => navigate(`/market?stockCode=${holding.stockCode}&orderSide=BUY&from=balance`)}
          type="button"
        >
          매수
        </button>
        <button
          className="h-10 rounded-xl border border-blue-200 bg-white text-xs font-extrabold text-[#1565C0] transition hover:bg-[#F0F6FF]"
          onClick={() => navigate(`/market?stockCode=${holding.stockCode}&orderSide=SELL&from=balance`)}
          type="button"
        >
          매도
        </button>
      </div>
    </article>
  );
}
