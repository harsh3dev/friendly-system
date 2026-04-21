import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function StatCard({ label, value, colorClass, icon }: {
  label: string; value: number; colorClass: string; icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className={cn('mb-2 flex items-center gap-1.5 text-xs font-medium', colorClass)}>
        {icon}{label}
      </div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}
