import { useEffect, useRef } from 'react';
import { ChartPeriodTabs } from './ChartPeriodTabs';
import { ChartTypeToggle } from './ChartTypeToggle';
import { MovingAverageSummary } from './MovingAverageSummary';
import { VolumeBarChart } from './VolumeBarChart';
import type { ChartPeriod, ChartType, StockChartPoint } from '../../types/stock';

interface StockChartSectionProps {
  activeChartType: ChartType;
  activePeriod: ChartPeriod;
  chartData: StockChartPoint[];
  onChangeChartType: (chartType: ChartType) => void;
  onChangePeriod: (period: ChartPeriod) => void;
}

const chartWidth = 640;
const chartHeight = 190;
const chartPadding = 24;

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

function getX(index: number, length: number) {
  return chartPadding + (index / (length - 1)) * (chartWidth - chartPadding * 2);
}

function getSlotWidth(length: number) {
  return (chartWidth - chartPadding * 2) / length;
}

function getY(value: number, minValue: number, maxValue: number) {
  const valueRange = maxValue - minValue || 1;
  const usableHeight = chartHeight - chartPadding * 2;

  return chartPadding + (1 - (value - minValue) / valueRange) * usableHeight;
}

function formatAxisPrice(value: number) {
  return value.toLocaleString('ko-KR');
}

function formatCompactPrice(value: number) {
  return `${Math.round(value / 100) / 10}만`;
}

export function StockChartSection({
  activeChartType,
  activePeriod,
  chartData,
  onChangeChartType,
  onChangePeriod,
}: StockChartSectionProps) {
  const chartScrollRef = useRef<HTMLDivElement>(null);
  const priceValues = chartData.flatMap((point) => [point.ma5, point.ma20, point.ma60]);
  const barPriceValues = chartData.map((point) => point.price);
  const minValue = Math.min(...priceValues);
  const maxValue = Math.max(...priceValues);
  const minBarValue = Math.min(...barPriceValues);
  const maxBarValue = Math.max(...barPriceValues);
  const axisMinValue = activeChartType === 'bar' ? minBarValue : minValue;
  const axisMaxValue = activeChartType === 'bar' ? maxBarValue : maxValue;
  const ma5Points = createPoints(
    chartData.map((point) => point.ma5),
    minValue,
    maxValue,
  );
  const ma20Points = createPoints(
    chartData.map((point) => point.ma20),
    minValue,
    maxValue,
  );
  const ma60Points = createPoints(
    chartData.map((point) => point.ma60),
    minValue,
    maxValue,
  );
  const axisValues = [
    axisMaxValue,
    Math.round((axisMaxValue + axisMinValue) / 2),
    axisMinValue,
  ];

  useEffect(() => {
    const chartElement = chartScrollRef.current;

    if (!chartElement) {
      return;
    }

    chartElement.scrollLeft = chartElement.scrollWidth;
  }, [activeChartType, activePeriod, chartData]);

  return (
    <section className="py-4">
      <div className="px-4">
        <ChartPeriodTabs activePeriod={activePeriod} onChangePeriod={onChangePeriod} />
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-extrabold">
            <span className="text-slate-950">차트</span>
            <span className="text-[#1565C0]">
              {activeChartType === 'line' ? '이동평균선' : '가격 막대'}
            </span>
          </div>
          <ChartTypeToggle activeChartType={activeChartType} onChangeChartType={onChangeChartType} />
        </div>
      </div>

      <div className="relative mx-4 mt-3 rounded-xl border border-blue-100 bg-white p-3 pr-[66px] shadow-sm">
        {activeChartType === 'line' ? (
          <div className="pointer-events-none absolute left-5 top-5 z-10 flex h-7 items-center gap-2 rounded-lg bg-white/95 px-2 text-[10px] font-extrabold shadow-sm">
            <span className="flex items-center gap-1 text-[#1565C0]">
              <span className="h-2 w-2 rounded-full bg-[#1565C0]" />
              MA5
            </span>
            <span className="flex items-center gap-1 text-orange-500">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              MA20
            </span>
            <span className="flex items-center gap-1 text-emerald-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              MA60
            </span>
          </div>
        ) : null}
        <div className="absolute bottom-3 right-3 top-3 z-10 w-[54px] border-l border-blue-100 bg-white">
          {axisValues.map((value) => (
            <span
              className="absolute left-2 -translate-y-1/2 text-[10px] font-extrabold text-[#6C88A4]"
              key={value}
              style={{ top: getY(value, axisMinValue, axisMaxValue) }}
            >
              {formatAxisPrice(value)}
            </span>
          ))}
        </div>
        <div className="overflow-x-auto" ref={chartScrollRef}>
          <svg
            aria-label="주가 차트"
            className="block"
            height={chartHeight}
            role="img"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            width={chartWidth}
          >
            {[42, 82, 122, 162].map((y) => (
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
            {activeChartType === 'bar'
              ? chartData.map((point, index) => {
                  const slotWidth = getSlotWidth(chartData.length);
                  const barWidth = slotWidth * 0.62;
                  const x = chartPadding + index * slotWidth;
                  const centerX = x + slotWidth / 2;
                  const y = getY(point.price, minBarValue, maxBarValue);
                  const height = chartHeight - chartPadding - y;

                  return (
                    <g key={`${point.date}-${index}`}>
                      <rect
                        fill={point.direction === 'rise' ? '#EF4444' : '#3B82F6'}
                        height={Math.max(height, 12)}
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
                          {formatCompactPrice(point.price)}
                        </text>
                      ) : null}
                    </g>
                  );
                })
              : null}
            {activeChartType === 'line' ? (
              <>
                <polyline fill="none" points={ma60Points} stroke="#10B981" strokeWidth="2.5" />
                <polyline fill="none" points={ma20Points} stroke="#F97316" strokeWidth="2.5" />
                <polyline fill="none" points={ma5Points} stroke="#1565C0" strokeWidth="3" />
              </>
            ) : null}
            {chartData.map((point, index) => {
              if (!point.date) {
                return null;
              }

              const x = getX(index, chartData.length);
              const barLabelX =
                activeChartType === 'bar'
                  ? chartPadding + index * getSlotWidth(chartData.length) + getSlotWidth(chartData.length) / 2
                  : x;

              return (
                <text
                  fill="#A3B4C6"
                  fontSize="11"
                  fontWeight="700"
                  key={point.date}
                  textAnchor="middle"
                  x={barLabelX}
                  y={chartHeight - 5}
                >
                  {point.date}
                </text>
              );
            })}
          </svg>
        </div>
      </div>

      <VolumeBarChart chartData={chartData} />
      <MovingAverageSummary chartData={chartData} />
    </section>
  );
}
