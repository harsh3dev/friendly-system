import { useEffect, useState, type FormEvent } from 'react';
import type { Priority, Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type TaskFormData = Pick<Task, 'title' | 'description' | 'priority' | 'dueDate'>;

type Props = {
  task?: Task;
  submitLabel: string;
  onSubmit: (data: TaskFormData) => void;
  onCancel?: () => void;
  layout?: 'modal' | 'page';
  disabled?: boolean;
};

export function TaskEditorForm({
  task,
  submitLabel,
  onSubmit,
  onCancel,
  layout = 'modal',
  disabled = false,
}: Props) {
  const [form, setForm] = useState({
    title: task?.title ?? '',
    description: task?.description ?? '',
    priority: (task?.priority ?? 'medium') as Priority,
    dueDate: task?.dueDate ?? '',
  });
  const [titleError, setTitleError] = useState('');

  useEffect(() => {
    setForm({
      title: task?.title ?? '',
      description: task?.description ?? '',
      priority: (task?.priority ?? 'medium') as Priority,
      dueDate: task?.dueDate ?? '',
    });
    setTitleError('');
  }, [task]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setTitleError('Title is required');
      return;
    }

    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      dueDate: form.dueDate,
    });
  };

  return (
    <form className={cn('flex flex-col gap-4', layout === 'modal' ? 'p-5' : 'gap-5')} onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="task-title" className="text-sm font-medium">
          Title <span className="text-destructive">*</span>
        </label>
        <input
          id="task-title"
          type="text"
          disabled={disabled}
          value={form.title}
          onChange={e => {
            setTitleError('');
            setForm(f => ({ ...f, title: e.target.value }));
          }}
          placeholder="e.g. Draft API release notes"
          className={cn(
            'rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition-colors',
            'focus:border-primary focus:ring-1 focus:ring-primary/30',
            titleError ? 'border-destructive' : 'border-border',
          )}
        />
        {titleError && <p className="text-xs text-destructive">{titleError}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="task-desc" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="task-desc"
          disabled={disabled}
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Context, expected output, notes..."
          rows={layout === 'page' ? 6 : 3}
          className="resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
        />
      </div>

      <div className={cn('grid gap-4', layout === 'page' ? 'sm:grid-cols-3' : 'grid-cols-2')}>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="task-priority" className="text-sm font-medium">
            Priority
          </label>
          <select
            id="task-priority"
            disabled={disabled}
            value={form.priority}
            onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}
            className="cursor-pointer rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="task-due" className="text-sm font-medium">
            Due Date
          </label>
          <input
            id="task-due"
            type="date"
            disabled={disabled}
            value={form.dueDate}
            onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30 dark:scheme-dark"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <Button type="submit" disabled={disabled}>{submitLabel}</Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
