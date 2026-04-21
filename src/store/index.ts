import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project, Task, Status } from '@/lib/types';

type TaskInput = Pick<Task, 'title' | 'description' | 'priority' | 'dueDate'>;
type ProjectInput = Pick<Project, 'name' | 'description'>;

interface AppState {
  projects: Project[];
  tasks: Task[];

  addProject: (data: ProjectInput) => void;
  updateProject: (id: string, data: ProjectInput) => void;
  deleteProject: (id: string) => void;

  addTask: (data: TaskInput & { projectId: string }) => void;
  updateTask: (id: string, data: TaskInput) => void;
  updateTaskStatus: (id: string, status: Status) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      projects: [],
      tasks: [],

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
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          tasks: s.tasks.filter((t) => t.projectId !== id),
        })),

      addTask: (data) =>
        set((s) => ({
          tasks: [
            ...s.tasks,
            {
              ...data,
              id: crypto.randomUUID(),
              status: 'todo' as const,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateTask: (id, data) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...data } : t)) })),

      updateTaskStatus: (id, status) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, status } : t)) })),

      toggleTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, status: t.status === 'done' ? 'todo' : 'done' } : t,
          ),
        })),

      deleteTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
    }),
    {
      name: 'taskapp',
      version: 1,
      migrate(persistedState: unknown, version: number) {
        const state = persistedState as AppState & { tasks: Array<Task & { status: string }> };
        if (version === 0) {
          state.tasks = state.tasks.map((t) => ({
            ...t,
            status: (t.status as string) === 'completed' ? 'done' : ('todo' as const),
          }));
        }
        return state;
      },
    },
  ),
);
