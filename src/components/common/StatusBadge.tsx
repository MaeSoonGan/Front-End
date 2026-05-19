import { cn } from '../../utils/cn';
import type { StatusTone } from '../../types/common';

interface StatusBadgeProps {
  children: React.ReactNode;
  tone?: StatusTone;
}

const toneClasses: Record<StatusTone, string> = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-rose-100 text-rose-700',
  info: 'bg-sky-100 text-sky-700',
};

export function StatusBadge({ children, tone = 'default' }: StatusBadgeProps) {
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-medium', toneClasses[tone])}>
      {children}
    </span>
  );
}
