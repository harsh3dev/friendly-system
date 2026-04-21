import { Link } from 'react-router-dom';
import type { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { statusClasses, STATUS_LABELS } from '@/lib/constants';

const STATUS_DOT: Record<Task['status'], string> = {
  todo: 'bg-sky-500',
  'in-progress': 'bg-amber-500',
  done: 'bg-green-500',
};

type Props = {
  linkedTaskIds: string[];
  projectId: string;
  allProjectTasks: Task[];
  onNavigate?: () => void;
};

export function LinkedTasksSection({ linkedTaskIds, projectId, allProjectTasks, onNavigate }: Props) {
  const linkedTasks = linkedTaskIds
    .map((id) => allProjectTasks.find((t) => t.id === id))
    .filter((t): t is Task => t !== undefined);

  if (linkedTasks.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Linked Tasks
      </p>
      <div className="flex flex-col gap-1.5">
        {linkedTasks.map((task) => (
          <Link
            key={task.id}
            to={`/projects/${projectId}/tasks/${task.id}`}
            onClick={onNavigate}
            className="flex items-center gap-2 rounded-lg border border-border bg-background/50 px-3 py-2 text-sm transition-colors hover:border-primary/30 hover:bg-background"
          >
            <span className={cn('size-2 shrink-0 rounded-full', STATUS_DOT[task.status])} />
            <span className="flex-1 truncate font-medium">{task.title}</span>
            <span
              className={cn(
                'ml-auto shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                statusClasses[task.status],
              )}
            >
              {STATUS_LABELS[task.status]}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
