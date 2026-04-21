import type { Task } from '@/lib/types';

export function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function isOverdue(dateStr: string, status: Task['status']) {
  if (!dateStr || status === 'done') return false;
  return new Date(dateStr) < new Date(new Date().toDateString());
}
