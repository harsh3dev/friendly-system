import { useState, useMemo, useCallback } from 'react';
import {
  Moon, Sun, Plus, List, LayoutGrid,
  Search, Clock, CheckSquare, ClipboardList,
  Pencil, Trash2,
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { loadTasks, persistTasks } from '@/lib/storage';
import type { Task, TaskFilters, ViewMode } from '@/lib/types';
import { TaskModal } from '@/components/tasks/TaskModal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ── helpers ──────────────────────────────────────────────────────────────────

type TaskFormData = Omit<Task, 'id' | 'createdAt' | 'status'>;

const priorityClasses: Record<Task['priority'], string> = {
  high: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  low: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
};

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isOverdue(dateStr: string, status: Task['status']) {
  if (!dateStr || status === 'completed') return false;
  return new Date(dateStr) < new Date(new Date().toDateString());
}

// ── sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label, value, colorClass, icon,
}: {
  label: string; value: number; colorClass: string; icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className={cn('mb-2 flex items-center gap-1.5 text-xs font-medium', colorClass)}>
        {icon}
        {label}
      </div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

function CheckCircle({ done, onClick }: { done: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={done ? 'Mark as pending' : 'Mark as complete'}
      className={cn(
        'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
        done
          ? 'border-green-500 bg-green-500 text-white'
          : 'border-muted-foreground hover:border-primary',
      )}
    >
      {done && (
        <svg className="size-3" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

function TaskListItem({
  task, onToggle, onEdit, onDelete,
}: {
  task: Task; onToggle: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const overdue = isOverdue(task.dueDate, task.status);
  const done = task.status === 'completed';

  return (
    <div className={cn(
      'group flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-opacity',
      done && 'opacity-60',
    )}>
      <CheckCircle done={done} onClick={onToggle} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={cn('font-medium', done && 'line-through text-muted-foreground')}>
            {task.title}
          </p>
          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', priorityClasses[task.priority])}>
            {task.priority}
          </span>
        </div>
        {task.description && (
          <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{task.description}</p>
        )}
        {task.dueDate && (
          <p className={cn('mt-1 text-xs', overdue ? 'font-medium text-destructive' : 'text-muted-foreground')}>
            {overdue ? 'Overdue · ' : 'Due '}{formatDate(task.dueDate)}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <Button variant="ghost" size="icon-xs" onClick={onEdit} title="Edit task">
          <Pencil className="size-3.5" />
        </Button>
        <Button
          variant="ghost" size="icon-xs" onClick={onDelete} title="Delete task"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

function TaskCardItem({
  task, onToggle, onEdit, onDelete,
}: {
  task: Task; onToggle: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const overdue = isOverdue(task.dueDate, task.status);
  const done = task.status === 'completed';

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
          <Button variant="ghost" size="icon-xs" onClick={onEdit} title="Edit task">
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost" size="icon-xs" onClick={onDelete} title="Delete task"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
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
        <CheckCircle done={done} onClick={onToggle} />
      </div>
    </div>
  );
}

function EmptyState({ hasFilters, onNew }: { hasFilters: boolean; onNew: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
      <div className="text-5xl">📋</div>
      <p className="font-semibold text-lg">
        {hasFilters ? 'No tasks match your filters' : 'No tasks yet'}
      </p>
      <p className="text-sm text-muted-foreground">
        {hasFilters
          ? 'Try adjusting your search or filters'
          : 'Create your first task to get started'}
      </p>
      {!hasFilters && (
        <Button className="mt-2" onClick={onNew}>
          <Plus className="size-4" />
          New Task
        </Button>
      )}
    </div>
  );
}

function DeleteDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-20 grid place-items-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl">
        <h2 className="font-semibold text-lg">Delete task?</h2>
        <p className="mt-1 text-sm text-muted-foreground">This action cannot be undone.</p>
        <div className="mt-5 flex gap-2">
          <Button variant="destructive" onClick={onConfirm} className="flex-1">Delete</Button>
          <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        </div>
      </div>
    </div>
  );
}

// ── main app ──────────────────────────────────────────────────────────────────

export default function App() {
  const { theme, setTheme } = useTheme();
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [filters, setFilters] = useState<TaskFilters>({ search: '', status: 'all', priority: 'all' });
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [modalState, setModalState] = useState<{ open: boolean; task?: Task }>({ open: false });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const saveTasks = useCallback((next: Task[]) => {
    setTasks(next);
    persistTasks(next);
  }, []);

  const stats = useMemo(() => ({
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  }), [tasks]);

  const filtered = useMemo(() => tasks.filter(task => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!task.title.toLowerCase().includes(q) && !task.description.toLowerCase().includes(q)) return false;
    }
    if (filters.status !== 'all' && task.status !== filters.status) return false;
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    return true;
  }), [tasks, filters]);

  function handleSave(data: TaskFormData) {
    if (modalState.task) {
      saveTasks(tasks.map(t => t.id === modalState.task!.id ? { ...t, ...data } : t));
    } else {
      const task: Task = {
        ...data,
        id: crypto.randomUUID(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      saveTasks([...tasks, task]);
    }
    setModalState({ open: false });
  }

  function handleToggle(id: string) {
    saveTasks(tasks.map(t =>
      t.id === id ? { ...t, status: t.status === 'pending' ? 'completed' : 'pending' } : t,
    ));
  }

  function handleDelete(id: string) {
    saveTasks(tasks.filter(t => t.id !== id));
    setDeleteId(null);
  }

  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const hasFilters = filters.search !== '' || filters.status !== 'all' || filters.priority !== 'all';

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Header ── */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <CheckSquare className="size-5 text-primary" />
            TaskFlow
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost" size="icon-sm"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              title="Toggle theme"
            >
              {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <Button size="sm" onClick={() => setModalState({ open: true })}>
              <Plus className="size-4" />
              New Task
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-5 px-4 py-6">
        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <StatCard label="Total Tasks" value={stats.total} colorClass="text-foreground" icon={<ClipboardList className="size-3.5" />} />
          <StatCard label="Pending" value={stats.pending} colorClass="text-amber-600 dark:text-amber-400" icon={<Clock className="size-3.5" />} />
          <StatCard label="Completed" value={stats.completed} colorClass="text-green-600 dark:text-green-400" icon={<CheckSquare className="size-3.5" />} />
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative min-w-48 flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex overflow-hidden rounded-lg border border-border text-xs">
              {(['all', 'pending', 'completed'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFilters(f => ({ ...f, status: s }))}
                  className={cn(
                    'px-3 py-1.5 font-medium capitalize transition-colors',
                    filters.status === s
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted',
                  )}
                >
                  {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            <select
              value={filters.priority}
              onChange={e => setFilters(f => ({ ...f, priority: e.target.value as TaskFilters['priority'] }))}
              className="cursor-pointer rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <div className="flex overflow-hidden rounded-lg border border-border">
              <button
                onClick={() => setViewMode('list')}
                title="List view"
                className={cn(
                  'p-1.5 transition-colors',
                  viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
                )}
              >
                <List className="size-4" />
              </button>
              <button
                onClick={() => setViewMode('card')}
                title="Card view"
                className={cn(
                  'p-1.5 transition-colors',
                  viewMode === 'card' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
                )}
              >
                <LayoutGrid className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Task list / card grid ── */}
        {filtered.length === 0 ? (
          <EmptyState hasFilters={hasFilters} onNew={() => setModalState({ open: true })} />
        ) : viewMode === 'list' ? (
          <div className="space-y-2">
            {filtered.map(task => (
              <TaskListItem
                key={task.id}
                task={task}
                onToggle={() => handleToggle(task.id)}
                onEdit={() => setModalState({ open: true, task })}
                onDelete={() => setDeleteId(task.id)}
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(task => (
              <TaskCardItem
                key={task.id}
                task={task}
                onToggle={() => handleToggle(task.id)}
                onEdit={() => setModalState({ open: true, task })}
                onDelete={() => setDeleteId(task.id)}
              />
            ))}
          </div>
        )}
      </main>

      {modalState.open && (
        <TaskModal
          task={modalState.task}
          onSubmit={handleSave}
          onClose={() => setModalState({ open: false })}
        />
      )}

      {deleteId && (
        <DeleteDialog
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
