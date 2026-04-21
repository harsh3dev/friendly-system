import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function StatCard({ label, value, colorClass, icon }: {
  label: string; value: number; colorClass: string; icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
      <div className={cn('mb-1.5 flex items-center gap-1 text-xs font-medium sm:mb-2 sm:gap-1.5', colorClass)}>
        <span className="hidden sm:inline">{icon}</span>{label}
      </div>
      <div className="text-xl font-bold tabular-nums sm:text-2xl">{value}</div>
    </div>
  );
}
