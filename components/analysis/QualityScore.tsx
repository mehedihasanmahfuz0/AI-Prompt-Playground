'use client'

import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import { SkeletonBlock } from '@/components/ui/Skeleton'
import type { AnalysisResult } from '@/types'

const CRITERIA_META = {
  clarity:      { label: 'Clarity',        desc: 'Is the instruction clear and unambiguous?',         tip: 'Use precise verbs. "List 5 bullet points" is clearer than "tell me about".' },
  context:      { label: 'Context',         desc: 'Is enough background provided?',                    tip: 'Add your role, audience, and domain. Context reduces hallucination.' },
  constraints:  { label: 'Constraints',     desc: 'Are rules and boundaries specified?',               tip: 'State what NOT to do, the tone, and any format restrictions.' },
  outputFormat: { label: 'Output Format',   desc: 'Is the desired output format stated?',              tip: 'Specify: JSON, markdown, numbered list, word count, etc.' },
} as const

function scoreColor(n: number) {
  if (n >= 70) return 'text-score-high'
  if (n >= 40) return 'text-score-mid'
  return 'text-score-low'
}
function barColor(n: number) {
  if (n >= 70) return 'bg-score-high'
  if (n >= 40) return 'bg-score-mid'
  return 'bg-score-low'
}
function scoreLabel(n: number) {
  if (n >= 80) return 'Excellent'
  if (n >= 70) return 'Good'
  if (n >= 50) return 'Fair'
  if (n >= 30) return 'Weak'
  return 'Poor'
}
function scoreBg(n: number) {
  if (n >= 70) return 'bg-score-high/10 border-score-high/30'
  if (n >= 40) return 'bg-score-mid/10 border-score-mid/30'
  return 'bg-score-low/10 border-score-low/30'
}

interface Props {
  result: AnalysisResult | null
  isLoading: boolean
  error?: string
  onAnalyze: () => void
  promptEmpty: boolean
}

export function QualityScore({ result, isLoading, error, onAnalyze, promptEmpty }: Props) {
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
          Scoring your prompt across 4 dimensions…
        </p>
        <SkeletonBlock lines={6} />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-center px-8">
        <div className="w-14 h-14 rounded-2xl bg-bg-surface border border-line-base flex items-center justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-ink-muted">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 7v5.5l3.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-sm text-ink-secondary font-medium mb-1">Score your prompt quality</p>
        <p className="text-xs text-ink-muted mb-1 max-w-xs leading-relaxed">
          Get an AI-powered score across <strong className="text-ink-secondary">Clarity</strong>, <strong className="text-ink-secondary">Context</strong>, <strong className="text-ink-secondary">Constraints</strong>, and <strong className="text-ink-secondary">Output Format</strong>.
        </p>
        <p className="text-xs text-ink-muted mb-5 max-w-xs leading-relaxed">
          Each dimension is scored 0–100 with a weighted total. Use it to understand exactly where your prompt is weak.
        </p>
        <Button variant="primary" size="sm" onClick={onAnalyze} disabled={promptEmpty}>
          Analyze prompt
        </Button>
        {error && <p className="text-xs text-score-low mt-3">{error}</p>}
      </div>
    )
  }

  const { score, criteria } = result
  const weakest = (Object.keys(criteria) as (keyof typeof criteria)[])
    .sort((a, b) => criteria[a] - criteria[b])[0]

  return (
    <div className="p-4 md:p-5 animate-fadeIn space-y-5">
      {/* Score hero */}
      <div className={cn('flex items-center gap-5 p-4 rounded-xl border', scoreBg(score))}>
        <div className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-bg-elevated border border-line-base flex-shrink-0">
          <span className={cn('text-3xl font-bold tabular-nums', scoreColor(score))}>{score}</span>
          <span className="text-[10px] text-ink-muted">/100</span>
        </div>
        <div className="min-w-0">
          <p className={cn('text-xl font-bold', scoreColor(score))}>{scoreLabel(score)}</p>
          <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">
            Weighted score: Clarity 30% · Context 25% · Constraints 25% · Format 20%
          </p>
          {score < 70 && (
            <p className="text-xs text-ink-muted mt-1">
              Weakest area: <span className={cn('font-medium', scoreColor(criteria[weakest]))}>
                {CRITERIA_META[weakest].label} ({criteria[weakest]})
              </span>
            </p>
          )}
          <button
            onClick={onAnalyze}
            className="mt-3 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent/15 border border-accent/30 text-accent-light text-xs font-semibold hover:bg-accent/25 hover:border-accent/50 transition-all shadow-[0_0_8px_rgba(124,58,237,0.15)]"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M13.5 2.5l-8 8-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.5 6.5V2.5H9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Re-analyze prompt
          </button>
        </div>
      </div>

      {/* Criteria breakdown */}
      <div className="space-y-4">
        {(Object.keys(CRITERIA_META) as (keyof typeof CRITERIA_META)[]).map((key) => {
          const { label, desc, tip } = CRITERIA_META[key]
          const val = criteria?.[key] ?? 0
          return (
            <div key={key} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-ink-primary">{label}</span>
                  <span className="text-[10px] text-ink-muted ml-2 hidden sm:inline">{desc}</span>
                </div>
                <span className={cn('text-xs font-bold tabular-nums flex-shrink-0 ml-2', scoreColor(val))}>
                  {val}
                </span>
              </div>
              <div className="score-bar-track mb-1.5">
                <div className={cn('score-bar-fill', barColor(val))} style={{ width: `${val}%` }} />
              </div>
              {val < 60 && (
                <p className="text-[11px] text-ink-muted leading-relaxed">
                  💡 {tip}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
