import { Button } from '@/components/ui/button';
import { CircleToggle } from '@/components/ui/circle-toggle';
import { IconWrapper } from '@/components/ui/icon-wrapper';
import type { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatDate, isOverdue } from '@/lib/task-helpers';
import { priorityClasses } from '@/lib/constants';

export function TaskCardItem({ task, onToggle, onEdit, onDelete }: {
  task: Task; onToggle: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const overdue = isOverdue(task.dueDate, task.status);
  const done = task.status === 'done';
  return (
    <div className={cn(
      'group flex flex-col rounded-xl border border-border bg-card p-4 transition-opacity',
      done && 'opacity-60',
    )}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', priorityClasses[task.priority])}>
          {task.priority}
        </span>
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <Button variant="ghost" size="icon-xs" onClick={onEdit}>
            <IconWrapper name="Pencil" className="size-3.5" tooltip="Edit task" />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={onDelete} className="text-destructive hover:text-destructive">
            <IconWrapper name="Trash2" className="size-3.5" tooltip="Delete task" />
          </Button>
        </div>
      </div>
      <p className={cn('font-medium leading-snug', done && 'line-through text-muted-foreground')}>
        {task.title}
      </p>
      {task.description && (
        <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{task.description}</p>
      )}
      <div className="mt-auto flex items-center justify-between pt-4">
        {task.dueDate ? (
          <p className={cn('text-xs', overdue ? 'font-medium text-destructive' : 'text-muted-foreground')}>
            {overdue ? '⚠ ' : ''}{formatDate(task.dueDate)}
          </p>
        ) : <span />}
        <CircleToggle done={done} onClick={onToggle} />
      </div>
    </div>
  );
}
