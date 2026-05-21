import type { OrderStockInfo } from '../../types/order';
import { cn } from '../../utils/cn';

interface OrderStockCardProps {
  stock: OrderStockInfo;
}

export function OrderStockCard({ stock }: OrderStockCardProps) {
  const isRise = stock.changeRate >= 0;

  return (
    <section className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold text-slate-950">{stock.stockName}</p>
          <p className="mt-1 text-xs font-bold text-[#A3B4C6]">
            {stock.stockCode} · {stock.market}
          </p>
        </div>
        <div className="text-right">
          <p className={cn('text-base font-extrabold', isRise ? 'text-red-500' : 'text-blue-600')}>
            {stock.currentPrice.toLocaleString('ko-KR')}원
          </p>
          <p className={cn('mt-1 text-xs font-bold', isRise ? 'text-red-500' : 'text-blue-600')}>
            {isRise ? '+' : ''}
            {stock.changeRate.toFixed(2)}%
          </p>
        </div>
      </div>
    </section>
  );
}
