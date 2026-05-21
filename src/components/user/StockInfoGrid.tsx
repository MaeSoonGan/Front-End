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
    {
      label: '시가',
      value: summary.openPrice,
      labelClassName: 'text-[#8B5CF6]',
      valueClassName: 'text-slate-950',
      wrapperClassName: 'bg-[#F1EDFF]',
    },
    {
      label: '고가',
      value: summary.highPrice,
      labelClassName: 'text-red-500',
      valueClassName: 'text-red-500',
      wrapperClassName: 'bg-[#FFE8ED]',
    },
    {
      label: '저가',
      value: summary.lowPrice,
      labelClassName: 'text-sky-500',
      valueClassName: 'text-blue-600',
      wrapperClassName: 'bg-[#E5F4FF]',
    },
    {
      label: '전일',
      value: summary.previousClose,
      labelClassName: 'text-[#6C88A4]',
      valueClassName: 'text-slate-950',
      wrapperClassName: 'bg-[#F0F4FA]',
    },
  ];

  return (
    <section className="grid grid-cols-4 gap-2 bg-white px-4 pb-4">
      {items.map((item) => (
        <div
          className={cn('rounded-xl px-2 py-3 text-center', item.wrapperClassName)}
          key={item.label}
        >
          <p className={cn('text-[11px] font-bold', item.labelClassName)}>{item.label}</p>
          <p className={cn('mt-1 text-xs font-extrabold', item.valueClassName)}>
            {formatPrice(item.value)}
          </p>
        </div>
      ))}
    </section>
  );
}
