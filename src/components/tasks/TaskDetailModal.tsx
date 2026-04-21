import type { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { IconWrapper } from '@/components/ui/icon-wrapper';
import { cn } from '@/lib/utils';
import { formatDate, isOverdue } from '@/lib/task-helpers';
import { priorityClasses, statusClasses, STATUS_LABELS } from '@/lib/constants';

const formatIsoDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

type Props = {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
};

export function TaskDetailModal({ task, onEdit, onDelete, onClose }: Props) {
  const overdue = isOverdue(task.dueDate, task.status);
  const done = task.status === 'done';

  return (
    <Modal onClose={onClose} className="max-w-lg">
      {close => (
        <div className="w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl">
          <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
            <div className="flex min-w-0 flex-col gap-1.5">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Task Detail</p>
              <h2 className={cn('font-semibold text-lg leading-snug', done && 'line-through text-muted-foreground')}>
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
            <Button variant="ghost" size="icon-sm" onClick={close} type="button" className="shrink-0">
              <IconWrapper name="X" className="size-4" tooltip={null} />
            </Button>
          </div>

          <div className="flex flex-col gap-4 p-5">
            {task.description ? (
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Description</p>
                <p className="text-sm text-foreground leading-relaxed">{task.description}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No description provided.</p>
            )}

            <div className="grid grid-cols-2 gap-4">
              {task.dueDate && (
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Due Date</p>
                  <p className={cn('text-sm font-medium', overdue ? 'text-destructive' : 'text-foreground')}>
                    {overdue && '⚠ '}{formatDate(task.dueDate)}
                  </p>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Created</p>
                <p className="text-sm text-foreground">{formatIsoDate(task.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 border-t border-border px-5 py-4">
            <Button
              className="flex-1"
              onClick={() => { close(); setTimeout(onEdit, 200); }}
            >
              <IconWrapper name="Pencil" className="size-4" tooltip={null} />
              Edit task
            </Button>
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
              onClick={() => { close(); setTimeout(onDelete, 200); }}
            >
              <IconWrapper name="Trash2" className="size-4" tooltip={null} />
              Delete
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
