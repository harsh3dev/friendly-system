import { useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
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
  ArrowUpRight: 'Open in project',
  FolderOpen: 'Open folder',
}

interface TooltipPos {
  x: number;
  y: number;
  placement: 'top' | 'bottom';
}

interface IconWrapperProps extends Omit<LucideProps, 'ref'> {
  name: IconName
  tooltip?: string | null
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right'
  tooltipClassName?: string
}

export function IconWrapper({
  name,
  tooltip,
  tooltipPosition,
  tooltipClassName,
  className,
  ...props
}: IconWrapperProps) {
  const Icon = icons[name]
  const effectiveTooltip = tooltip === null ? null : (tooltip ?? defaultTooltips[name])

  const ref = useRef<HTMLSpanElement>(null)
  const [pos, setPos] = useState<TooltipPos | null>(null)

  const show = useCallback(() => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    const spaceAbove = r.top
    const placement = tooltipPosition === 'bottom' || spaceAbove < 48 ? 'bottom' : 'top'
    setPos({
      x: r.left + r.width / 2,
      y: placement === 'top' ? r.top - 6 : r.bottom + 6,
      placement,
    })
  }, [tooltipPosition])

  const hide = useCallback(() => setPos(null), [])

  if (!effectiveTooltip) {
    return <Icon className={className} {...props} />
  }

  return (
    <span
      ref={ref}
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <Icon className={className} {...props} />
      {pos &&
        createPortal(
          <span
            style={{
              position: 'fixed',
              left: pos.x,
              top: pos.y,
              transform: `translate(-50%, ${pos.placement === 'top' ? '-100%' : '0'})`,
            }}
            className={cn(
              'z-9999 whitespace-nowrap rounded px-2 py-1 text-xs font-medium pointer-events-none',
              'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900',
              'shadow-sm',
              tooltipClassName,
            )}
          >
            {effectiveTooltip}
          </span>,
          document.body,
        )}
    </span>
  )
}
