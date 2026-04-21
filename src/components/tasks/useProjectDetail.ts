import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '@/store';
import type { Task, TaskFilters, ViewMode, Status } from '@/lib/types';
import type { TaskFormData } from '@/components/tasks/TaskModal';

export function useProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, tasks, addTask, updateTask, updateTaskStatus, toggleTask, deleteTask } = useAppStore();

  const [filters, setFilters] = useState<TaskFilters>({ search: '', status: 'all', priority: 'all' });
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [taskModal, setTaskModal] = useState<{ open: boolean; task?: Task }>({ open: false });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const currentProject = projects.find(p => p.id === projectId);

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
      if (!task.title.toLowerCase().includes(q) && !task.description.toLowerCase().includes(q)) return false;
    }
    if (filters.status !== 'all' && task.status !== filters.status) return false;
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    return true;
  }), [projectTasks, filters]);

  const kanbanTasks = useMemo(() => projectTasks.filter(task => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!task.title.toLowerCase().includes(q) && !task.description.toLowerCase().includes(q)) return false;
    }
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    return true;
  }), [projectTasks, filters.search, filters.priority]);

  const hasFilters = filters.search !== '' || filters.status !== 'all' || filters.priority !== 'all';

  const openCreateTask = () => { setTaskModal({ open: true }); };
  const openEditTask = (task: Task) => { setTaskModal({ open: true, task }); };
  const closeTaskModal = () => { setTaskModal({ open: false }); };

  const handleSaveTask = (data: TaskFormData) => {
    if (taskModal.task) {
      updateTask(taskModal.task.id, data);
    } else if (projectId) {
      addTask({ projectId, ...data });
    }
    closeTaskModal();
  };

  const confirmDeleteTask = (id: string) => { setDeleteConfirm(id); };
  const cancelDeleteTask = () => { setDeleteConfirm(null); };

  const handleDeleteTask = () => {
    if (deleteConfirm) {
      deleteTask(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  const handleToggleTask = (id: string) => { toggleTask(id); };
  const handleStatusChange = (id: string, status: Status) => { updateTaskStatus(id, status); };
  const navigateBack = () => { navigate('/'); };

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
    deleteConfirm,
    confirmDeleteTask,
    cancelDeleteTask,
    handleDeleteTask,
    handleToggleTask,
    handleStatusChange,
    navigateBack,
  };
}
