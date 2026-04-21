import { useEffect, useState, type FormEvent } from 'react';
import type { Priority, Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  normalizeTaskLinks,
  richTextToPlainText,
  truncateRichText,
} from '@/lib/task-content';
import { RichTextEditor } from './RichTextEditor';
import { LinkedTasksPicker } from './LinkedTasksPicker';

export type TaskFormData = Pick<Task, 'title' | 'description' | 'links' | 'linkedTaskIds' | 'priority' | 'dueDate'>;

const DESCRIPTION_CHAR_LIMIT = 1000;

type Props = {
  task?: Task;
  availableTasks?: Task[];
  submitLabel: string;
  onSubmit: (data: TaskFormData) => void;
  onCancel?: () => void;
  layout?: 'modal' | 'page';
  disabled?: boolean;
};

export function TaskEditorForm({
  task,
  availableTasks = [],
  submitLabel,
  onSubmit,
  onCancel,
  layout = 'modal',
  disabled = false,
}: Props) {
  const [form, setForm] = useState({
    title: task?.title ?? '',
    description: task?.description ?? '',
    links: task?.links ?? [],
    linkedTaskIds: task?.linkedTaskIds ?? [],
    priority: (task?.priority ?? 'medium') as Priority,
    dueDate: task?.dueDate ?? '',
  });
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');

  useEffect(() => {
    setForm({
      title: task?.title ?? '',
      description: task?.description ?? '',
      links: task?.links ?? [],
      linkedTaskIds: task?.linkedTaskIds ?? [],
      priority: (task?.priority ?? 'medium') as Priority,
      dueDate: task?.dueDate ?? '',
    });
    setTitleError('');
    setDescriptionError('');
  }, [task]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setTitleError('Title is required');
      return;
    }

    const descriptionLength = richTextToPlainText(form.description).length;
    if (descriptionLength > DESCRIPTION_CHAR_LIMIT) {
      setDescriptionError(`Description must be ${DESCRIPTION_CHAR_LIMIT} characters or less`);
      return;
    }

    onSubmit({
      title: form.title.trim(),
      description: truncateRichText(form.description, DESCRIPTION_CHAR_LIMIT),
      links: normalizeTaskLinks(form.links),
      linkedTaskIds: form.linkedTaskIds,
      priority: form.priority,
      dueDate: form.dueDate,
    });
  };

  const descriptionLength = richTextToPlainText(form.description).length;

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
        <RichTextEditor
          id="task-desc"
          value={form.description}
          disabled={disabled}
          maxHeightClassName={
            layout === 'modal' ? 'max-h-[min(15rem,36vh)]' : 'max-h-[min(22rem,45vh)]'
          }
          onChange={(description) => {
            const trimmedDescription = truncateRichText(description, DESCRIPTION_CHAR_LIMIT);
            const nextLength = richTextToPlainText(description).length;

            setDescriptionError(
              nextLength > DESCRIPTION_CHAR_LIMIT
                ? `Description was trimmed to ${DESCRIPTION_CHAR_LIMIT} characters`
                : '',
            );
            setForm((f) => ({ ...f, description: trimmedDescription }));
          }}
          placeholder="Context, expected output, notes..."
          minHeightClassName={layout === 'page' ? 'min-h-52' : 'min-h-36'}
        />
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className={cn(descriptionError ? 'text-destructive' : 'text-muted-foreground')}>
            {descriptionError || 'Use up to 1000 characters.'}
          </span>
          <span className={cn(descriptionLength > DESCRIPTION_CHAR_LIMIT ? 'text-destructive' : 'text-muted-foreground')}>
            {descriptionLength}/{DESCRIPTION_CHAR_LIMIT}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <label className="text-sm font-medium">Useful Links</label>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() =>
              setForm((f) => ({
                ...f,
                links: [...f.links, { id: crypto.randomUUID(), label: '', url: '' }],
              }))
            }
          >
            Add link
          </Button>
        </div>

        {form.links.length === 0 ? (
          <p className="text-sm text-muted-foreground">Add references, docs, tickets, or other task resources.</p>
        ) : (
          <div className="space-y-3">
            {form.links.map((link, index) => (
              <div key={link.id} className="grid gap-3 rounded-2xl border border-border bg-card/60 p-3 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_auto]">
                <input
                  type="text"
                  disabled={disabled}
                  value={link.label}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      links: f.links.map((entry) =>
                        entry.id === link.id ? { ...entry, label: e.target.value } : entry,
                      ),
                    }))
                  }
                  placeholder={`Link ${index + 1} label`}
                  className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
                />
                <input
                  type="url"
                  disabled={disabled}
                  value={link.url}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      links: f.links.map((entry) =>
                        entry.id === link.id ? { ...entry, url: e.target.value } : entry,
                      ),
                    }))
                  }
                  placeholder="https://example.com"
                  className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
                />
                <Button
                  type="button"
                  variant="ghost"
                  disabled={disabled}
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      links: f.links.filter((entry) => entry.id !== link.id),
                    }))
                  }
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {availableTasks.length > 0 && (
        <LinkedTasksPicker
          availableTasks={availableTasks}
          selectedIds={form.linkedTaskIds}
          onChange={(linkedTaskIds) => setForm((f) => ({ ...f, linkedTaskIds }))}
          disabled={disabled}
        />
      )}

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
