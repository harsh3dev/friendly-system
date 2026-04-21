import type { TaskLink } from '@/lib/types';
import { cn } from '@/lib/utils';
import { richTextToPlainText, sanitizeRichText } from '@/lib/task-content';

type Props = {
  description: string;
  links?: TaskLink[];
  compact?: boolean;
  className?: string;
};

export function TaskRichContent({ description, links = [], compact = false, className }: Props) {
  const safeDescription = sanitizeRichText(description);
  const plainDescription = richTextToPlainText(safeDescription);

  return (
    <div className={cn('space-y-4', className)}>
      {plainDescription ? (
        compact ? (
          <p className="line-clamp-3 whitespace-pre-line text-sm text-muted-foreground">{plainDescription}</p>
        ) : (
          <div
            className={cn(
              'prose max-w-none text-foreground',
              'prose-p:my-3 prose-ul:my-3 prose-ol:my-3 prose-li:my-1',
              'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
            )}
            dangerouslySetInnerHTML={{ __html: safeDescription }}
          />
        )
      ) : null}

      {links.length > 0 && (
        <div className="space-y-2">
          {!compact && (
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Useful Links
            </p>
          )}
          <div className="flex flex-col gap-2">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'truncate rounded-xl border border-border bg-background px-3 py-2 text-sm text-primary transition-colors hover:border-primary/30 hover:text-primary/80',
                  compact && 'px-0 py-0 text-xs text-muted-foreground hover:border-transparent',
                )}
                onClick={(event) => event.stopPropagation()}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}

      {!plainDescription && links.length === 0 && (
        <p className="text-base italic text-muted-foreground">No description provided.</p>
      )}
    </div>
  );
}
