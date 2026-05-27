import type { ProfitTrendPoint } from '../../types/balance';

interface ProfitTrendChartProps {
  points: ProfitTrendPoint[];
}

const chartWidth = 320;
const chartHeight = 130;
const chartPadding = 14;

function getChartLayout(points: ProfitTrendPoint[]) {
  const rates = points.map((point) => point.rate);
  const minRate = Math.min(...rates);
  const maxRate = Math.max(...rates);
  const range = maxRate - minRate || 1;
  const chartBottom = chartHeight - 30;
  const chartTop = chartPadding;
  const chartUsableHeight = chartBottom - chartTop;

  return points.map((point, index) => {
    const x = chartPadding + (index / (points.length - 1)) * (chartWidth - chartPadding * 2);
    const y = chartTop + (1 - (point.rate - minRate) / range) * chartUsableHeight;

    return { ...point, x, y };
  });
}

export function ProfitTrendChart({ points }: ProfitTrendChartProps) {
  const layoutPoints = getChartLayout(points);
  const polylinePoints = layoutPoints.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ');
  const firstPoint = layoutPoints[0];
  const middlePoint = layoutPoints[Math.floor(layoutPoints.length / 2)];
  const lastPoint = layoutPoints[layoutPoints.length - 1];
  const labelPoints = [firstPoint, middlePoint, lastPoint];

  return (
    <section className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
      <svg aria-label="수익률 추이 차트" className="w-full" height={chartHeight} role="img" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        <defs>
          <linearGradient id="profitTrendFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon fill="url(#profitTrendFill)" points={`14,100 ${polylinePoints} 306,100`} />
        <polyline fill="none" points={polylinePoints} stroke="#EF4444" strokeLinecap="round" strokeWidth="2.5" />
        {layoutPoints.map((point) => (
          <circle cx={point.x} cy={point.y} fill="#EF4444" key={point.label} r="2.5" />
        ))}
        {labelPoints.map((point) => (
          <g key={`label-${point.label}`}>
            <text
              fill="#EF4444"
              fontSize="10"
              fontWeight="700"
              textAnchor="middle"
              x={point.x}
              y={Math.max(point.y - 8, 10)}
            >
              {point.rate.toFixed(1)}%
            </text>
            <text
              fill="#6C88A4"
              fontSize="10"
              fontWeight="700"
              textAnchor="middle"
              x={point.x}
              y={chartHeight - 5}
            >
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    </section>
  );
}
