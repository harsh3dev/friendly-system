import { Button } from '@/components/ui/button';

export function DeleteDialog({ message, onConfirm, onCancel }: {
  message: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-20 grid place-items-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl">
        <h2 className="font-semibold text-lg">Delete {message}?</h2>
        <p className="mt-1 text-sm text-muted-foreground">This action cannot be undone.</p>
        <div className="mt-5 flex gap-2">
          <Button variant="destructive" onClick={onConfirm} className="flex-1">Delete</Button>
          <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        </div>
      </div>
    </div>
  );
}
