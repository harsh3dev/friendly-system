import { useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import { useTheme } from '@/components/theme-provider';
import { useAppStore } from '@/store';
import type { Task, TaskFilters, ViewMode, Project } from '@/lib/types';
import type { TaskFormData } from '@/components/tasks/TaskModal';
import { TaskModal } from '@/components/tasks/TaskModal';
import { ProjectModal } from '@/components/projects/ProjectModal';
import { Button } from '@/components/ui/button';
import { IconWrapper } from '@/components/ui/icon-wrapper';
import { cn } from '@/lib/utils';

// ── helpers ───────────────────────────────────────────────────────────────────

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

// ── shared UI ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, colorClass, icon }: {
  label: string; value: number; colorClass: string; icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className={cn('mb-2 flex items-center gap-1.5 text-xs font-medium', colorClass)}>
        {icon}{label}
      </div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

function CircleToggle({ done, onClick }: { done: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={done ? 'Mark as pending' : 'Mark as complete'}
      className={cn(
        'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
        done ? 'border-green-500 bg-green-500 text-white' : 'border-muted-foreground hover:border-primary',
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

function DeleteDialog({ message, onConfirm, onCancel }: {
  message: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-20 grid place-items-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl">
        <h2 className="font-semibold text-lg">Delete {message}?</h2>
        <p className="mt-1 text-sm text-muted-foreground">This action cannot be undone.</p>
        <div className="mt-5 flex gap-2">
          <Button variant="destructive" onClick={onConfirm} className="flex-1">Delete</Button>
          <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        </div>
      </div>
    </div>
  );
}

// ThemeBtn reads its own useTheme so it stays reactive across any route
function ThemeBtn() {
  const { theme, setTheme } = useTheme();
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  return (
    <Button variant="ghost" size="icon-sm" onClick={() => setTheme(isDark ? 'light' : 'dark')}>
      <IconWrapper
        name={isDark ? 'Sun' : 'Moon'}
        className="size-4"
        tooltip={isDark ? 'Switch to light' : 'Switch to dark'}
      />
    </Button>
  );
}

// ── task components ───────────────────────────────────────────────────────────

function TaskListItem({ task, onToggle, onEdit, onDelete }: {
  task: Task; onToggle: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const overdue = isOverdue(task.dueDate, task.status);
  const done = task.status === 'completed';
  return (
    <div className={cn(
      'group flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-opacity',
      done && 'opacity-60',
    )}>
      <CircleToggle done={done} onClick={onToggle} />
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
        <Button variant="ghost" size="icon-xs" onClick={onEdit}>
          <IconWrapper name="Pencil" className="size-3.5" tooltip="Edit task" />
        </Button>
        <Button variant="ghost" size="icon-xs" onClick={onDelete} className="text-destructive hover:text-destructive">
          <IconWrapper name="Trash2" className="size-3.5" tooltip="Delete task" />
        </Button>
      </div>
    </div>
  );
}

function TaskCardItem({ task, onToggle, onEdit, onDelete }: {
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
          <Button variant="ghost" size="icon-xs" onClick={onEdit}>
            <IconWrapper name="Pencil" className="size-3.5" tooltip="Edit task" />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={onDelete} className="text-destructive hover:text-destructive">
            <IconWrapper name="Trash2" className="size-3.5" tooltip="Delete task" />
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
        <CircleToggle done={done} onClick={onToggle} />
      </div>
    </div>
  );
}

// ── project card ──────────────────────────────────────────────────────────────

function ProjectCard({ project, totalTasks, pendingTasks, onSelect, onEdit, onDelete }: {
  project: Project; totalTasks: number; pendingTasks: number;
  onSelect: () => void; onEdit: () => void; onDelete: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className="group relative flex cursor-pointer flex-col rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <IconWrapper name="FolderOpen" className="size-5 text-primary" tooltip={null} />
        </div>
        <div
          className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={e => e.stopPropagation()}
        >
          <Button variant="ghost" size="icon-xs" onClick={onEdit}>
            <IconWrapper name="Pencil" className="size-3.5" tooltip="Edit project" />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={onDelete} className="text-destructive hover:text-destructive">
            <IconWrapper name="Trash2" className="size-3.5" tooltip="Delete project" />
          </Button>
        </div>
      </div>

      <p className="font-semibold">{project.name}</p>
      {project.description && (
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
      )}

      <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
        <span>{totalTasks} {totalTasks === 1 ? 'task' : 'tasks'}</span>
        {pendingTasks > 0 && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            {pendingTasks} pending
          </span>
        )}
        {totalTasks > 0 && pendingTasks === 0 && (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700 dark:bg-green-950 dark:text-green-300">
            all done ✓
          </span>
        )}
      </div>
    </div>
  );
}

// ── filter bar ────────────────────────────────────────────────────────────────

function FilterBar({ filters, setFilters, viewMode, setViewMode }: {
  filters: TaskFilters;
  setFilters: (fn: (f: TaskFilters) => TaskFilters) => void;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative min-w-48 flex-1">
        {/* tooltip={null} renders the icon directly (no wrapper span) so absolute positioning works */}
        <IconWrapper
          name="Search"
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          tooltip={null}
        />
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
          {(['list', 'card'] as const).map(v => (
            <button
              key={v}
              onClick={() => setViewMode(v)}
              className={cn(
                'p-1.5 transition-colors',
                viewMode === v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
              )}
            >
              {v === 'list'
                ? <IconWrapper name="List" className="size-4" tooltip="List view" />
                : <IconWrapper name="LayoutGrid" className="size-4" tooltip="Card view" />
              }
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── projects list route ───────────────────────────────────────────────────────

function ProjectsView() {
  const navigate = useNavigate();
  const { projects, tasks, addProject, updateProject, deleteProject } = useAppStore();
  const [projectModal, setProjectModal] = useState<{ open: boolean; project?: Project }>({ open: false });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const projectStats = useMemo(() =>
    projects.map(p => {
      const ptasks = tasks.filter(t => t.projectId === p.id);
      return { id: p.id, total: ptasks.length, pending: ptasks.filter(t => t.status === 'pending').length };
    }),
    [projects, tasks],
  );

  const globalStats = useMemo(() => ({
    projects: projects.length,
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
  }), [projects, tasks]);

  function handleSaveProject(data: { name: string; description: string }) {
    if (projectModal.project) {
      updateProject(projectModal.project.id, data);
    } else {
      addProject(data);
    }
    setProjectModal({ open: false });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <IconWrapper name="CheckSquare" className="size-5 text-primary" tooltip={null} />
            TaskFlow
          </div>
          <div className="flex items-center gap-2">
            <ThemeBtn />
            <Button size="sm" onClick={() => setProjectModal({ open: true })}>
              <IconWrapper name="Plus" className="size-4" tooltip={null} />
              New Project
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-5 px-4 py-6">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <StatCard label="Projects" value={globalStats.projects} colorClass="text-foreground" icon={<IconWrapper name="Layers" className="size-3.5" tooltip={null} />} />
          <StatCard label="Total Tasks" value={globalStats.total} colorClass="text-foreground" icon={<IconWrapper name="ClipboardList" className="size-3.5" tooltip={null} />} />
          <StatCard label="Completed" value={globalStats.completed} colorClass="text-green-600 dark:text-green-400" icon={<IconWrapper name="CheckSquare" className="size-3.5" tooltip={null} />} />
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
            <div className="text-5xl">🗂️</div>
            <p className="font-semibold text-lg">No projects yet</p>
            <p className="text-sm text-muted-foreground">Create your first project to start managing tasks</p>
            <Button className="mt-2" onClick={() => setProjectModal({ open: true })}>
              <IconWrapper name="Plus" className="size-4" tooltip={null} />
              New Project
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map(project => {
              const s = projectStats.find(x => x.id === project.id)!;
              return (
                <ProjectCard
                  key={project.id}
                  project={project}
                  totalTasks={s.total}
                  pendingTasks={s.pending}
                  onSelect={() => navigate(`/projects/${project.id}`)}
                  onEdit={() => setProjectModal({ open: true, project })}
                  onDelete={() => setDeleteConfirm(project.id)}
                />
              );
            })}
          </div>
        )}
      </main>

      {projectModal.open && (
        <ProjectModal
          project={projectModal.project}
          onSubmit={handleSaveProject}
          onClose={() => setProjectModal({ open: false })}
        />
      )}
      {deleteConfirm && (
        <DeleteDialog
          message="project and all its tasks"
          onConfirm={() => { deleteProject(deleteConfirm); setDeleteConfirm(null); }}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}

// ── project detail route ──────────────────────────────────────────────────────

function ProjectDetailView() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, tasks, addTask, updateTask, toggleTask, deleteTask } = useAppStore();
  const [filters, setFilters] = useState<TaskFilters>({ search: '', status: 'all', priority: 'all' });
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [taskModal, setTaskModal] = useState<{ open: boolean; task?: Task }>({ open: false });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const currentProject = projects.find(p => p.id === projectId);

  const projectTasks = useMemo(() =>
    tasks.filter(t => t.projectId === projectId),
    [tasks, projectId],
  );

  const projectTaskStats = useMemo(() => ({
    total: projectTasks.length,
    pending: projectTasks.filter(t => t.status === 'pending').length,
    completed: projectTasks.filter(t => t.status === 'completed').length,
  }), [projectTasks]);

  const filteredTasks = useMemo(() => projectTasks.filter(task => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!task.title.toLowerCase().includes(q) && !task.description.toLowerCase().includes(q)) return false;
    }
    if (filters.status !== 'all' && task.status !== filters.status) return false;
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    return true;
  }), [projectTasks, filters]);

  const hasFilters = filters.search !== '' || filters.status !== 'all' || filters.priority !== 'all';

  if (!currentProject) return <Navigate to="/" replace />;

  function handleSaveTask(data: TaskFormData) {
    if (taskModal.task) {
      updateTask(taskModal.task.id, data);
    } else if (projectId) {
      addTask({ projectId, ...data });
    }
    setTaskModal({ open: false });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
          <Button variant="ghost" size="icon-sm" onClick={() => navigate('/')}>
            <IconWrapper name="ArrowLeft" className="size-4" tooltip="Back to projects" />
          </Button>
          <span className="flex-1 truncate font-semibold">{currentProject.name}</span>
          <ThemeBtn />
          <Button size="sm" onClick={() => setTaskModal({ open: true })}>
            <IconWrapper name="Plus" className="size-4" tooltip={null} />
            New Task
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-5 px-4 py-6">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <StatCard label="Total Tasks" value={projectTaskStats.total} colorClass="text-foreground" icon={<IconWrapper name="ClipboardList" className="size-3.5" tooltip={null} />} />
          <StatCard label="Pending" value={projectTaskStats.pending} colorClass="text-amber-600 dark:text-amber-400" icon={<IconWrapper name="Clock" className="size-3.5" tooltip={null} />} />
          <StatCard label="Completed" value={projectTaskStats.completed} colorClass="text-green-600 dark:text-green-400" icon={<IconWrapper name="CheckSquare" className="size-3.5" tooltip={null} />} />
        </div>

        <FilterBar filters={filters} setFilters={setFilters} viewMode={viewMode} setViewMode={setViewMode} />

        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
            <div className="text-5xl">📋</div>
            <p className="font-semibold text-lg">
              {hasFilters ? 'No tasks match your filters' : 'No tasks yet'}
            </p>
            <p className="text-sm text-muted-foreground">
              {hasFilters ? 'Try adjusting your search or filters' : 'Add your first task to this project'}
            </p>
            {!hasFilters && (
              <Button className="mt-2" onClick={() => setTaskModal({ open: true })}>
                <IconWrapper name="Plus" className="size-4" tooltip={null} />
                New Task
              </Button>
            )}
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-2">
            {filteredTasks.map(task => (
              <TaskListItem
                key={task.id}
                task={task}
                onToggle={() => toggleTask(task.id)}
                onEdit={() => setTaskModal({ open: true, task })}
                onDelete={() => setDeleteConfirm(task.id)}
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTasks.map(task => (
              <TaskCardItem
                key={task.id}
                task={task}
                onToggle={() => toggleTask(task.id)}
                onEdit={() => setTaskModal({ open: true, task })}
                onDelete={() => setDeleteConfirm(task.id)}
              />
            ))}
          </div>
        )}
      </main>

      {taskModal.open && (
        <TaskModal
          task={taskModal.task}
          onSubmit={handleSaveTask}
          onClose={() => setTaskModal({ open: false })}
        />
      )}
      {deleteConfirm && (
        <DeleteDialog
          message="task"
          onConfirm={() => { deleteTask(deleteConfirm); setDeleteConfirm(null); }}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}

// ── router ────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ProjectsView />} />
      <Route path="/projects/:projectId" element={<ProjectDetailView />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
