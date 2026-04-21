import { useState } from 'react';
import type { DragEvent } from 'react';
import type { Task, Status } from '@/lib/types';
import { KanbanCard } from './KanbanCard';
import { cn } from '@/lib/utils';
import { KANBAN_COLUMNS } from '@/lib/constants';

export const KanbanBoard = ({ tasks, onEdit, onDelete, onView, onStatusChange, highlightedTaskId, readOnly = false }: {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onView: (task: Task) => void;
  onStatusChange: (taskId: string, status: Status) => void;
  highlightedTaskId?: string | null;
  readOnly?: boolean;
}) => {
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<Status | null>(null);

  const handleDragEnd = () => {
    setDragTaskId(null);
    setDragOverCol(null);
  };

  const handleDragOver = (colStatus: Status) => (e: DragEvent) => {
    if (readOnly) return;
    e.preventDefault();
    setDragOverCol(colStatus);
  };

  const handleDrop = (colStatus: Status) => (e: DragEvent) => {
    if (readOnly) return;
    e.preventDefault();
    if (dragTaskId) {
      const task = tasks.find(t => t.id === dragTaskId);
      if (task && task.status !== colStatus) onStatusChange(dragTaskId, colStatus);
    }
    setDragTaskId(null);
    setDragOverCol(null);
  };

  const handleDragStart = (taskId: string) => {
    if (readOnly) return;
    setDragTaskId(taskId);
  };

  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      onDragEnd={handleDragEnd}
    >
      {KANBAN_COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.status);
        const isOver = dragOverCol === col.status;
        return (
          <div
            key={col.status}
            onDragOver={handleDragOver(col.status)}
            onDrop={handleDrop(col.status)}
            className={cn(
              'flex flex-col gap-2 rounded-xl border p-3 transition-colors',
              isOver ? 'border-primary bg-primary/5' : 'border-border bg-muted/30',
            )}
          >
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className={cn('size-2 rounded-full', col.dotClass)} />
                <span className={cn('text-sm font-semibold', col.headerClass)}>{col.label}</span>
              </div>
              <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums', col.countClass)}>
                {colTasks.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {colTasks.map(task => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  readOnly={readOnly}
                  highlighted={task.id === highlightedTaskId}
                  onDragStart={() => handleDragStart(task.id)}
                  onEdit={() => onEdit(task)}
                  onDelete={() => onDelete(task.id)}
                  onView={() => onView(task)}
                />
              ))}
            </div>
            {colTasks.length === 0 && (
              <div className={cn(
                'flex min-h-24 items-center justify-center rounded-lg border-2 border-dashed text-xs',
                isOver ? 'border-primary text-primary' : 'border-border text-muted-foreground',
              )}>
                {isOver ? 'Drop here' : 'No tasks'}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
