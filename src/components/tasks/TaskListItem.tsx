import { Button } from '@/components/ui/button';
import { CircleToggle } from '@/components/ui/circle-toggle';
import { IconWrapper } from '@/components/ui/icon-wrapper';
import type { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatDate, isOverdue } from '@/lib/task-helpers';
import { priorityClasses, statusClasses, STATUS_LABELS } from '@/lib/constants';
import { TaskRichContent } from './TaskRichContent';

export function TaskListItem({ task, onToggle, onEdit, onDelete, onView, highlighted, readOnly = false }: {
  task: Task; onToggle: () => void; onEdit: () => void; onDelete: () => void; onView: () => void; highlighted?: boolean; readOnly?: boolean;
}) {
  const overdue = isOverdue(task.dueDate, task.status);
  const done = task.status === 'done';
  return (
    <div
      data-task-id={task.id}
      role="button"
      tabIndex={0}
      onClick={onView}
      onKeyDown={e => e.key === 'Enter' && onView()}
      className={cn(
        'group flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-all hover:shadow-sm hover:border-primary/30',
        done && 'opacity-60',
        highlighted && 'ring-2 ring-primary/60 border-primary/50 [animation:task-highlight_1.4s_ease-out]',
      )}
    >
      {!readOnly && <CircleToggle done={done} onClick={e => { e.stopPropagation(); onToggle(); }} />}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={cn('font-medium', done && 'line-through text-muted-foreground')}>
            {task.title}
          </p>
          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', priorityClasses[task.priority])}>
            {task.priority}
          </span>
          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', statusClasses[task.status])}>
            {STATUS_LABELS[task.status]}
          </span>
        </div>
        {(task.description || task.links.length > 0) && (
          <TaskRichContent className="mt-0.5" description={task.description} links={task.links} compact />
        )}
        {task.dueDate && (
          <p className={cn('mt-1 text-xs', overdue ? 'font-medium text-destructive' : 'text-muted-foreground')}>
            {overdue ? 'Overdue · ' : 'Due '}{formatDate(task.dueDate)}
          </p>
        )}
      </div>
      {!readOnly && (
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <Button variant="ghost" size="icon-xs" onClick={e => { e.stopPropagation(); onEdit(); }}>
            <IconWrapper name="Pencil" className="size-3.5" tooltip="Edit task" />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={e => { e.stopPropagation(); onDelete(); }} className="text-destructive hover:text-destructive">
            <IconWrapper name="Trash2" className="size-3.5" tooltip="Delete task" />
          </Button>
        </div>
      )}
    </div>
  );
}
