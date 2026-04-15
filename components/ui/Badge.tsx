import { cn } from '@/lib/cn'
import type { HTMLAttributes } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'danger'
}

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium',
        variant === 'default' && 'bg-bg-surface text-ink-muted border border-line-base',
        variant === 'accent' && 'bg-accent/10 text-accent-light border border-accent/20',
        variant === 'success' && 'bg-score-high/10 text-score-high border border-score-high/20',
        variant === 'warning' && 'bg-score-mid/10 text-score-mid border border-score-mid/20',
        variant === 'danger' && 'bg-score-low/10 text-score-low border border-score-low/20',
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
