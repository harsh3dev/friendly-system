import { useRef } from 'react';
import { useProjectsView } from './useProjectsView';
import { ProjectCard } from './ProjectCard';
import { ProjectModal } from './ProjectModal';
import { ImportDialog } from './ImportDialog';
import { OfflineBanner } from '@/components/offline/OfflineBanner';
import { StatCard } from '@/components/ui/stat-card';
import { ThemeBtn } from '@/components/ui/theme-btn';
import { DeleteDialog } from '@/components/ui/delete-dialog';
import { Button } from '@/components/ui/button';
import { IconWrapper } from '@/components/ui/icon-wrapper';

export function ProjectsView() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    projects, globalStats, projectStats,
    projectModal, openCreateModal, openEditModal, closeModal, handleSaveProject,
    deleteConfirm, confirmDelete, cancelDelete, handleDeleteProject,
    navigateToProject, isOffline, notice, dismissNotice, pendingImport,
    handleExportDashboard, handleImportFile, cancelImport, confirmImport,
  } = useProjectsView();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <IconWrapper name="CheckSquare" className="size-5 text-primary" tooltip={null} />
            TaskFlow
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void handleImportFile(file);
                }
                event.currentTarget.value = '';
              }}
            />
            <Button variant="outline" size="sm" onClick={handleExportDashboard}>
              <IconWrapper name="Download" className="size-4" tooltip={null} />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <IconWrapper name="Upload" className="size-4" tooltip={null} />
              <span className="hidden sm:inline">Import</span>
            </Button>
            <ThemeBtn />
            {!isOffline && (
              <Button size="sm" onClick={openCreateModal}>
                <IconWrapper name="Plus" className="size-4" tooltip={null} />
                <span className="hidden sm:inline">New Project</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-5 px-4 py-6">
        {isOffline && <OfflineBanner />}
        {notice && (
          <div
            className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
              notice.type === 'error'
                ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-100'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100'
            }`}
          >
            <p>{notice.message}</p>
            <Button variant="ghost" size="icon-sm" onClick={dismissNotice} aria-label="Dismiss message">
              <IconWrapper name="X" className="size-4" tooltip={null} />
            </Button>
          </div>
        )}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <StatCard label="Projects" value={globalStats.projects} colorClass="text-foreground" icon={<IconWrapper name="Layers" className="size-3.5" tooltip={null} />} />
          <StatCard label="Total Tasks" value={globalStats.total} colorClass="text-foreground" icon={<IconWrapper name="ClipboardList" className="size-3.5" tooltip={null} />} />
          <StatCard label="Completed" value={globalStats.completed} colorClass="text-green-600 dark:text-green-400" icon={<IconWrapper name="CheckSquare" className="size-3.5" tooltip={null} />} />
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
            <div className="text-5xl">🗂️</div>
            <p className="font-semibold text-lg">No projects yet</p>
            <p className="text-sm text-muted-foreground">Create your first project to start managing tasks</p>
            {!isOffline && (
              <Button className="mt-2" onClick={openCreateModal}>
                <IconWrapper name="Plus" className="size-4" tooltip={null} />
                New Project
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map(project => {
              const s = projectStats.find(x => x.id === project.id)!;
              return (
                <ProjectCard
                  key={project.id}
                  project={project}
                  totalTasks={s.total}
                  activeTasks={s.active}
                  readOnly={isOffline}
                  onSelect={() => navigateToProject(project.id)}
                  onEdit={() => openEditModal(project)}
                  onDelete={() => confirmDelete(project.id)}
                />
              );
            })}
          </div>
        )}
      </main>

      {projectModal.open && (
        <ProjectModal
          project={projectModal.project}
          onSubmit={handleSaveProject}
          onClose={closeModal}
        />
      )}
      {deleteConfirm && (
        <DeleteDialog
          message="project and all its tasks"
          onConfirm={handleDeleteProject}
          onCancel={cancelDelete}
        />
      )}
      {pendingImport && (
        <ImportDialog
          pendingImport={pendingImport}
          onConfirm={confirmImport}
          onCancel={cancelImport}
        />
      )}
    </div>
  );
}
