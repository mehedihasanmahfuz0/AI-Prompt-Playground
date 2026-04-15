import { cn } from '@/lib/cn'

export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={cn('rounded-md bg-bg-surface animate-shimmer', className)} style={style} />
  )
}

export function SkeletonBlock({ lines = 3 }: { lines?: number }) {
  const widths = ['w-full', 'w-4/5', 'w-full', 'w-3/4', 'w-full', 'w-2/3']
  return (
    <div className="space-y-2.5">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-3', widths[i % widths.length])}
          style={{ animationDelay: `${i * 0.08}s` }}
        />
      ))}
    </div>
  )
}
