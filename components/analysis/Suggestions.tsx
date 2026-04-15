'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { SkeletonBlock } from '@/components/ui/Skeleton'
import { usePromptStore } from '@/store/promptStore'
import { useVersionStore } from '@/store/versionStore'
import type { AnalysisResult } from '@/types'

interface Props {
  result: AnalysisResult | null
  isLoading: boolean
  error?: string
  onAnalyze: () => void
  promptEmpty: boolean
}

export function Suggestions({ result, isLoading, error, onAnalyze, promptEmpty }: Props) {
  const prompt    = usePromptStore((s) => s.prompt)
  const setPrompt = usePromptStore((s) => s.setPrompt)
  const addVersion = useVersionStore((s) => s.addVersion)
  const [applied, setApplied] = useState<Set<number>>(new Set())

  // Each suggestion gets appended as a clear instruction line
  const handleApply = (suggestion: string, index: number) => {
    // Save version before applying
    addVersion({
      prompt,
      source: 'suggestion',
      score: result?.score ?? null,
      label: `Before suggestion ${index + 1}`,
    })
    // Smart-append: add it as a new requirement line, not a comment
    const trimmed = prompt.trimEnd()
    const separator = trimmed.endsWith('.') || trimmed.endsWith(':') ? '\n' : '\n\n'
    setPrompt(`${trimmed}${separator}Also: ${suggestion}`)
    setApplied((prev) => new Set([...prev, index]))
  }

  const handleApplyAll = () => {
    if (!result) return
    // Save version before applying all
    addVersion({
      prompt,
      source: 'suggestion',
      score: result?.score ?? null,
      label: 'Before applying all suggestions',
    })
    const additions = result.suggestions
      .map((s) => `Also: ${s}`)
      .join('\n')
    setPrompt(`${prompt.trimEnd()}\n\n${additions}`)
    setApplied(new Set(result.suggestions.map((_, i) => i)))
  }

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
          Generating improvement suggestions…
        </p>
        <SkeletonBlock lines={5} />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-center px-8">
        <div className="w-14 h-14 rounded-2xl bg-bg-surface border border-line-base flex items-center justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-ink-muted">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-sm text-ink-secondary font-medium mb-1">Get actionable improvement tips</p>
        <p className="text-xs text-ink-muted mb-2 max-w-xs leading-relaxed">
          Runs the same analysis as Score, then extracts the 3 most impactful specific improvements you can apply directly to your prompt.
        </p>
        <p className="text-xs text-ink-muted mb-5 max-w-xs leading-relaxed">
          Each suggestion has an <strong className="text-ink-secondary">Apply</strong> button that appends it to your prompt automatically.
        </p>
        <Button variant="primary" size="sm" onClick={onAnalyze} disabled={promptEmpty}>
          Generate suggestions
        </Button>
        {error && <p className="text-xs text-score-low mt-3">{error}</p>}
      </div>
    )
  }

  const { suggestions = [] } = result

  if (suggestions.length === 0) {
    return (
      <div className="p-5 animate-fadeIn">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-score-high/10 border border-score-high/20">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className="text-score-high flex-shrink-0">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
            <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <p className="text-sm font-medium text-score-high">Great prompt!</p>
            <p className="text-xs text-score-high/70">No significant improvements needed.</p>
          </div>
        </div>
        <button
          onClick={onAnalyze}
          className="mt-4 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent/15 border border-accent/30 text-accent-light text-xs font-semibold hover:bg-accent/25 hover:border-accent/50 transition-all shadow-[0_0_8px_rgba(124,58,237,0.15)]"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M13.5 2.5l-8 8-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13.5 6.5V2.5H9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Re-analyze prompt
        </button>
      </div>
    )
  }

  const allApplied = applied.size === suggestions.length

  return (
    <div className="p-4 md:p-5 animate-fadeIn">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-xs font-semibold text-ink-secondary uppercase tracking-wide">
          {suggestions.length} Suggestion{suggestions.length !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-2">
          {!allApplied && (
            <Button variant="secondary" size="sm" onClick={handleApplyAll}>
              Apply all
            </Button>
          )}
          <button
            onClick={onAnalyze}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent/15 border border-accent/30 text-accent-light text-xs font-semibold hover:bg-accent/25 hover:border-accent/50 transition-all shadow-[0_0_8px_rgba(124,58,237,0.15)]"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M13.5 2.5l-8 8-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.5 6.5V2.5H9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Re-analyze
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {suggestions.map((s, i) => {
          const isApplied = applied.has(i)
          return (
            <div
              key={i}
              className={cn_local(
                'flex items-start gap-3 p-3.5 rounded-xl border transition-all animate-fadeIn',
                isApplied
                  ? 'bg-score-high/5 border-score-high/20'
                  : 'bg-bg-surface border-line-subtle hover:border-line-base'
              )}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className={cn_local(
                'w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all',
                isApplied ? 'bg-score-high/20 border border-score-high/30' : 'bg-accent/15 border border-accent/25'
              )}>
                {isApplied ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2 2 4-4" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span className="text-[10px] font-bold text-accent-light">{i + 1}</span>
                )}
              </div>
              <p className="flex-1 text-sm text-ink-secondary leading-relaxed">{s}</p>
              {!isApplied && (
                <button
                  onClick={() => handleApply(s, i)}
                  className="flex-shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-md
                             text-accent-light bg-accent/10 border border-accent/20
                             hover:bg-accent/20 transition-all mt-0.5"
                >
                  Apply
                </button>
              )}
            </div>
          )
        })}
      </div>

      {allApplied && (
        <div className="mt-4 p-3 rounded-xl bg-score-high/5 border border-score-high/20 text-center">
          <p className="text-xs text-score-high font-medium">All suggestions applied to your prompt ✓</p>
          <p className="text-[11px] text-score-high/60 mt-0.5">Switch to the Editor tab to review the changes.</p>
        </div>
      )}
    </div>
  )
}

function cn_local(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
