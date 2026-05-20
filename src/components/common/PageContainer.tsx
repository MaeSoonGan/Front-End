import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export function PageContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-4 pb-24 pt-4', className)} {...props} />;
}
