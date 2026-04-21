import { Button } from '@/components/ui/button';
import { CircleToggle } from '@/components/ui/circle-toggle';
import { IconWrapper } from '@/components/ui/icon-wrapper';
import type { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatDate, isOverdue } from '@/lib/task-helpers';
import { priorityClasses } from '@/lib/constants';

export function TaskListItem({ task, onToggle, onEdit, onDelete }: {
  task: Task; onToggle: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const overdue = isOverdue(task.dueDate, task.status);
  const done = task.status === 'done';
  return (
    <div className={cn(
      'group flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-opacity',
      done && 'opacity-60',
    )}>
      <CircleToggle done={done} onClick={onToggle} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={cn('font-medium', done && 'line-through text-muted-foreground')}>
            {task.title}
          </p>
          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', priorityClasses[task.priority])}>
            {task.priority}
          </span>
        </div>
        {task.description && (
          <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{task.description}</p>
        )}
        {task.dueDate && (
          <p className={cn('mt-1 text-xs', overdue ? 'font-medium text-destructive' : 'text-muted-foreground')}>
            {overdue ? 'Overdue · ' : 'Due '}{formatDate(task.dueDate)}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <Button variant="ghost" size="icon-xs" onClick={onEdit}>
          <IconWrapper name="Pencil" className="size-3.5" tooltip="Edit task" />
        </Button>
        <Button variant="ghost" size="icon-xs" onClick={onDelete} className="text-destructive hover:text-destructive">
          <IconWrapper name="Trash2" className="size-3.5" tooltip="Delete task" />
        </Button>
      </div>
    </div>
  );
}
