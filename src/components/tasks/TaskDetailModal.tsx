import { useMemo } from 'react';
import type { HistoryEventType, Task } from '@/lib/types';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { IconWrapper } from '@/components/ui/icon-wrapper';
import { cn } from '@/lib/utils';
import { formatDate, formatRelative, isOverdue } from '@/lib/task-helpers';
import { priorityClasses, statusClasses, STATUS_LABELS } from '@/lib/constants';
import { buttonVariants } from '@/components/ui/button-variants';
import { TaskRichContent } from './TaskRichContent';
import { LinkedTasksSection } from './LinkedTasksSection';

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
  projectTasks?: Task[];
  readOnly?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
};

export function TaskDetailModal({ task, projectTasks = [], readOnly = false, onEdit, onDelete, onClose }: Props) {
  const taskHistory = useAppStore((s) => s.taskHistory);
  const history = useMemo(
    () =>
      taskHistory
        .filter((e) => e.taskId === task.id)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [taskHistory, task.id],
  );

  const overdue = isOverdue(task.dueDate, task.status);
  const done = task.status === 'done';

  return (
    <Modal onClose={onClose} className="max-w-3xl">
      {(close) => (
        <div className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Task Detail</p>
            <div className="flex items-center gap-1">
              <a
                href={`/projects/${task.projectId}/tasks/${task.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
              >
                <IconWrapper name="ArrowUpRight" className="size-4" tooltip="Open in project" />
              </a>
              <Button variant="ghost" size="icon-sm" onClick={close} type="button">
                <IconWrapper name="X" className="size-4" tooltip={null} />
              </Button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
            <div className="min-h-0 overflow-y-auto p-5 sm:w-1/2 sm:border-r sm:border-border">
              <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <h2 className={cn('text-lg font-semibold leading-snug', done && 'line-through text-muted-foreground')}>
                  {task.title}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', priorityClasses[task.priority])}>
                    {task.priority} priority
                  </span>
                  <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', statusClasses[task.status])}>
                    {STATUS_LABELS[task.status]}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Description</p>
                <TaskRichContent description={task.description} links={task.links} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {task.dueDate && (
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Due Date</p>
                    <p className={cn('text-sm font-medium', overdue ? 'text-destructive' : 'text-foreground')}>
                      {overdue && '⚠ '}
                      {formatDate(task.dueDate)}
                    </p>
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Created</p>
                  <p className="text-sm text-foreground">{formatIsoDate(task.createdAt)}</p>
                </div>
              </div>

              {task.linkedTaskIds.length > 0 && (
                <LinkedTasksSection
                  linkedTaskIds={task.linkedTaskIds}
                  projectId={task.projectId}
                  allProjectTasks={projectTasks}
                  onNavigate={onClose}
                />
              )}
              </div>
            </div>

            <div className="flex min-h-0 flex-col sm:w-1/2">
              <div className="border-b border-border px-5 py-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Timeline</p>
              </div>
              <div className="flex min-h-0 flex-1 flex-col gap-0 overflow-y-auto px-5 py-3">
                {history.length === 0 ? (
                  <p className="text-sm italic text-muted-foreground">No history yet.</p>
                ) : (
                  <ol className="relative ml-1.5 flex flex-col gap-0 border-l border-border">
                    {history.map((entry) => (
                      <li key={entry.id} className="relative pb-4 pl-5 last:pb-0">
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
            </div>
          </div>

          {!readOnly && (
            <div className="flex gap-2 border-t border-border px-5 py-4">
              <Button
                className="flex-1"
                onClick={() => {
                  close();
                  setTimeout(onEdit, 200);
                }}
                type="button"
              >
                <IconWrapper name="Pencil" className="size-4" tooltip={null} />
                Edit task
              </Button>
              <Button
                variant="outline"
                className="border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
                onClick={() => {
                  close();
                  setTimeout(onDelete, 200);
                }}
                type="button"
              >
                <IconWrapper name="Trash2" className="size-4" tooltip={null} />
                Delete
              </Button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
