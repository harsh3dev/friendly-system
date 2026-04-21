import { useState } from 'react';
import type { Task, Status } from '@/lib/types';
import type { TaskFormData } from './TaskEditorForm';
import { Button } from '@/components/ui/button';
import { IconWrapper } from '@/components/ui/icon-wrapper';
import { cn } from '@/lib/utils';
import { formatDate, isOverdue } from '@/lib/task-helpers';
import { priorityClasses, statusClasses, STATUS_LABELS } from '@/lib/constants';
import { TaskDetailContent } from './TaskDetailContent';
import { TaskEditorForm } from './TaskEditorForm';

const STATUS_OPTIONS: Status[] = ['todo', 'in-progress', 'done'];

type Props = {
  task: Task;
  onBack: () => void;
  onDelete: () => void;
  onSave: (data: TaskFormData) => void;
  onStatusChange: (status: Status) => void;
};

export function TaskDetailPage({
  task,
  onBack,
  onDelete,
  onSave,
  onStatusChange,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 rounded-3xl border border-border/70 bg-gradient-to-br from-card via-card to-card/70 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <IconWrapper name="ArrowLeft" className="size-3.5" tooltip={null} />
                Project Tasks
              </button>
              <span className="text-border">/</span>
              <span>Task Details</span>
            </div>
            <div className="space-y-3">
              <h1 className={cn('text-3xl font-semibold tracking-tight sm:text-4xl', task.status === 'done' && 'text-muted-foreground')}>
                {task.title}
              </h1>
              <div className="flex flex-wrap gap-2">
                <span className={cn('rounded-full px-3 py-1 text-xs font-medium capitalize', priorityClasses[task.priority])}>
                  {task.priority} priority
                </span>
                <span className={cn('rounded-full px-3 py-1 text-xs font-medium', statusClasses[task.status])}>
                  {STATUS_LABELS[task.status]}
                </span>
                {task.dueDate && (
                  <span
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-medium',
                      overdue ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    Due {formatDate(task.dueDate)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} type="button">
                <IconWrapper name="Pencil" className="size-4" tooltip={null} />
                Edit task
              </Button>
            )}
            <Button
              variant="outline"
              className="border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
              onClick={onDelete}
              type="button"
            >
              <IconWrapper name="Trash2" className="size-4" tooltip={null} />
              Delete task
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onStatusChange(status)}
              className={cn(
                'rounded-2xl border px-4 py-3 text-left transition-colors',
                task.status === status
                  ? 'border-primary/40 bg-primary/8'
                  : 'border-border bg-background/50 hover:border-primary/20 hover:bg-background',
              )}
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Status</p>
              <p className="mt-2 text-base font-semibold text-foreground">{STATUS_LABELS[status]}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_380px]">
        <section className="space-y-6">
          {isEditing ? (
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-7">
              <div className="mb-5 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Edit Task</p>
                <h2 className="text-2xl font-semibold tracking-tight">Update task details</h2>
              </div>
              <TaskEditorForm
                task={task}
                layout="page"
                submitLabel="Save changes"
                onSubmit={(data) => {
                  onSave(data);
                  setIsEditing(false);
                }}
                onCancel={() => setIsEditing(false)}
              />
            </div>
          ) : (
            <div className="grid gap-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Created</p>
                  <p className="mt-3 text-2xl font-semibold">
                    {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Deadline</p>
                  <p className={cn('mt-3 text-2xl font-semibold', overdue && 'text-destructive')}>
                    {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Description</p>
                {task.description ? (
                  <p className="mt-4 whitespace-pre-wrap text-base leading-8 text-foreground">{task.description}</p>
                ) : (
                  <p className="mt-4 text-base italic text-muted-foreground">No description provided.</p>
                )}
              </div>
            </div>
          )}
        </section>

        <TaskDetailContent task={task} mode="page" />
      </div>
    </div>
  );
}
