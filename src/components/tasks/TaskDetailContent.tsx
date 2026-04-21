import { useMemo } from 'react';
import type { HistoryEventType, Task } from '@/lib/types';
import { useAppStore } from '@/store';
import { IconWrapper } from '@/components/ui/icon-wrapper';
import { cn } from '@/lib/utils';
import { formatDate, formatRelative } from '@/lib/task-helpers';
import { STATUS_LABELS } from '@/lib/constants';

const formatIsoDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

type EventIconName = 'CircleDot' | 'RefreshCw' | 'Flag' | 'Pencil' | 'Calendar';

const EVENT_ICON: Record<HistoryEventType, EventIconName> = {
  created: 'CircleDot',
  status_changed: 'RefreshCw',
  priority_changed: 'Flag',
  title_changed: 'Pencil',
  description_changed: 'Pencil',
  due_date_changed: 'Calendar',
};

const STATUS_LABEL: Record<string, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
};

function eventLabel(event: HistoryEventType, from?: string, to?: string): string {
  switch (event) {
    case 'created':
      return 'Task created';
    case 'status_changed':
      return `Status: ${STATUS_LABEL[from ?? ''] ?? from} -> ${STATUS_LABEL[to ?? ''] ?? to}`;
    case 'priority_changed':
      return `Priority: ${from} -> ${to}`;
    case 'title_changed':
      return 'Title changed';
    case 'description_changed':
      return 'Description updated';
    case 'due_date_changed':
      return `Due date: ${from ? formatDate(from) : 'none'} -> ${to ? formatDate(to) : 'none'}`;
  }
}

type Props = {
  task: Task;
  mode?: 'page' | 'modal';
};

export function TaskDetailContent({ task, mode = 'page' }: Props) {
  const taskHistory = useAppStore((s) => s.taskHistory);
  const history = useMemo(
    () =>
      taskHistory
        .filter((e) => e.taskId === task.id)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [taskHistory, task.id],
  );

  return (
    <aside
      className={cn(
        'overflow-hidden rounded-3xl border border-border bg-card shadow-sm',
        mode === 'page' && 'xl:sticky xl:top-20',
      )}
    >
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Timeline</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {STATUS_LABELS[task.status]} • Created {formatIsoDate(task.createdAt)}
        </p>
      </div>
      <div className={cn('px-5 py-5 sm:px-6', mode === 'page' ? 'max-h-[calc(100vh-10rem)] overflow-y-auto' : 'max-h-72 overflow-y-auto')}>
        {history.length === 0 ? (
          <p className="text-sm italic text-muted-foreground">No history yet.</p>
        ) : (
          <ol className="relative ml-1.5 flex flex-col gap-0 border-l border-border">
            {history.map((entry) => (
              <li key={entry.id} className="relative pb-5 pl-5 last:pb-0">
                <span className="absolute left-[-7px] top-0.5 flex size-3.5 items-center justify-center rounded-full border border-border bg-card">
                  <IconWrapper
                    name={EVENT_ICON[entry.event]}
                    className="size-2.5 text-muted-foreground"
                    tooltip={null}
                  />
                </span>
                <p className="text-sm leading-snug text-foreground">
                  {eventLabel(entry.event, entry.from, entry.to)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatRelative(entry.timestamp)}
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </aside>
  );
}
