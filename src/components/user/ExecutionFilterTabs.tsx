import type { ExecutionFilterType } from '../../types/balance';
import { cn } from '../../utils/cn';

interface ExecutionFilterTabsProps {
  activeFilter: ExecutionFilterType;
  onChangeFilter: (filter: ExecutionFilterType) => void;
}

const filters: Array<{ label: string; value: ExecutionFilterType }> = [
  { label: '전체', value: 'ALL' },
  { label: '체결', value: 'FILLED' },
  { label: '미체결', value: 'OPEN' },
];

export function ExecutionFilterTabs({ activeFilter, onChangeFilter }: ExecutionFilterTabsProps) {
  return (
    <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-blue-100 bg-white">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.value;

        return (
          <button
            className={cn(
              'h-11 text-sm font-extrabold transition',
              isActive ? 'bg-[#1565C0] text-white' : 'text-[#8A94A6] hover:bg-[#F8FBFF]',
            )}
            key={filter.value}
            onClick={() => onChangeFilter(filter.value)}
            type="button"
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
