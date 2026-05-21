import type { StockSummary } from '../../types/stock';
import { cn } from '../../utils/cn';

interface StockInfoGridProps {
  summary: StockSummary;
}

function formatPrice(value: number) {
  return value.toLocaleString('ko-KR');
}

export function StockInfoGrid({ summary }: StockInfoGridProps) {
  const items = [
    { label: '시가', value: summary.openPrice },
    { label: '고가', value: summary.highPrice, className: 'text-red-500' },
    { label: '저가', value: summary.lowPrice, className: 'text-blue-600' },
    { label: '전일', value: summary.previousClose },
  ];

  return (
    <section className="grid grid-cols-4 gap-2 bg-white px-4 pb-4">
      {items.map((item) => (
        <div className="rounded-xl bg-[#F0F6FF] px-2 py-3 text-center" key={item.label}>
          <p className="text-[11px] font-bold text-[#6C88A4]">{item.label}</p>
          <p className={cn('mt-1 text-xs font-extrabold text-slate-950', item.className)}>
            {formatPrice(item.value)}
          </p>
        </div>
      ))}
    </section>
  );
}
