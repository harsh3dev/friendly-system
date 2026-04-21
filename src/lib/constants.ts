import type { Task, TaskFilters, Status } from '@/lib/types';

export const priorityClasses: Record<Task['priority'], string> = {
  high: 'border border-rose-300/60 bg-rose-50/80 text-rose-700 backdrop-blur-md dark:border-rose-300/15 dark:bg-rose-300/10 dark:text-rose-100',
  medium: 'border border-amber-300/60 bg-amber-50/80 text-amber-700 backdrop-blur-md dark:border-amber-300/15 dark:bg-amber-300/10 dark:text-amber-100',
  low: 'border border-sky-300/60 bg-sky-50/80 text-sky-700 backdrop-blur-md dark:border-sky-300/15 dark:bg-sky-300/10 dark:text-sky-100',
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
    headerClass: 'text-sky-500 dark:text-sky-200',
    countClass: 'border border-sky-300/60 bg-sky-50/80 text-sky-600 backdrop-blur-md dark:border-sky-300/15 dark:bg-sky-300/10 dark:text-sky-100',
  },
  {
    status: 'in-progress',
    label: 'In Progress',
    dotClass: 'bg-amber-500',
    headerClass: 'text-amber-500 dark:text-amber-200',
    countClass: 'border border-amber-300/60 bg-amber-50/80 text-amber-600 backdrop-blur-md dark:border-amber-300/15 dark:bg-amber-300/10 dark:text-amber-100',
  },
  {
    status: 'done',
    label: 'Done',
    dotClass: 'bg-green-500',
    headerClass: 'text-green-500 dark:text-green-200',
    countClass: 'border border-green-300/60 bg-green-50/80 text-green-600 backdrop-blur-md dark:border-green-300/15 dark:bg-green-300/10 dark:text-green-100',
  },
];

export const STATUS_LABELS: Record<TaskFilters['status'], string> = {
  all: 'All',
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
};

export const statusClasses: Record<Status, string> = {
  todo: 'border border-sky-300/60 bg-sky-50/80 text-sky-700 backdrop-blur-md dark:border-sky-300/15 dark:bg-sky-300/10 dark:text-sky-100',
  'in-progress': 'border border-amber-300/60 bg-amber-50/80 text-amber-700 backdrop-blur-md dark:border-amber-300/15 dark:bg-amber-300/10 dark:text-amber-100',
  done: 'border border-green-300/60 bg-green-50/80 text-green-700 backdrop-blur-md dark:border-green-300/15 dark:bg-green-300/10 dark:text-green-100',
};
