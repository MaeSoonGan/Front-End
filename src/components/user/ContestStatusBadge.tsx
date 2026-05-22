import type { ContestStatus } from '../../types/contest';
import { cn } from '../../utils/cn';

const statusText: Record<ContestStatus, string> = {
  ACTIVE: '진행중',
  SCHEDULED: '예정',
  ENDED: '종료',
};

const statusClasses: Record<ContestStatus, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-600',
  SCHEDULED: 'bg-[#E5F4FF] text-[#1565C0]',
  ENDED: 'bg-slate-100 text-slate-500',
};

interface ContestStatusBadgeProps {
  status: ContestStatus;
}

export function ContestStatusBadge({ status }: ContestStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-extrabold',
        statusClasses[status],
      )}
    >
      <span
        className={cn(
          'mr-1.5 h-1.5 w-1.5 rounded-full',
          status === 'ACTIVE' && 'bg-emerald-500',
          status === 'SCHEDULED' && 'bg-[#1565C0]',
          status === 'ENDED' && 'bg-slate-400',
        )}
      />
      {statusText[status]}
    </span>
  );
}
