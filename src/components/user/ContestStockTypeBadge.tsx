import type { ContestStockType } from '../../types/contest';
import { cn } from '../../utils/cn';

interface ContestStockTypeBadgeProps {
  stockType: ContestStockType;
}

export function ContestStockTypeBadge({ stockType }: ContestStockTypeBadgeProps) {
  const isAllStock = stockType === '전체 종목';

  return (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-extrabold',
        isAllStock ? 'bg-[#E5F4FF] text-[#1565C0]' : 'bg-orange-50 text-orange-500',
      )}
    >
      {stockType}
    </span>
  );
}
