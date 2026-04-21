import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { useOfflineStatus } from '@/components/offline/offline-provider';
import type { Project } from '@/lib/types';

export function useProjectsView() {
  const navigate = useNavigate();
  const { isOffline } = useOfflineStatus();
  const { projects, tasks, addProject, updateProject, deleteProject } = useAppStore();
  const [projectModal, setProjectModal] = useState<{ open: boolean; project?: Project }>({ open: false });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!isOffline) return;
    setProjectModal({ open: false });
    setDeleteConfirm(null);
  }, [isOffline]);

  const projectStats = useMemo(() =>
    projects.map(p => {
      const ptasks = tasks.filter(t => t.projectId === p.id);
      return { id: p.id, total: ptasks.length, active: ptasks.filter(t => t.status !== 'done').length };
    }),
    [projects, tasks],
  );

  const globalStats = useMemo(() => ({
    projects: projects.length,
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'done').length,
  }), [projects, tasks]);

  const openCreateModal = () => {
    if (isOffline) return;
    setProjectModal({ open: true });
  };
  const openEditModal = (project: Project) => {
    if (isOffline) return;
    setProjectModal({ open: true, project });
  };
  const closeModal = () => { setProjectModal({ open: false }); };

  const handleSaveProject = (data: { name: string; description: string }) => {
    if (isOffline) return;
    if (projectModal.project) {
      updateProject(projectModal.project.id, data);
    } else {
      addProject(data);
    }
    closeModal();
  };

  const confirmDelete = (id: string) => {
    if (isOffline) return;
    setDeleteConfirm(id);
  };
  const cancelDelete = () => { setDeleteConfirm(null); };

  const handleDeleteProject = () => {
    if (isOffline) return;
    if (deleteConfirm) {
      deleteProject(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  const navigateToProject = (id: string) => { navigate(`/projects/${id}`); };

  return {
    projects,
    globalStats,
    projectStats,
    projectModal,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSaveProject,
    deleteConfirm,
    confirmDelete,
    cancelDelete,
    handleDeleteProject,
    navigateToProject,
    isOffline,
  };
}
