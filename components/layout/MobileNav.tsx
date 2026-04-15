'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'

const NAV = [
  {
    href: '/playground',
    label: 'Playground',
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="2" width="5" height="5" rx="1.5" fill="currentColor" opacity=".7" />
        <rect x="9" y="2" width="5" height="5" rx="1.5" fill="currentColor" />
        <rect x="2" y="9" width="5" height="5" rx="1.5" fill="currentColor" />
        <rect x="9" y="9" width="5" height="5" rx="1.5" fill="currentColor" opacity=".7" />
      </svg>
    ),
  },
  {
    href: '/history',
    label: 'History',
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 5v3.5l2 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/templates',
    label: 'Templates',
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="2" width="12" height="3" rx="1" fill="currentColor" opacity=".9" />
        <rect x="2" y="7" width="7" height="2" rx="1" fill="currentColor" opacity=".6" />
        <rect x="2" y="11" width="10" height="2" rx="1" fill="currentColor" opacity=".6" />
      </svg>
    ),
  },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden flex items-center border-b border-line-subtle bg-bg-base flex-shrink-0">
      {/* Logo mark */}
      <div className="flex items-center gap-2 px-4 py-3 border-r border-line-subtle flex-shrink-0">
        <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center shadow-glow-sm">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M3 5h10M3 8h7M3 11h8.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-ink-primary">Prompt</span>
      </div>

      {/* Nav links */}
      <div className="flex flex-1 overflow-x-auto">
        {NAV.map(({ href, label, icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 flex-shrink-0',
                isActive
                  ? 'text-ink-primary border-accent'
                  : 'text-ink-muted border-transparent hover:text-ink-secondary'
              )}
            >
              {icon}
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
