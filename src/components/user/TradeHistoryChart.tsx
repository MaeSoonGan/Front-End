import type { TradeTrendPoint } from '../../types/stock';

interface TradeHistoryChartProps {
  trendData: TradeTrendPoint[];
}

const chartWidth = 320;
const chartHeight = 130;
const chartPadding = 18;

function createPoints(values: number[], minValue: number, maxValue: number) {
  const valueRange = maxValue - minValue || 1;
  const usableWidth = chartWidth - chartPadding * 2;
  const usableHeight = chartHeight - chartPadding * 2;

  return values
    .map((value, index) => {
      const x = chartPadding + (index / (values.length - 1)) * usableWidth;
      const y = chartPadding + (1 - (value - minValue) / valueRange) * usableHeight;

      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

export function TradeHistoryChart({ trendData }: TradeHistoryChartProps) {
  const values = trendData.flatMap((point) => [point.todayValue, point.previousValue]);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const todayPoints = createPoints(
    trendData.map((point) => point.todayValue),
    minValue,
    maxValue,
  );
  const previousPoints = createPoints(
    trendData.map((point) => point.previousValue),
    minValue,
    maxValue,
  );

  return (
    <section className="mx-4 mt-4 rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-3 text-xs font-extrabold">
        <span className="flex items-center gap-1 text-red-500">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          당일
        </span>
        <span className="flex items-center gap-1 text-emerald-600">
          <span className="h-2 w-2 rounded-full bg-emerald-600" />
          전일
        </span>
      </div>
      <svg
        aria-label="체결 추이 차트"
        className="w-full"
        height={chartHeight}
        role="img"
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      >
        {[30, 62, 94].map((y) => (
          <line key={y} stroke="#E5EEF8" strokeDasharray="4 4" strokeWidth="1" x1="0" x2={chartWidth} y1={y} y2={y} />
        ))}
        {trendData.map((point, index) => {
          const x = chartPadding + (index / (trendData.length - 1)) * (chartWidth - chartPadding * 2);

          return (
            <line
              key={point.time}
              stroke="#EEF3F8"
              strokeDasharray="4 4"
              strokeWidth="1"
              x1={x}
              x2={x}
              y1="10"
              y2={chartHeight - 22}
            />
          );
        })}
        <polyline fill="none" points={previousPoints} stroke="#2E7D32" strokeWidth="2" />
        <polyline fill="none" points={todayPoints} stroke="#EF4444" strokeWidth="2.5" />
        {trendData.map((point, index) => {
          const x = chartPadding + (index / (trendData.length - 1)) * (chartWidth - chartPadding * 2);

          return (
            <text
              fill="#8A94A6"
              fontSize="10"
              fontWeight="700"
              key={point.time}
              textAnchor="middle"
              x={x}
              y={chartHeight - 3}
            >
              {point.time}
            </text>
          );
        })}
      </svg>
    </section>
  );
}
