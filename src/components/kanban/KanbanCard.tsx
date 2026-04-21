import { Button } from '@/components/ui/button';
import { IconWrapper } from '@/components/ui/icon-wrapper';
import type { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatDate, isOverdue } from '@/lib/task-helpers';
import { priorityClasses } from '@/lib/constants';

export function KanbanCard({ task, onDragStart, onEdit, onDelete, onView, highlighted, readOnly = false }: {
  task: Task; onDragStart: () => void; onEdit: () => void; onDelete: () => void; onView: () => void; highlighted?: boolean; readOnly?: boolean;
}) {
  const overdue = isOverdue(task.dueDate, task.status);
  return (
    <div
      data-task-id={task.id}
      draggable={!readOnly}
      onDragStart={() => {
        if (!readOnly) onDragStart();
      }}
      onClick={onView}
      onKeyDown={e => e.key === 'Enter' && onView()}
      role="button"
      tabIndex={0}
      className={cn(
        'group select-none rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md',
        readOnly ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing active:opacity-60',
        highlighted && 'ring-2 ring-primary/60 border-primary/50 [animation:task-highlight_1.4s_ease-out]',
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', priorityClasses[task.priority])}>
          {task.priority}
        </span>
        {!readOnly && (
          <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <Button variant="ghost" size="icon-xs" onClick={e => { e.stopPropagation(); onEdit(); }}>
              <IconWrapper name="Pencil" className="size-3.5" tooltip="Edit" />
            </Button>
            <Button variant="ghost" size="icon-xs" onClick={e => { e.stopPropagation(); onDelete(); }} className="text-destructive hover:text-destructive">
              <IconWrapper name="Trash2" className="size-3.5" tooltip="Delete" />
            </Button>
          </div>
        )}
      </div>
      <p className="text-sm font-medium leading-snug">{task.title}</p>
      {task.description && (
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
      )}
      {task.dueDate && (
        <p className={cn('mt-2 text-xs', overdue ? 'font-medium text-destructive' : 'text-muted-foreground')}>
          {overdue ? '⚠ ' : ''}{formatDate(task.dueDate)}
        </p>
      )}
    </div>
  );
}
