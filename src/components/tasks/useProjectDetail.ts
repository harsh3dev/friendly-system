import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '@/store';
import { useOfflineStatus } from '@/components/offline/offline-provider';
import type { Task, TaskFilters, ViewMode, Status } from '@/lib/types';
import type { TaskFormData } from '@/components/tasks/TaskEditorForm';
import { richTextToPlainText } from '@/lib/task-content';

export function useProjectDetail() {
  const { projectId, taskId } = useParams<{ projectId: string; taskId?: string }>();
  const navigate = useNavigate();
  const { isOffline } = useOfflineStatus();
  const { projects, tasks, addTask, updateTask, updateTaskStatus, toggleTask, deleteTask } = useAppStore();

  const [filters, setFilters] = useState<TaskFilters>({ search: '', status: 'all', priority: 'all' });
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [taskModal, setTaskModal] = useState<{ open: boolean; task?: Task }>({ open: false });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [detailTask, setDetailTask] = useState<Task | null>(null);

  const currentProject = projects.find(p => p.id === projectId);
  const routeTask = tasks.find(t => t.id === taskId && t.projectId === projectId) ?? null;
  const isTaskRoute = Boolean(taskId);

  useEffect(() => {
    if (isTaskRoute) setDetailTask(null);
  }, [isTaskRoute]);

  useEffect(() => {
    if (!isTaskRoute || routeTask || !projectId) return;
    navigate(`/projects/${projectId}`, { replace: true });
  }, [isTaskRoute, routeTask, projectId, navigate]);

  useEffect(() => {
    if (!isOffline) return;
    setTaskModal({ open: false });
    setDeleteConfirm(null);
  }, [isOffline]);

  const projectTasks = useMemo(() =>
    tasks.filter(t => t.projectId === projectId),
    [tasks, projectId],
  );

  const projectTaskStats = useMemo(() => ({
    total: projectTasks.length,
    inProgress: projectTasks.filter(t => t.status === 'in-progress').length,
    done: projectTasks.filter(t => t.status === 'done').length,
  }), [projectTasks]);

  const filteredTasks = useMemo(() => projectTasks.filter(task => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const description = richTextToPlainText(task.description).toLowerCase();
      const links = task.links.flatMap(link => [link.label, link.url]).join(' ').toLowerCase();
      if (!task.title.toLowerCase().includes(q) && !description.includes(q) && !links.includes(q)) return false;
    }
    if (filters.status !== 'all' && task.status !== filters.status) return false;
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    return true;
  }), [projectTasks, filters]);

  const kanbanTasks = useMemo(() => projectTasks.filter(task => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const description = richTextToPlainText(task.description).toLowerCase();
      const links = task.links.flatMap(link => [link.label, link.url]).join(' ').toLowerCase();
      if (!task.title.toLowerCase().includes(q) && !description.includes(q) && !links.includes(q)) return false;
    }
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    return true;
  }), [projectTasks, filters.search, filters.priority]);

  const hasFilters = filters.search !== '' || filters.status !== 'all' || filters.priority !== 'all';

  const openCreateTask = () => {
    if (isOffline) return;
    setTaskModal({ open: true });
  };
  const openEditTask = (task: Task) => {
    if (isOffline) return;
    setTaskModal({ open: true, task });
  };
  const closeTaskModal = () => { setTaskModal({ open: false }); };

  const openDetailTask = (task: Task) => { setDetailTask(task); };
  const closeDetailTask = () => { setDetailTask(null); };

  const handleSaveTask = (data: TaskFormData) => {
    if (isOffline) return;
    if (taskModal.task) {
      updateTask(taskModal.task.id, data);
    } else if (projectId) {
      addTask({ projectId, ...data });
    }
    closeTaskModal();
  };

  const handleUpdateRouteTask = (id: string, data: TaskFormData) => {
    if (isOffline) return;
    updateTask(id, data);
  };

  const confirmDeleteTask = (id: string) => {
    if (isOffline) return;
    setDeleteConfirm(id);
  };
  const cancelDeleteTask = () => { setDeleteConfirm(null); };

  const handleDeleteTask = () => {
    if (isOffline) return;
    if (deleteConfirm) {
      const deletedTaskId = deleteConfirm;
      deleteTask(deletedTaskId);
      setDeleteConfirm(null);
      setDetailTask(prev => (prev?.id === deletedTaskId ? null : prev));
      if (taskId === deletedTaskId && projectId) {
        navigate(`/projects/${projectId}`, { replace: true });
      }
    }
  };

  const handleToggleTask = (id: string) => {
    if (isOffline) return;
    toggleTask(id);
  };
  const handleStatusChange = (id: string, status: Status) => {
    if (isOffline) return;
    updateTaskStatus(id, status);
  };
  const navigateToProject = () => {
    if (projectId) {
      navigate(`/projects/${projectId}`);
      return;
    }
    navigate('/');
  };
  const navigateHome = () => { navigate('/'); };

  return {
    currentProject,
    projectTaskStats,
    filteredTasks,
    kanbanTasks,
    hasFilters,
    filters,
    setFilters,
    viewMode,
    setViewMode,
    taskModal,
    openCreateTask,
    openEditTask,
    closeTaskModal,
    handleSaveTask,
    handleUpdateRouteTask,
    detailTask,
    routeTask,
    isTaskRoute,
    openDetailTask,
    closeDetailTask,
    deleteConfirm,
    confirmDeleteTask,
    cancelDeleteTask,
    handleDeleteTask,
    handleToggleTask,
    handleStatusChange,
    navigateToProject,
    navigateHome,
    isOffline,
  };
}
