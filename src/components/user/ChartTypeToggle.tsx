import type { ChartType } from '../../types/stock';
import { cn } from '../../utils/cn';

interface ChartTypeToggleProps {
  activeChartType: ChartType;
  onChangeChartType: (chartType: ChartType) => void;
}

const chartTypes: Array<{ label: string; value: ChartType }> = [
  { label: '꺾은선', value: 'line' },
  { label: '막대', value: 'bar' },
];

export function ChartTypeToggle({
  activeChartType,
  onChangeChartType,
}: ChartTypeToggleProps) {
  return (
    <div className="flex justify-end gap-2">
      {chartTypes.map((chartType) => {
        const isActive = chartType.value === activeChartType;

        return (
          <button
            className={cn(
              'h-8 rounded-full border px-3 text-xs font-extrabold transition',
              isActive
                ? 'border-[#1565C0] bg-[#1565C0] text-white'
                : 'border-blue-100 bg-white text-[#6C88A4] hover:bg-[#F0F6FF]',
            )}
            key={chartType.value}
            onClick={() => onChangeChartType(chartType.value)}
            type="button"
          >
            {chartType.label}
          </button>
        );
      })}
    </div>
  );
}
