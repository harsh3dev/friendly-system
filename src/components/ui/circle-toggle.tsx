import { cn } from '@/lib/utils';

export const CircleToggle = ({ done, onClick }: { done: boolean; onClick: () => void }) => {
  const doneClass = 'border-green-500 bg-green-500 text-white';
  const undoneClass = 'border-muted-foreground hover:border-primary';
  const buttonClass = done ? doneClass : undoneClass;

  return (
    <button
      onClick={onClick}
      title={done ? 'Mark as to do' : 'Mark as done'}
      className={cn(
        'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
        buttonClass,
      )}
    >
      {done && (
        <svg className="size-3" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
};
