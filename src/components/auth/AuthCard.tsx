import type { ReactNode } from 'react';
import { Card } from '../common/Card';

interface AuthCardProps {
  title: string;
  children?: ReactNode;
}

export function AuthCard({ title, children }: AuthCardProps) {
  return (
    <Card className="w-full max-w-md">
      <h1 className="text-xl font-bold text-slate-950">{title}</h1>
      <div className="mt-6">{children}</div>
    </Card>
  );
}
