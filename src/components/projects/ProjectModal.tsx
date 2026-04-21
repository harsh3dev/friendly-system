import { useState, type FormEvent } from 'react';
import type { Project } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';
import { IconWrapper } from '@/components/ui/icon-wrapper';

type Props = {
  project?: Project;
  onSubmit: (data: { name: string; description: string }) => void;
  onClose: () => void;
};

export function ProjectModal({ project, onSubmit, onClose }: Props) {
  const [form, setForm] = useState({
    name: project?.name ?? '',
    description: project?.description ?? '',
  });
  const [nameError, setNameError] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setNameError('Project name is required');
      return;
    }
    onSubmit({ name: form.name.trim(), description: form.description.trim() });
  }

  return (
    <Modal onClose={onClose} className="max-w-md">
      {close => (
        <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                {project ? 'Edit project' : 'New project'}
              </p>
              <h2 className="font-semibold text-lg">
                {project ? 'Update project details' : 'Create a new project'}
              </h2>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={close} type="button">
              <IconWrapper name="X" className="size-4" />
            </Button>
          </div>

          <form className="flex flex-col gap-4 p-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="proj-name" className="text-sm font-medium">
                Name <span className="text-destructive">*</span>
              </label>
              <input
                id="proj-name"
                type="text"
                value={form.name}
                onChange={e => {
                  setNameError('');
                  setForm(f => ({ ...f, name: e.target.value }));
                }}
                placeholder="e.g. Website Redesign"
                className={cn(
                  'rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30',
                  nameError ? 'border-destructive' : 'border-border',
                )}
              />
              {nameError && <p className="text-xs text-destructive">{nameError}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="proj-desc" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="proj-desc"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="What is this project about?"
                rows={3}
                className="resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button type="submit" className="flex-1">
                {project ? 'Save changes' : 'Create project'}
              </Button>
              <Button type="button" variant="outline" onClick={close}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
}
