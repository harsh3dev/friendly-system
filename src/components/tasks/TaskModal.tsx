import { useState, type FormEvent } from 'react';
import type { Task, Priority } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

type TaskFormData = Omit<Task, 'id' | 'createdAt' | 'status'>;

type Props = {
  task?: Task;
  onSubmit: (data: TaskFormData) => void;
  onClose: () => void;
};

export function TaskModal({ task, onSubmit, onClose }: Props) {
  const [form, setForm] = useState({
    title: task?.title ?? '',
    description: task?.description ?? '',
    priority: (task?.priority ?? 'medium') as Priority,
    dueDate: task?.dueDate ?? '',
  });
  const [titleError, setTitleError] = useState('');

  function handleSubmit(e: FormEvent) {
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
  }

  return (
    <div
      className="fixed inset-0 z-20 grid place-items-center bg-black/50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              {task ? 'Edit task' : 'New task'}
            </p>
            <h2 className="font-semibold text-lg">
              {task ? 'Update task details' : 'Create a new task'}
            </h2>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose} type="button">
            <X className="size-4" />
          </Button>
        </div>

        <form className="flex flex-col gap-4 p-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="task-title" className="text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              value={form.title}
              onChange={e => {
                setTitleError('');
                setForm(f => ({ ...f, title: e.target.value }));
              }}
              placeholder="e.g. Draft API release notes"
              className={cn(
                'rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-colors',
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
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Context, expected output, notes..."
              rows={3}
              className="resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="task-priority" className="text-sm font-medium">
                Priority
              </label>
              <select
                id="task-priority"
                value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}
                className="cursor-pointer rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
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
                value={form.dueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="submit" className="flex-1">
              {task ? 'Save changes' : 'Create task'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
