import type { ContestTopRanker } from '../../types/contest';
import { cn } from '../../utils/cn';

interface ContestTopRankListProps {
  title?: string;
  topRankers: ContestTopRanker[];
}

const rankIcons: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

function formatRate(value: number) {
  const sign = value > 0 ? '+' : '';

  return `${sign}${value.toFixed(1)}%`;
}

export function ContestTopRankList({ title = '현재 순위 TOP 3', topRankers }: ContestTopRankListProps) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-extrabold text-[#1565C0]">{title}</h3>
      <div className="space-y-1.5">
        {topRankers.map((ranker) => (
          <div className="flex items-center justify-between gap-3" key={ranker.rank}>
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center text-xs">
                {rankIcons[ranker.rank] ?? ranker.rank}
              </span>
              <span className="truncate text-xs font-extrabold text-slate-950">
                {ranker.nickname}
              </span>
            </div>
            <span
              className={cn(
                'shrink-0 text-xs font-extrabold',
                ranker.profitRate >= 0 ? 'text-red-500' : 'text-blue-600',
              )}
            >
              {formatRate(ranker.profitRate)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
