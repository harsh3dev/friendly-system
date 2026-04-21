import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project, Task, Status, TaskHistoryEntry, HistoryEventType } from '@/lib/types';

type TaskInput = Pick<Task, 'title' | 'description' | 'priority' | 'dueDate'>;
type ProjectInput = Pick<Project, 'name' | 'description'>;

interface AppState {
  projects: Project[];
  tasks: Task[];
  taskHistory: TaskHistoryEntry[];

  addProject: (data: ProjectInput) => void;
  updateProject: (id: string, data: ProjectInput) => void;
  deleteProject: (id: string) => void;

  addTask: (data: TaskInput & { projectId: string }) => void;
  updateTask: (id: string, data: TaskInput) => void;
  updateTaskStatus: (id: string, status: Status) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
}

const makeEntry = (
  taskId: string,
  event: HistoryEventType,
  from?: string,
  to?: string,
): TaskHistoryEntry => ({
  id: crypto.randomUUID(),
  taskId,
  event,
  timestamp: new Date().toISOString(),
  from,
  to,
});

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      projects: [],
      tasks: [],
      taskHistory: [],

      addProject: (data) =>
        set((s) => ({
          projects: [
            ...s.projects,
            { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
          ],
        })),

      updateProject: (id, data) =>
        set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, ...data } : p)) })),

      deleteProject: (id) =>
        set((s) => {
          const removedTaskIds = new Set(s.tasks.filter((t) => t.projectId === id).map((t) => t.id));
          return {
            projects: s.projects.filter((p) => p.id !== id),
            tasks: s.tasks.filter((t) => t.projectId !== id),
            taskHistory: s.taskHistory.filter((h) => !removedTaskIds.has(h.taskId)),
          };
        }),

      addTask: (data) => {
        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();
        set((s) => ({
          tasks: [...s.tasks, { ...data, id, status: 'todo' as const, createdAt }],
          taskHistory: [...s.taskHistory, makeEntry(id, 'created')],
        }));
      },

      updateTask: (id, data) => {
        const old = get().tasks.find((t) => t.id === id);
        if (!old) return;
        const newEntries: TaskHistoryEntry[] = [];
        if (data.title !== old.title)
          newEntries.push(makeEntry(id, 'title_changed', old.title, data.title));
        if (data.description !== old.description)
          newEntries.push(makeEntry(id, 'description_changed', old.description, data.description));
        if (data.priority !== old.priority)
          newEntries.push(makeEntry(id, 'priority_changed', old.priority, data.priority));
        if (data.dueDate !== old.dueDate)
          newEntries.push(makeEntry(id, 'due_date_changed', old.dueDate, data.dueDate));
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...data } : t)),
          taskHistory: [...s.taskHistory, ...newEntries],
        }));
      },

      updateTaskStatus: (id, status) => {
        const old = get().tasks.find((t) => t.id === id);
        if (!old || old.status === status) return;
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
          taskHistory: [...s.taskHistory, makeEntry(id, 'status_changed', old.status, status)],
        }));
      },

      toggleTask: (id) => {
        const old = get().tasks.find((t) => t.id === id);
        if (!old) return;
        const next: Status = old.status === 'done' ? 'todo' : 'done';
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, status: next } : t)),
          taskHistory: [...s.taskHistory, makeEntry(id, 'status_changed', old.status, next)],
        }));
      },

      deleteTask: (id) =>
        set((s) => ({
          tasks: s.tasks.filter((t) => t.id !== id),
          taskHistory: s.taskHistory.filter((h) => h.taskId !== id),
        })),
    }),
    {
      name: 'taskapp',
      version: 2,
      migrate(persistedState: unknown, version: number) {
        const state = persistedState as AppState & { tasks: Array<Task & { status: string }> };
        if (version === 0) {
          state.tasks = state.tasks.map((t) => ({
            ...t,
            status: (t.status as string) === 'completed' ? 'done' : ('todo' as const),
          }));
        }
        if (version < 2) {
          state.taskHistory = [];
        }
        return state;
      },
    },
  ),
);
