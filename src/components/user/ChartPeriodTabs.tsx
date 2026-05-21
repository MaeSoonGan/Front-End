import type { ChartPeriod } from '../../types/stock';
import { cn } from '../../utils/cn';

interface ChartPeriodTabsProps {
  activePeriod: ChartPeriod;
  onChangePeriod: (period: ChartPeriod) => void;
}

const periods: Array<{ label: string; value: ChartPeriod }> = [
  { label: '1분', value: '1m' },
  { label: '5분', value: '5m' },
  { label: '15분', value: '15m' },
  { label: '일', value: 'day' },
  { label: '주', value: 'week' },
  { label: '월', value: 'month' },
];

export function ChartPeriodTabs({ activePeriod, onChangePeriod }: ChartPeriodTabsProps) {
  return (
    <div className="grid grid-cols-6 gap-1">
      {periods.map((period) => {
        const isActive = period.value === activePeriod;

        return (
          <button
            className={cn(
              'h-8 rounded-full text-xs font-extrabold transition',
              isActive ? 'bg-[#1565C0] text-white' : 'text-[#6C88A4] hover:bg-[#F0F6FF]',
            )}
            key={period.value}
            onClick={() => {
              // TODO: 실제 기간별 시세 API/WebSocket 데이터로 교체합니다.
              onChangePeriod(period.value);
            }}
            type="button"
          >
            {period.label}
          </button>
        );
      })}
    </div>
  );
}
