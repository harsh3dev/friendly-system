import { IconWrapper } from '@/components/ui/icon-wrapper';

export function OfflineBanner() {
  return (
    <div className="rounded-2xl border border-amber-300/55 bg-amber-100/55 px-4 py-3 text-amber-950 backdrop-blur-xl supports-[backdrop-filter]:bg-amber-100/45 dark:border-amber-300/20 dark:bg-amber-300/8 dark:text-amber-50">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full border border-amber-300/50 bg-amber-50/70 p-2 text-amber-700 backdrop-blur-md dark:border-amber-200/10 dark:bg-amber-200/10 dark:text-amber-100">
          <IconWrapper name="WifiOff" className="size-4" tooltip={null} />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-amber-950 dark:text-amber-50">You&apos;re offline</p>
          <p className="text-sm text-amber-900/80 dark:text-amber-50/72">
            The app is in view-only mode until your connection comes back. Create, edit, delete,
            and status updates are unavailable.
          </p>
        </div>
      </div>
    </div>
  );
}
