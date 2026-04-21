import { Routes, Route, Navigate } from 'react-router-dom';
import { ProjectsView } from '@/components/projects/ProjectsView';
import { ProjectDetailView } from '@/components/tasks/ProjectDetailView';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ProjectsView />} />
      <Route path="/projects/:projectId" element={<ProjectDetailView />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
