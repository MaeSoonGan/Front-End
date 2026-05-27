import type { ReactNode } from 'react';
import { Card } from '../common/Card';

interface NotificationSectionProps {
  children: ReactNode;
  title: string;
}

export function NotificationSection({ children, title }: NotificationSectionProps) {
  return (
    <Card className="rounded-2xl border-blue-100 p-4">
      <h2 className="text-sm font-extrabold text-[#1565C0]">{title}</h2>
      <div className="mt-3 divide-y divide-blue-50 border-t border-blue-50">{children}</div>
    </Card>
  );
}
