import { useState, useRef, useEffect } from 'react';
import type { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { IconWrapper } from '@/components/ui/icon-wrapper';
import { cn } from '@/lib/utils';
import { statusClasses, STATUS_LABELS } from '@/lib/constants';

const STATUS_DOT: Record<Task['status'], string> = {
  todo: 'bg-sky-500',
  'in-progress': 'bg-amber-500',
  done: 'bg-green-500',
};

type Props = {
  availableTasks: Task[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
};

export function LinkedTasksPicker({ availableTasks, selectedIds, onChange, disabled = false }: Props) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  const selectedTasks = availableTasks.filter((t) => selectedIds.includes(t.id));
  const unlinkedTasks = availableTasks.filter((t) => !selectedIds.includes(t.id));
  const filteredOptions = search.trim()
    ? unlinkedTasks.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
    : unlinkedTasks;

  const addLink = (taskId: string) => {
    if (selectedIds.includes(taskId)) return;
    onChange([...selectedIds, taskId]);
    setSearch('');
    setOpen(false);
  };

  const removeLink = (taskId: string) => {
    onChange(selectedIds.filter((id) => id !== taskId));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-medium">Linked Tasks</label>
        {!disabled && unlinkedTasks.length > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen((v) => !v)}
          >
            Link task
          </Button>
        )}
      </div>

      {selectedTasks.length === 0 && !open && (
        <p className="text-sm text-muted-foreground">
          Link related tasks from this project.
        </p>
      )}

      {selectedTasks.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs"
            >
              <span className={cn('size-2 shrink-0 rounded-full', STATUS_DOT[task.status])} />
              <span className="max-w-56 truncate font-medium">{task.title}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeLink(task.id)}
                  className="ml-0.5 rounded-full text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={`Remove link to ${task.title}`}
                >
                  <IconWrapper name="X" className="size-3" tooltip={null} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {open && (
        <div
          ref={dropdownRef}
          className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3"
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            autoFocus
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
          />
          {filteredOptions.length === 0 ? (
            <p className="px-1 py-2 text-sm text-muted-foreground">
              {search.trim() ? 'No matching tasks' : 'All tasks are already linked'}
            </p>
          ) : (
            <ul className="max-h-48 overflow-y-auto">
              {filteredOptions.map((task) => (
                <li key={task.id}>
                  <button
                    type="button"
                    onClick={() => addLink(task.id)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-muted"
                  >
                    <span className={cn('size-2 shrink-0 rounded-full', STATUS_DOT[task.status])} />
                    <span className="flex-1 truncate">{task.title}</span>
                    <span
                      className={cn(
                        'ml-auto shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                        statusClasses[task.status],
                      )}
                    >
                      {STATUS_LABELS[task.status]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
