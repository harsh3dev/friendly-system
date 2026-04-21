import { useProjectsView } from './useProjectsView';
import { ProjectCard } from './ProjectCard';
import { ProjectModal } from './ProjectModal';
import { StatCard } from '@/components/ui/stat-card';
import { ThemeBtn } from '@/components/ui/theme-btn';
import { DeleteDialog } from '@/components/ui/delete-dialog';
import { Button } from '@/components/ui/button';
import { IconWrapper } from '@/components/ui/icon-wrapper';

export function ProjectsView() {
  const {
    projects, globalStats, projectStats,
    projectModal, openCreateModal, openEditModal, closeModal, handleSaveProject,
    deleteConfirm, confirmDelete, cancelDelete, handleDeleteProject,
    navigateToProject,
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
            <ThemeBtn />
            <Button size="sm" onClick={openCreateModal}>
              <IconWrapper name="Plus" className="size-4" tooltip={null} />
              New Project
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-5 px-4 py-6">
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
            <Button className="mt-2" onClick={openCreateModal}>
              <IconWrapper name="Plus" className="size-4" tooltip={null} />
              New Project
            </Button>
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
    </div>
  );
}
