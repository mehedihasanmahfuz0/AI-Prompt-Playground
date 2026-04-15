'use client'

import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface TooltipProps {
  text: string
  children: ReactNode
  className?: string
}

export function Tooltip({ text, children, className }: TooltipProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 pointer-events-none">
          <div className="px-2 py-1 rounded-md bg-bg-elevated border border-line-base text-[11px] text-ink-secondary whitespace-nowrap shadow-card">
            {text}
          </div>
        </div>
      )}
    </div>
  )
}
