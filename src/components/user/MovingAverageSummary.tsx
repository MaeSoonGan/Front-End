import type { StockChartPoint } from '../../types/stock';

interface MovingAverageSummaryProps {
  chartData: StockChartPoint[];
}

function formatPrice(value: number) {
  return `${Math.round(value).toLocaleString('ko-KR')}원`;
}

export function MovingAverageSummary({ chartData }: MovingAverageSummaryProps) {
  const latest = chartData[chartData.length - 1];
  const items = [
    { label: 'MA5', value: latest.ma5, className: 'text-[#1565C0]' },
    { label: 'MA20', value: latest.ma20, className: 'text-orange-500' },
    { label: 'MA60', value: latest.ma60, className: 'text-emerald-500' },
  ];

  return (
    <section className="mx-4 mt-3 rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
      <div className="space-y-2">
        {items.map((item) => (
          <div className="flex items-center justify-between text-xs font-extrabold" key={item.label}>
            <span className={item.className}>{item.label}</span>
            <span className="text-slate-950">{formatPrice(item.value)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
