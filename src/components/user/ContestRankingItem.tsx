import { Card } from '../common/Card';
import type { ContestRankingItem as ContestRankingItemType } from '../../types/contest';
import { cn } from '../../utils/cn';

interface ContestRankingItemProps {
  isMine?: boolean;
  item: ContestRankingItemType;
}

const rankIcons: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

function formatAmount(value: number) {
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';

  return `${sign}${Math.abs(value).toLocaleString('ko-KR')}원`;
}

function formatRate(value: number) {
  const sign = value > 0 ? '+' : '';

  return `${sign}${value.toFixed(1)}%`;
}

export function ContestRankingItem({ isMine = false, item }: ContestRankingItemProps) {
  const isProfit = item.profitRate >= 0;
  const content = (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-[#1565C0]',
            'bg-[#F0F6FF]',
          )}
        >
          {rankIcons[item.rank] ?? item.rank}
        </span>
        <div className="min-w-0">
          <p className={cn('truncate text-sm font-extrabold', isMine ? 'text-[#1565C0]' : 'text-slate-950')}>
            {item.nickname}
            {isMine ? <span className="ml-1 text-xs">(내 순위)</span> : null}
          </p>
          <p className="mt-1 text-xs font-bold text-[#6C88A4]">
            {formatAmount(item.profitAmount)}
          </p>
        </div>
      </div>
      <p
        className={cn(
          'shrink-0 text-sm font-extrabold',
          isProfit ? 'text-red-500' : 'text-blue-600',
        )}
      >
        {formatRate(item.profitRate)}
      </p>
    </div>
  );

  if (isMine) {
    return (
      <div className="-mx-4 border-y border-blue-200 bg-[#D7ECFF] px-4 py-2">
        <Card className="rounded-2xl border-blue-200 bg-white px-4 py-3">
          {content}
        </Card>
      </div>
    );
  }

  return (
    <Card className="rounded-2xl border-blue-100 bg-white px-4 py-3">
      {content}
    </Card>
  );
}
