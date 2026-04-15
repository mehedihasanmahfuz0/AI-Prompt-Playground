'use client'

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', loading, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-1.5 font-medium rounded-lg transition-all select-none',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          size === 'sm' && 'text-xs px-3 py-1.5',
          size === 'md' && 'text-sm px-4 py-2',
          variant === 'primary' &&
            'bg-accent text-white hover:bg-accent/90 shadow-glow-sm',
          variant === 'secondary' &&
            'bg-bg-surface border border-line-base text-ink-secondary hover:text-ink-primary hover:border-line-strong',
          variant === 'ghost' &&
            'text-ink-muted hover:text-ink-secondary hover:bg-bg-hover',
          variant === 'danger' &&
            'bg-score-low/10 border border-score-low/30 text-score-low hover:bg-score-low/20',
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1 h-1 rounded-full bg-current animate-pulse2"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </span>
        ) : (
          children
        )}
      </button>
    )
  }
)
Button.displayName = 'Button'
