import type { ChangeEvent } from 'react';
import type { TaskFilters, ViewMode } from '@/lib/types';
import { IconWrapper } from '@/components/ui/icon-wrapper';
import { cn } from '@/lib/utils';
import { STATUS_LABELS } from '@/lib/constants';

export const FilterBar = ({ filters, setFilters, viewMode, setViewMode }: {
  filters: TaskFilters;
  setFilters: (fn: (f: TaskFilters) => TaskFilters) => void;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
}) => {
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilters(f => ({ ...f, search: e.target.value }));
  };

  const handleStatusClick = (status: TaskFilters['status']) => () => {
    setFilters(f => ({ ...f, status }));
  };

  const handlePriorityChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilters(f => ({ ...f, priority: e.target.value as TaskFilters['priority'] }));
  };

  const handleViewModeClick = (mode: ViewMode) => () => {
    setViewMode(mode);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative min-w-48 flex-1">
        <IconWrapper
          name="Search"
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          tooltip={null}
        />
        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={handleSearchChange}
          className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {viewMode !== 'kanban' && (
          <div className="flex overflow-hidden rounded-lg border border-border text-xs">
            {(['all', 'todo', 'in-progress', 'done'] as const).map(s => (
              <button
                key={s}
                onClick={handleStatusClick(s)}
                className={cn(
                  'px-3 py-1.5 font-medium transition-colors',
                  filters.status === s
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted',
                )}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        )}
        <select
          value={filters.priority}
          onChange={handlePriorityChange}
          className="cursor-pointer rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary"
        >
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <div className="flex overflow-hidden rounded-lg border border-border">
          {(['list', 'card', 'kanban'] as const).map(v => (
            <button
              key={v}
              onClick={handleViewModeClick(v)}
              className={cn(
                'p-1.5 transition-colors',
                viewMode === v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
              )}
            >
              {v === 'list'
                ? <IconWrapper name="List" className="size-4" tooltip="List view" />
                : v === 'card'
                ? <IconWrapper name="LayoutGrid" className="size-4" tooltip="Card view" />
                : <IconWrapper name="Columns" className="size-4" tooltip="Kanban view" />
              }
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
