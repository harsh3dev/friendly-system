import { Button } from '@/components/ui/button';
import { CircleToggle } from '@/components/ui/circle-toggle';
import { IconWrapper } from '@/components/ui/icon-wrapper';
import type { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatDate, isOverdue } from '@/lib/task-helpers';
import { priorityClasses, statusClasses, STATUS_LABELS } from '@/lib/constants';
import { TaskRichContent } from './TaskRichContent';

export function TaskCardItem({ task, onToggle, onEdit, onDelete, onView, highlighted, readOnly = false }: {
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
        'group flex cursor-pointer flex-col rounded-xl border border-border bg-card p-4 transition-all hover:shadow-sm hover:border-primary/30',
        done && 'opacity-60',
        highlighted && 'ring-2 ring-primary/60 border-primary/50 [animation:task-highlight_1.4s_ease-out]',
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', priorityClasses[task.priority])}>
            {task.priority}
          </span>
          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', statusClasses[task.status])}>
            {STATUS_LABELS[task.status]}
          </span>
        </div>
        {!readOnly && (
          <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <Button variant="ghost" size="icon-xs" onClick={e => { e.stopPropagation(); onEdit(); }}>
              <IconWrapper name="Pencil" className="size-3.5" tooltip="Edit task" />
            </Button>
            <Button variant="ghost" size="icon-xs" onClick={e => { e.stopPropagation(); onDelete(); }} className="text-destructive hover:text-destructive">
              <IconWrapper name="Trash2" className="size-3.5" tooltip="Delete task" />
            </Button>
          </div>
        )}
      </div>
      <p className={cn('font-medium leading-snug', done && 'line-through text-muted-foreground')}>
        {task.title}
      </p>
      {(task.description || task.links.length > 0) && (
        <TaskRichContent className="mt-1" description={task.description} links={task.links} compact />
      )}
      <div className="mt-auto flex items-center justify-between pt-4">
        {task.dueDate ? (
          <p className={cn('text-xs', overdue ? 'font-medium text-destructive' : 'text-muted-foreground')}>
            {overdue ? '⚠ ' : ''}{formatDate(task.dueDate)}
          </p>
        ) : <span />}
        {!readOnly && <CircleToggle done={done} onClick={e => { e.stopPropagation(); onToggle(); }} />}
      </div>
    </div>
  );
}
