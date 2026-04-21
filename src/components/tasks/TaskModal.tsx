import type { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { IconWrapper } from '@/components/ui/icon-wrapper';
import { TaskEditorForm } from './TaskEditorForm';
import type { TaskFormData } from './TaskEditorForm';
export type { TaskFormData } from './TaskEditorForm';

type Props = {
  task?: Task;
  onSubmit: (data: TaskFormData) => void;
  onClose: () => void;
};

export function TaskModal({ task, onSubmit, onClose }: Props) {
  return (
    <Modal onClose={onClose} className="max-w-lg max-h-[80vh]">
      {close => (
        <div className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                {task ? 'Edit task' : 'New task'}
              </p>
              <h2 className="font-semibold text-lg">
                {task ? 'Update task details' : 'Create a new task'}
              </h2>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={close} type="button">
              <IconWrapper name="X" className="size-4" />
            </Button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <TaskEditorForm
              task={task}
              submitLabel={task ? 'Save changes' : 'Create task'}
              onSubmit={onSubmit}
              onCancel={close}
            />
          </div>
        </div>
      )}
    </Modal>
  );
}
