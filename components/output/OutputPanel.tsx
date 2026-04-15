'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { SkeletonBlock } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'

interface OutputPanelProps {
  output: string
  isLoading: boolean
  error?: string
  onRegenerate?: () => void
  onCopy: () => void
  copied: boolean
}

export function OutputPanel({ output, isLoading, error, onRegenerate, onCopy, copied }: OutputPanelProps) {
  const [viewRaw, setViewRaw] = useState(false)

  if (isLoading) {
    return (
      <div className="p-5 animate-fadeIn">
        <p className="text-xs text-ink-muted mb-4 flex items-center gap-2">
          <span className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse2"
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </span>
          Running prompt…
        </p>
        <SkeletonBlock lines={8} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-5 animate-fadeIn">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-score-low/5 border border-score-low/20">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-score-low flex-shrink-0 mt-0.5">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 5v3M8 10v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <div>
            <p className="text-sm font-medium text-score-low mb-1">Request failed</p>
            <p className="text-xs text-score-low/80">{error}</p>
          </div>
        </div>
        {onRegenerate && (
          <Button variant="secondary" size="sm" onClick={onRegenerate} className="mt-3">
            Try again
          </Button>
        )}
      </div>
    )
  }

  if (!output) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-center px-8">
        <div className="w-14 h-14 rounded-2xl bg-bg-surface border border-line-base flex items-center justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-ink-muted">
            <path d="M4 6h16M4 10h12M4 14h14M4 18h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-sm text-ink-secondary font-medium mb-1">No output yet</p>
        <p className="text-xs text-ink-muted max-w-xs leading-relaxed">
          Write a prompt in the editor and press <kbd className="px-1.5 py-0.5 rounded bg-bg-surface border border-line-base text-[10px] font-mono">Run</kbd> to see the AI response here.
        </p>
      </div>
    )
  }

  const wordCount = output.trim().split(/\s+/).length
  const charCount = output.length

  return (
    <div className="p-4 md:p-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <p className="text-[11px] font-medium text-ink-muted uppercase tracking-wide">Response</p>
          <span className="text-[11px] text-ink-muted tabular-nums">
            {wordCount} words · {charCount} chars
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewRaw((v) => !v)}
            className="text-[11px] px-2 py-1 rounded-md text-ink-muted hover:text-ink-secondary hover:bg-bg-hover transition-all"
          >
            {viewRaw ? 'Rendered' : 'Raw'}
          </button>
          {onRegenerate && (
            <Button variant="ghost" size="sm" onClick={onRegenerate}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M10 6A4 4 0 112 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <path d="M10 3v3H7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Regenerate
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onCopy}>
            {copied ? (
              <>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <rect x="4" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M1 8V2a1 1 0 011-1h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                Copy
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      {viewRaw ? (
        <pre className="text-sm text-ink-secondary font-mono leading-relaxed whitespace-pre-wrap break-words
                        p-4 rounded-xl bg-bg-surface border border-line-subtle">
          {output}
        </pre>
      ) : (
        <div className="output-prose">
          <ReactMarkdown>{output}</ReactMarkdown>
        </div>
      )}
    </div>
  )
}
