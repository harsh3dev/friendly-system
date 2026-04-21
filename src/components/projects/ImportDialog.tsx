import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import type { DashboardBackup } from '@/lib/types';

interface ImportDialogProps {
  pendingImport: {
    backup: DashboardBackup;
    fileName: string;
  };
  onConfirm: () => void;
  onCancel: () => void;
}

export function ImportDialog({ pendingImport, onConfirm, onCancel }: ImportDialogProps) {
  const { backup, fileName } = pendingImport;

  return (
    <Modal onClose={onCancel} className="max-w-md">
      {(close) => (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl">
          <h2 className="font-semibold text-lg">Replace dashboard data?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Importing <span className="font-medium text-foreground">{fileName}</span> will replace
            the current dashboard stored in this browser.
          </p>

          <div className="mt-4 rounded-xl border border-border bg-background/70 p-4 text-sm">
            <p>{backup.data.projects.length} projects</p>
            <p>{backup.data.tasks.length} tasks</p>
            <p>{backup.data.taskHistory.length} history entries</p>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">This action cannot be undone.</p>

          <div className="mt-5 flex gap-2">
            <Button
              variant="destructive"
              onClick={() => {
                onConfirm();
                close();
              }}
              className="flex-1"
            >
              Import Backup
            </Button>
            <Button variant="outline" onClick={close} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
