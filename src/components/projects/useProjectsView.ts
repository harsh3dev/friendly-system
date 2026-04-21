import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { useOfflineStatus } from '@/components/offline/offline-provider';
import type { DashboardBackup, Project } from '@/lib/types';

type Notice = {
  type: 'success' | 'error';
  message: string;
};

type PendingImport = {
  backup: DashboardBackup;
  fileName: string;
};

export function useProjectsView() {
  const navigate = useNavigate();
  const { isOffline } = useOfflineStatus();
  const {
    projects,
    tasks,
    taskHistory,
    exportDashboard,
    validateDashboardImport,
    importDashboard,
    addProject,
    updateProject,
    deleteProject,
  } = useAppStore();
  const [projectModal, setProjectModal] = useState<{ open: boolean; project?: Project }>({ open: false });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(null);

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

  const dismissNotice = () => {
    setNotice(null);
  };

  const handleExportDashboard = () => {
    const backup = exportDashboard();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateLabel = backup.exportedAt.slice(0, 10);
    link.href = url;
    link.download = `taskflow-backup-${dateLabel}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice({ type: 'success', message: 'Dashboard exported as JSON backup.' });
  };

  const handleImportFile = async (file: File) => {
    setNotice(null);
    setPendingImport(null);

    try {
      const text = await file.text();
      if (!text.trim()) {
        setNotice({ type: 'error', message: 'The selected file is empty.' });
        return;
      }

      const parsed = JSON.parse(text) as DashboardBackup;
      const result = validateDashboardImport(parsed);
      if (!result.ok) {
        setNotice({ type: 'error', message: result.error ?? 'Import failed.' });
        return;
      }

      setPendingImport({ backup: parsed, fileName: file.name });
    } catch {
      setNotice({ type: 'error', message: 'The selected file is not valid JSON.' });
    }
  };

  const cancelImport = () => {
    setPendingImport(null);
  };

  const confirmImport = () => {
    if (!pendingImport) return;
    const result = importDashboard(pendingImport.backup);
    if (!result.ok) {
      setNotice({ type: 'error', message: result.error ?? 'Import failed.' });
      setPendingImport(null);
      return;
    }

    setPendingImport(null);
    setNotice({
      type: 'success',
      message: `Imported ${pendingImport.backup.data.projects.length} projects and ${pendingImport.backup.data.tasks.length} tasks from ${pendingImport.fileName}.`,
    });
  };

  const navigateToProject = (id: string) => { navigate(`/projects/${id}`); };

  return {
    projects,
    tasks,
    taskHistory,
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
    notice,
    dismissNotice,
    pendingImport,
    handleExportDashboard,
    handleImportFile,
    cancelImport,
    confirmImport,
  };
}
