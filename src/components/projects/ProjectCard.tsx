import { Button } from '@/components/ui/button';
import { IconWrapper } from '@/components/ui/icon-wrapper';
import type { Project } from '@/lib/types';

export function ProjectCard({ project, totalTasks, activeTasks, onSelect, onEdit, onDelete, readOnly = false }: {
  project: Project; totalTasks: number; activeTasks: number;
  onSelect: () => void; onEdit: () => void; onDelete: () => void; readOnly?: boolean;
}) {
  return (
    <div
      onClick={onSelect}
      className="group relative flex cursor-pointer flex-col rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <IconWrapper name="FolderOpen" className="size-5 text-primary" tooltip={null} />
        </div>
        {!readOnly && (
          <div
            className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={e => e.stopPropagation()}
          >
            <Button variant="ghost" size="icon-xs" onClick={onEdit}>
              <IconWrapper name="Pencil" className="size-3.5" tooltip="Edit project" />
            </Button>
            <Button variant="ghost" size="icon-xs" onClick={onDelete} className="text-destructive hover:text-destructive">
              <IconWrapper name="Trash2" className="size-3.5" tooltip="Delete project" />
            </Button>
          </div>
        )}
      </div>
      <p className="font-semibold">{project.name}</p>
      {project.description && (
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
      )}
      <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
        <span>{totalTasks} {totalTasks === 1 ? 'task' : 'tasks'}</span>
        {activeTasks > 0 && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            {activeTasks} active
          </span>
        )}
        {totalTasks > 0 && activeTasks === 0 && (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700 dark:bg-green-950 dark:text-green-300">
            all done ✓
          </span>
        )}
      </div>
    </div>
  );
}
