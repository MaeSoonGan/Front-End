import type { BalanceSummary } from '../../types/balance';

interface BalanceSummaryCardProps {
  summary: BalanceSummary;
}

function formatWon(value: number) {
  return `${value.toLocaleString('ko-KR')}원`;
}

function formatSignedWon(value: number) {
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  return `${sign}${Math.abs(Math.round(value)).toLocaleString('ko-KR')}원`;
}

function formatSignedRate(value: number) {
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  return `${sign}${Math.abs(value).toFixed(2)}%`;
}

export function BalanceSummaryCard({ summary }: BalanceSummaryCardProps) {
  const isUp = summary.profitAmount >= 0;
  // 주식평가 = 총평가금액 - 예수금 (총평가금액이 live로 재계산되므로 실시간 반영)
  const stockEvaluation = summary.totalEvaluation - summary.deposit;
  return (
    <section className="rounded-2xl bg-gradient-to-br from-[#1565C0] to-[#4F8ED9] p-5 text-white shadow-sm">
      <p className="text-xs font-bold text-blue-100">총 평가금액</p>
      <p className="mt-2 text-2xl font-extrabold">{formatWon(summary.totalEvaluation)}</p>
      <p className="mt-1 text-xs font-extrabold text-blue-100">
        {isUp ? '▲' : '▼'} {formatSignedWon(summary.profitAmount)} ({formatSignedRate(summary.profitRate)})
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/15 p-3">
          <p className="text-xs text-blue-100">예수금</p>
          <p className="mt-1 text-sm font-extrabold">{formatWon(summary.deposit)}</p>
        </div>
        <div className="rounded-xl bg-white/15 p-3">
          <p className="text-xs text-blue-100">주식평가</p>
          <p className="mt-1 text-sm font-extrabold">{formatWon(stockEvaluation)}</p>
        </div>
      </div>
    </section>
  );
}
