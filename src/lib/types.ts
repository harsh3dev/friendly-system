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
