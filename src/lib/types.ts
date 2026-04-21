export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in-progress' | 'done';
export type ViewMode = 'list' | 'card' | 'kanban';

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
  status: Status;
  createdAt: string;
}

export interface TaskFilters {
  search: string;
  status: 'all' | Status;
  priority: 'all' | Priority;
}

export type HistoryEventType =
  | 'created'
  | 'status_changed'
  | 'priority_changed'
  | 'title_changed'
  | 'description_changed'
  | 'due_date_changed';

export interface TaskHistoryEntry {
  id: string;
  taskId: string;
  event: HistoryEventType;
  timestamp: string;
  from?: string;
  to?: string;
}

export interface DashboardBackupData {
  projects: Project[];
  tasks: Task[];
  taskHistory: TaskHistoryEntry[];
}

export interface DashboardBackup {
  appName: 'TaskFlow';
  schemaVersion: 1;
  exportedAt: string;
  data: DashboardBackupData;
}

export interface DashboardImportResult {
  ok: boolean;
  error?: string;
}
