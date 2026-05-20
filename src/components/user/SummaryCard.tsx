import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface SummaryCardProps {
  title: string;
  value: string;
  description?: string;
  trend?: string;
  accent?: 'blue' | 'green' | 'red' | 'slate';
  icon?: ReactNode;
}

const accentClasses = {
  blue: 'text-[#1565C0]',
  green: 'text-emerald-600',
  red: 'text-red-500',
  slate: 'text-slate-700',
};

export function SummaryCard({
  title,
  value,
  description,
  trend,
  accent = 'blue',
  icon,
}: SummaryCardProps) {
  return (
    <article className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-[#6C88A4]">{title}</p>
          <p className={cn('mt-1 text-lg font-extrabold', accentClasses[accent])}>
            {value}
          </p>
        </div>
        {icon ? (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F0F6FF] text-base">
            {icon}
          </div>
        ) : null}
      </div>
      {description ? <p className="mt-2 text-xs text-[#6C88A4]">{description}</p> : null}
      {trend ? <p className={cn('mt-1 text-xs font-bold', accentClasses[accent])}>{trend}</p> : null}
    </article>
  );
}
