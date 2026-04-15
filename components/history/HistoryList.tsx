'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { useHistoryStore } from '@/store/historyStore'
import { usePromptStore } from '@/store/promptStore'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { HistoryEntry } from '@/types'

interface Props {
  entries: HistoryEntry[]
  search: string
}

function scoreVariant(score: number | null) {
  if (score === null) return 'default' as const
  if (score >= 70) return 'success' as const
  if (score >= 40) return 'warning' as const
  return 'danger' as const
}

function EntryCard({ entry }: { entry: HistoryEntry }) {
  const [expanded, setExpanded]   = useState(false)
  const [copied, setCopied]       = useState(false)
  const router = useRouter()
  const removeEntry = useHistoryStore((s) => s.removeEntry)
  const applyTemplate = usePromptStore((s) => s.applyTemplate)

  const handleReuse = () => {
    applyTemplate({ id: entry.id, name: '', category: '', description: '', prompt: entry.prompt })
    router.push('/playground')
  }

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(entry.prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyOutput = () => {
    navigator.clipboard.writeText(entry.output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const modelShort = entry.model
    .replace('llama-3.3-', 'Llama 3.3 ')
    .replace('llama-3.1-', 'Llama 3.1 ')
    .replace('-versatile', ' 70B')
    .replace('-instant', ' 8B')

  return (
    <div className="glass-card p-4 flex flex-col gap-3 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <Badge variant="default">{modelShort}</Badge>
          {entry.score !== null && (
            <Badge variant={scoreVariant(entry.score)}>Score {entry.score}</Badge>
          )}
          <span className="text-[11px] text-ink-muted">
            {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
          </span>
        </div>
        <button
          onClick={() => removeEntry(entry.id)}
          className="text-ink-muted hover:text-score-low transition-colors flex-shrink-0 p-1"
          aria-label="Delete entry"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M2 2l9 9M11 2L2 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Prompt */}
      <div>
        <p className="text-[11px] text-ink-muted mb-1.5 uppercase tracking-wide font-semibold">Prompt</p>
        <p className={`text-sm text-ink-secondary font-mono leading-relaxed whitespace-pre-wrap break-words ${!expanded ? 'line-clamp-3' : ''}`}>
          {entry.prompt}
        </p>
      </div>

      {/* Output */}
      <div>
        <p className="text-[11px] text-ink-muted mb-1.5 uppercase tracking-wide font-semibold">Output</p>
        <p className={`text-sm text-ink-muted leading-relaxed whitespace-pre-wrap break-words ${!expanded ? 'line-clamp-2' : ''}`}>
          {entry.output}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-line-subtle flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Collapse' : 'Expand'}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleReuse}>
          Reuse prompt →
        </Button>
        <Button variant="ghost" size="sm" onClick={handleCopyPrompt}>
          {copied ? 'Copied!' : 'Copy prompt'}
        </Button>
        {expanded && (
          <Button variant="ghost" size="sm" onClick={handleCopyOutput}>
            Copy output
          </Button>
        )}
      </div>
    </div>
  )
}

export function HistoryList({ entries, search }: Props) {
  const filtered = search.trim()
    ? entries.filter(
        (e) =>
          e.prompt.toLowerCase().includes(search.toLowerCase()) ||
          e.output.toLowerCase().includes(search.toLowerCase())
      )
    : entries

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-2xl bg-bg-surface border border-line-base flex items-center justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-ink-muted">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 7v5.5l3.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-sm text-ink-secondary font-medium mb-1">No history yet</p>
        <p className="text-xs text-ink-muted max-w-xs leading-relaxed">
          Every prompt you run in the Playground is saved here automatically. Up to 100 entries, persisted locally.
        </p>
      </div>
    )
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-sm text-ink-secondary font-medium mb-1">No results for &ldquo;{search}&rdquo;</p>
        <p className="text-xs text-ink-muted">Try a different search term.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {filtered.map((entry) => (
        <EntryCard key={entry.id} entry={entry} />
      ))}
    </div>
  )
}
