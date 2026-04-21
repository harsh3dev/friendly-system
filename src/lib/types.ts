export type Priority = 'low' | 'medium' | 'high';
export type Status = 'pending' | 'completed';
export type ViewMode = 'list' | 'card';

export interface Task {
  id: string;
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
