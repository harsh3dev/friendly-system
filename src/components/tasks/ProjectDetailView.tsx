import { Navigate } from 'react-router-dom';
import { useProjectDetail } from './useProjectDetail';
import { TaskListItem } from './TaskListItem';
import { TaskCardItem } from './TaskCardItem';
import { FilterBar } from './FilterBar';
import { TaskModal } from './TaskModal';
import { TaskDetailModal } from './TaskDetailModal';
import { TaskDetailPage } from './TaskDetailPage';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { OfflineBanner } from '@/components/offline/OfflineBanner';
import { StatCard } from '@/components/ui/stat-card';
import { ThemeBtn } from '@/components/ui/theme-btn';
import { DeleteDialog } from '@/components/ui/delete-dialog';
import { Button } from '@/components/ui/button';
import { IconWrapper } from '@/components/ui/icon-wrapper';

export function ProjectDetailView() {
  const {
    currentProject,
    projectTaskStats, filteredTasks, kanbanTasks, hasFilters,
    filters, setFilters, viewMode, setViewMode,
    taskModal, openCreateTask, openEditTask, closeTaskModal, handleSaveTask,
    detailTask, routeTask, isTaskRoute, openDetailTask, closeDetailTask,
    deleteConfirm, confirmDeleteTask, cancelDeleteTask, handleDeleteTask,
    handleToggleTask, handleStatusChange, handleUpdateRouteTask,
    navigateToProject, navigateHome, isOffline,
  } = useProjectDetail();

  if (!currentProject) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
          <Button variant="ghost" size="icon-sm" onClick={navigateHome}>
            <IconWrapper name="ArrowLeft" className="size-4" tooltip="Back to projects" />
          </Button>
          <span className="flex-1 truncate font-semibold">{currentProject.name}</span>
          <ThemeBtn />
          {!isOffline && (
            <Button size="sm" onClick={openCreateTask}>
              <IconWrapper name="Plus" className="size-4" tooltip={null} />
              New Task
            </Button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-5 px-4 py-6">
        {isOffline && <OfflineBanner />}
        {isTaskRoute && routeTask ? (
          <TaskDetailPage
            task={routeTask}
            readOnly={isOffline}
            onBack={navigateToProject}
            onSave={(data) => handleUpdateRouteTask(routeTask.id, data)}
            onDelete={() => confirmDeleteTask(routeTask.id)}
            onStatusChange={(status) => handleStatusChange(routeTask.id, status)}
          />
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <StatCard label="Total Tasks" value={projectTaskStats.total} colorClass="text-foreground" icon={<IconWrapper name="ClipboardList" className="size-3.5" tooltip={null} />} />
              <StatCard label="In Progress" value={projectTaskStats.inProgress} colorClass="text-amber-600 dark:text-amber-400" icon={<IconWrapper name="Clock" className="size-3.5" tooltip={null} />} />
              <StatCard label="Done" value={projectTaskStats.done} colorClass="text-green-600 dark:text-green-400" icon={<IconWrapper name="CheckSquare" className="size-3.5" tooltip={null} />} />
            </div>

            <FilterBar filters={filters} setFilters={setFilters} viewMode={viewMode} setViewMode={setViewMode} />

            {viewMode === 'kanban' ? (
              <KanbanBoard
                tasks={kanbanTasks}
                readOnly={isOffline}
                onEdit={openEditTask}
                onDelete={confirmDeleteTask}
                onView={openDetailTask}
                onStatusChange={handleStatusChange}
              />
            ) : filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
                <div className="text-5xl">📋</div>
                <p className="font-semibold text-lg">
                  {hasFilters ? 'No tasks match your filters' : 'No tasks yet'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {hasFilters ? 'Try adjusting your search or filters' : 'Add your first task to this project'}
                </p>
                {!hasFilters && !isOffline && (
                  <Button className="mt-2" onClick={openCreateTask}>
                    <IconWrapper name="Plus" className="size-4" tooltip={null} />
                    New Task
                  </Button>
                )}
              </div>
            ) : viewMode === 'list' ? (
              <div className="space-y-2">
                {filteredTasks.map(task => (
                  <TaskListItem
                    key={task.id}
                    task={task}
                    readOnly={isOffline}
                    onToggle={() => handleToggleTask(task.id)}
                    onEdit={() => openEditTask(task)}
                    onDelete={() => confirmDeleteTask(task.id)}
                    onView={() => openDetailTask(task)}
                  />
                ))}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTasks.map(task => (
                  <TaskCardItem
                    key={task.id}
                    task={task}
                    readOnly={isOffline}
                    onToggle={() => handleToggleTask(task.id)}
                    onEdit={() => openEditTask(task)}
                    onDelete={() => confirmDeleteTask(task.id)}
                    onView={() => openDetailTask(task)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {detailTask && (
        <TaskDetailModal
          task={detailTask}
          readOnly={isOffline}
          onEdit={() => { closeDetailTask(); openEditTask(detailTask); }}
          onDelete={() => { closeDetailTask(); confirmDeleteTask(detailTask.id); }}
          onClose={closeDetailTask}
        />
      )}
      {taskModal.open && (
        <TaskModal
          task={taskModal.task}
          onSubmit={handleSaveTask}
          onClose={closeTaskModal}
        />
      )}
      {deleteConfirm && (
        <DeleteDialog
          message="task"
          onConfirm={handleDeleteTask}
          onCancel={cancelDeleteTask}
        />
      )}
    </div>
  );
}
