import { cn } from '@/lib/utils'
import { icons, type IconName } from './icons'
import type { LucideProps } from 'lucide-react'

const defaultTooltips: Partial<Record<IconName, string>> = {
  X: 'Close',
  Trash2: 'Delete',
  Pencil: 'Edit',
  Plus: 'Add',
  Search: 'Search',
  Moon: 'Dark mode',
  Sun: 'Light mode',
  ArrowLeft: 'Back',
  FolderOpen: 'Open folder',
}

const tooltipPositionClasses = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
  left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
  right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
}

interface IconWrapperProps extends Omit<LucideProps, 'ref'> {
  name: IconName
  /** Tooltip text. Pass `null` to suppress even the built-in default. */
  tooltip?: string | null
  tooltipPosition?: keyof typeof tooltipPositionClasses
  /** Classes applied to the tooltip element — use this to set bg, text color, etc. */
  tooltipClassName?: string
}

export function IconWrapper({
  name,
  tooltip,
  tooltipPosition = 'top',
  tooltipClassName,
  className,
  ...props
}: IconWrapperProps) {
  const Icon = icons[name]

  // null → no tooltip; undefined → fall through to default
  const effectiveTooltip = tooltip === null ? null : (tooltip ?? defaultTooltips[name])

  if (!effectiveTooltip) {
    return <Icon className={className} {...props} />
  }

  return (
    <span className="relative inline-flex group/tooltip">
      <Icon className={className} {...props} />
      <span
        className={cn(
          'absolute z-50 whitespace-nowrap rounded px-2 py-1 text-xs font-medium',
          'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900',
          'shadow-sm',
          'opacity-0 group-hover/tooltip:opacity-100 pointer-events-none',
          'transition-opacity duration-150',
          tooltipPositionClasses[tooltipPosition],
          tooltipClassName,
        )}
      >
        {effectiveTooltip}
      </span>
    </span>
  )
}
