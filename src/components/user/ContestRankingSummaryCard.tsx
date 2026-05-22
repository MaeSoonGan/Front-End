import type { ContestMyRanking } from '../../types/contest';

interface ContestRankingSummaryCardProps {
  myRanking: ContestMyRanking;
  totalParticipants: number;
}

function formatAmount(value: number) {
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';

  return `${sign}${Math.abs(value).toLocaleString('ko-KR')}원`;
}

function formatRate(value: number) {
  const sign = value > 0 ? '+' : '';

  return `${sign}${value.toFixed(1)}%`;
}

export function ContestRankingSummaryCard({
  myRanking,
  totalParticipants,
}: ContestRankingSummaryCardProps) {
  return (
    <section className="rounded-2xl bg-gradient-to-br from-[#1565C0] to-[#4F8ED9] p-5 text-white shadow-sm">
      {/* TODO: GET /api/contests/{contestId}/ranking/me 연동 후 서버 데이터로 교체합니다. */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-blue-100">내 현재 순위</p>
          <p className="mt-3 text-3xl font-extrabold leading-none">
            {myRanking.rank > 0 ? `${myRanking.rank}위` : '-'}
            <span className="ml-2 text-sm font-bold text-blue-100">
              / {totalParticipants.toLocaleString('ko-KR')}명
            </span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-extrabold">{formatRate(myRanking.profitRate)}</p>
          <p className="mt-2 text-xs font-bold text-blue-100">
            {formatAmount(myRanking.profitAmount)}
          </p>
        </div>
      </div>
    </section>
  );
}
