import type { Task, TaskFilters, Status } from '@/lib/types';

export const priorityClasses: Record<Task['priority'], string> = {
  high: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  low: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
};

export const KANBAN_COLUMNS: {
  status: Status;
  label: string;
  dotClass: string;
  headerClass: string;
  countClass: string;
}[] = [
  {
    status: 'todo',
    label: 'To Do',
    dotClass: 'bg-sky-500',
    headerClass: 'text-sky-700 dark:text-sky-400',
    countClass: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  },
  {
    status: 'in-progress',
    label: 'In Progress',
    dotClass: 'bg-amber-500',
    headerClass: 'text-amber-700 dark:text-amber-400',
    countClass: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  },
  {
    status: 'done',
    label: 'Done',
    dotClass: 'bg-green-500',
    headerClass: 'text-green-700 dark:text-green-400',
    countClass: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  },
];

export const STATUS_LABELS: Record<TaskFilters['status'], string> = {
  all: 'All',
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
};

export const statusClasses: Record<Status, string> = {
  todo: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  'in-progress': 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  done: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
};
