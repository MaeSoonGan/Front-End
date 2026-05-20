import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

type InfoBoxVariant = 'success' | 'warning' | 'info';

interface InfoBoxProps {
  variant?: InfoBoxVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<InfoBoxVariant, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-orange-200 bg-orange-50 text-orange-500',
  info: 'border-blue-100 bg-[#E5F4FF] text-[#1565C0]',
};

export function InfoBox({ variant = 'info', children, className }: InfoBoxProps) {
  return (
    <div
      className={cn(
        'rounded-xl border px-4 py-3 text-xs leading-5',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </div>
  );
}
