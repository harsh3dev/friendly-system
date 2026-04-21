import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Project,
  Task,
  TaskLink,
  Status,
  TaskHistoryEntry,
  HistoryEventType,
  DashboardBackup,
  DashboardBackupData,
  DashboardImportResult,
} from '@/lib/types';
import { normalizeTaskLinks, plainTextToRichText, sanitizeRichText } from '@/lib/task-content';

type TaskInput = Pick<Task, 'title' | 'description' | 'links' | 'priority' | 'dueDate'>;
type ProjectInput = Pick<Project, 'name' | 'description'>;

interface AppState {
  projects: Project[];
  tasks: Task[];
  taskHistory: TaskHistoryEntry[];

  exportDashboard: () => DashboardBackup;
  validateDashboardImport: (payload: unknown) => DashboardImportResult;
  importDashboard: (payload: unknown) => DashboardImportResult;

  addProject: (data: ProjectInput) => void;
  updateProject: (id: string, data: ProjectInput) => void;
  deleteProject: (id: string) => void;

  addTask: (data: TaskInput & { projectId: string }) => void;
  updateTask: (id: string, data: TaskInput) => void;
  updateTaskStatus: (id: string, status: Status) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
}

const BACKUP_SCHEMA_VERSION = 1 as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isString = (value: unknown): value is string => typeof value === 'string';

const isPriority = (value: unknown): value is Task['priority'] =>
  value === 'low' || value === 'medium' || value === 'high';

const isTaskLink = (value: unknown): value is TaskLink =>
  isRecord(value) &&
  isString(value.id) &&
  isString(value.label) &&
  isString(value.url);

const isStatus = (value: unknown): value is Status =>
  value === 'todo' || value === 'in-progress' || value === 'done';

const isHistoryEvent = (value: unknown): value is HistoryEventType =>
  value === 'created' ||
  value === 'status_changed' ||
  value === 'priority_changed' ||
  value === 'title_changed' ||
  value === 'description_changed' ||
  value === 'due_date_changed';

function validateProject(value: unknown): value is Project {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.name) &&
    isString(value.description) &&
    isString(value.createdAt)
  );
}

function validateTask(value: unknown): value is Task {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.projectId) &&
    isString(value.title) &&
    isString(value.description) &&
    Array.isArray(value.links) &&
    value.links.every(isTaskLink) &&
    isPriority(value.priority) &&
    isString(value.dueDate) &&
    isStatus(value.status) &&
    isString(value.createdAt)
  );
}

function validateTaskHistoryEntry(value: unknown): value is TaskHistoryEntry {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.taskId) &&
    isHistoryEvent(value.event) &&
    isString(value.timestamp) &&
    (value.from === undefined || isString(value.from)) &&
    (value.to === undefined || isString(value.to))
  );
}

function validateBackupData(value: unknown): value is DashboardBackupData {
  if (!isRecord(value)) return false;
  if (!Array.isArray(value.projects) || !value.projects.every(validateProject)) return false;
  if (!Array.isArray(value.tasks) || !value.tasks.every(validateTask)) return false;
  if (!Array.isArray(value.taskHistory) || !value.taskHistory.every(validateTaskHistoryEntry))
    return false;

  const projectIds = new Set(value.projects.map((project) => project.id));
  const taskIds = new Set(value.tasks.map((task) => task.id));

  if (value.tasks.some((task) => !projectIds.has(task.projectId))) return false;
  if (value.taskHistory.some((entry) => !taskIds.has(entry.taskId))) return false;

  return true;
}

function normalizeBackupPayload(payload: unknown): DashboardBackup | null {
  if (!isRecord(payload)) return null;
  if (payload.schemaVersion !== BACKUP_SCHEMA_VERSION) return null;
  if (payload.appName !== 'TaskFlow') return null;
  if (!isString(payload.exportedAt)) return null;
  if (!validateBackupData(payload.data)) return null;

  return {
    appName: 'TaskFlow',
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: payload.exportedAt,
    data: {
      projects: payload.data.projects,
      tasks: payload.data.tasks,
      taskHistory: payload.data.taskHistory,
    },
  };
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

      exportDashboard: () => {
        const { projects, tasks, taskHistory } = get();
        return {
          appName: 'TaskFlow',
          schemaVersion: BACKUP_SCHEMA_VERSION,
          exportedAt: new Date().toISOString(),
          data: {
            projects,
            tasks,
            taskHistory,
          },
        };
      },

      validateDashboardImport: (payload) => {
        const backup = normalizeBackupPayload(payload);
        if (!backup) {
          return {
            ok: false,
            error:
              'Invalid backup file. Expected a TaskFlow schemaVersion 1 export with valid projects, tasks, and history.',
          };
        }

        return { ok: true };
      },

      importDashboard: (payload) => {
        const backup = normalizeBackupPayload(payload);
        if (!backup) {
          return {
            ok: false,
            error:
              'Invalid backup file. Expected a TaskFlow schemaVersion 1 export with valid projects, tasks, and history.',
          };
        }

        set({
          projects: backup.data.projects,
          tasks: backup.data.tasks,
          taskHistory: backup.data.taskHistory,
        });

        return { ok: true };
      },

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
          tasks: [
            ...s.tasks,
            {
              ...data,
              description: sanitizeRichText(data.description),
              links: normalizeTaskLinks(data.links),
              id,
              status: 'todo' as const,
              createdAt,
            },
          ],
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
          tasks: s.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  ...data,
                  description: sanitizeRichText(data.description),
                  links: normalizeTaskLinks(data.links),
                }
              : t,
          ),
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
      version: 3,
      migrate(persistedState: unknown, version: number) {
        const state = persistedState as AppState & {
          tasks: Array<Task & { status: string; links?: TaskLink[] }>;
        };
        if (version === 0) {
          state.tasks = state.tasks.map((t) => ({
            ...t,
            status: (t.status as string) === 'completed' ? 'done' : ('todo' as const),
          }));
        }
        if (version < 2) {
          state.taskHistory = [];
        }
        if (version < 3) {
          state.tasks = state.tasks.map((t) => ({
            ...t,
            description: plainTextToRichText(t.description),
            links: normalizeTaskLinks(t.links ?? []),
          }));
        } else {
          state.tasks = state.tasks.map((t) => ({
            ...t,
            description: sanitizeRichText(t.description),
            links: normalizeTaskLinks(t.links ?? []),
          }));
        }
        return state;
      },
    },
  ),
);
