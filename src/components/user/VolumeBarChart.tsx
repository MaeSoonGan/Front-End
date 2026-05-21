import { useEffect, useRef } from 'react';
import type { StockChartPoint } from '../../types/stock';

interface VolumeBarChartProps {
  chartData: StockChartPoint[];
}

const chartWidth = 640;
const chartHeight = 130;
const chartPadding = 18;

function getSlotWidth(length: number) {
  return (chartWidth - chartPadding * 2) / length;
}

function getY(value: number, maxValue: number) {
  const usableHeight = chartHeight - chartPadding * 2;

  return chartPadding + (1 - value / maxValue) * usableHeight;
}

function formatVolume(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  return value.toLocaleString('ko-KR');
}

function formatBarVolume(value: number) {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}K` : String(value);
}

export function VolumeBarChart({ chartData }: VolumeBarChartProps) {
  const volumeScrollRef = useRef<HTMLDivElement>(null);
  const maxVolume = Math.max(...chartData.map((point) => point.volume));
  const axisValues = [maxVolume, Math.round(maxVolume / 2), 0];

  useEffect(() => {
    const volumeElement = volumeScrollRef.current;

    if (!volumeElement) {
      return;
    }

    volumeElement.scrollLeft = volumeElement.scrollWidth;
  }, [chartData]);

  return (
    <section className="relative mx-4 mt-3 rounded-xl border border-blue-100 bg-white p-4 pr-[66px] shadow-sm">
      <p className="mb-3 text-xs font-extrabold text-[#1565C0]">거래량</p>
      <div className="absolute bottom-4 right-4 top-11 z-10 w-[54px] border-l border-blue-100 bg-white">
        {axisValues.map((value) => (
          <span
            className="absolute left-2 -translate-y-1/2 text-[10px] font-extrabold text-[#6C88A4]"
            key={value}
            style={{ top: getY(value, maxVolume) }}
          >
            {formatVolume(value)}
          </span>
        ))}
      </div>
      <div className="overflow-x-auto bg-white py-2" ref={volumeScrollRef}>
        <svg
          aria-label="거래량 차트"
          className="block"
          height={chartHeight}
          role="img"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          width={chartWidth}
        >
          {[28, 62, 96].map((y) => (
            <line
              key={y}
              stroke="#E5EEF8"
              strokeWidth="1"
              x1="0"
              x2={chartWidth}
              y1={y}
              y2={y}
            />
          ))}
          {chartData.map((point, index) => {
            const slotWidth = getSlotWidth(chartData.length);
            const barWidth = slotWidth * 0.62;
            const x = chartPadding + index * slotWidth;
            const centerX = x + slotWidth / 2;
            const y = getY(point.volume, maxVolume);
            const height = chartHeight - chartPadding - y;

            return (
              <g key={`${point.date}-${index}`}>
                <rect
                  fill={point.direction === 'rise' ? '#EF4444' : '#3B82F6'}
                  height={Math.max(height, 10)}
                  width={barWidth}
                  x={centerX - barWidth / 2}
                  y={y}
                />
                {index % 3 === 0 || point.date ? (
                  <text
                    fill="#6C88A4"
                    fontSize="9"
                    fontWeight="700"
                    textAnchor="middle"
                    x={centerX}
                    y={Math.max(y - 5, 12)}
                  >
                    {formatBarVolume(point.volume)}
                  </text>
                ) : null}
              </g>
            );
          })}
          {chartData.map((point, index) => {
            if (!point.date) {
              return null;
            }

            const labelX =
              chartPadding + index * getSlotWidth(chartData.length) + getSlotWidth(chartData.length) / 2;

            return (
              <text
                fill="#A3B4C6"
                fontSize="10"
                fontWeight="700"
                key={point.date}
                textAnchor="middle"
                x={labelX}
                y={chartHeight - 3}
              >
                {point.date}
              </text>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
