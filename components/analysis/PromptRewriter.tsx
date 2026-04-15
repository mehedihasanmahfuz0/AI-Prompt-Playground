'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { SkeletonBlock } from '@/components/ui/Skeleton'
import { usePromptStore } from '@/store/promptStore'
import { useUiStore } from '@/store/uiStore'
import { useVersionStore } from '@/store/versionStore'

interface Props {
  isLoading: boolean
  error?: string
  onRewrite: () => void
  promptEmpty: boolean
}

export function PromptRewriter({ isLoading, error, onRewrite, promptEmpty }: Props) {
  const rewriteResult  = useUiStore((s) => s.rewriteResult)
  const clearRewrite   = useUiStore((s) => s.clearRewrite)
  const originalPrompt = usePromptStore((s) => s.prompt)
  const setPrompt      = usePromptStore((s) => s.setPrompt)
  const addVersion     = useVersionStore((s) => s.addVersion)
  const analysisResult = useUiStore((s) => s.analysisResult)
  const [copied, setCopied] = useState(false)

  const handleUse = () => {
    if (rewriteResult) {
      // Save the original as a version before replacing
      addVersion({
        prompt: originalPrompt,
        source: 'manual',
        score: analysisResult?.score ?? null,
        label: 'Before AI rewrite',
      })
      setPrompt(rewriteResult)
      clearRewrite()
    }
  }

  const handleCopy = () => {
    if (rewriteResult) {
      navigator.clipboard.writeText(rewriteResult)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
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
          Rewriting for maximum clarity and effectiveness…
        </p>
        <SkeletonBlock lines={6} />
      </div>
    )
  }

  if (!rewriteResult) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-center px-8">
        <div className="w-14 h-14 rounded-2xl bg-bg-surface border border-line-base flex items-center justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-ink-muted">
            <path d="M12 20h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-sm text-ink-secondary font-medium mb-1">AI Prompt Rewriter</p>
        <p className="text-xs text-ink-muted mb-2 max-w-xs leading-relaxed">
          Sends your prompt to a prompt-engineer LLM that rewrites it to be more specific, clear, and effective.
        </p>
        <ul className="text-left text-xs text-ink-muted mb-5 space-y-1 max-w-xs">
          <li>✓ Keeps your original intent intact</li>
          <li>✓ Adds missing context and constraints</li>
          <li>✓ Replaces vague words with concrete ones</li>
          <li>✓ Adds output format instructions if missing</li>
        </ul>
        <Button variant="primary" size="sm" onClick={onRewrite} disabled={promptEmpty}>
          Rewrite prompt
        </Button>
        {error && <p className="text-xs text-score-low mt-3">{error}</p>}
      </div>
    )
  }

  // Compute a rough diff: how many words changed?
  const origWords = originalPrompt.trim().split(/\s+/).length
  const newWords  = rewriteResult.trim().split(/\s+/).length
  const wordDiff  = newWords - origWords

  return (
    <div className="p-4 md:p-5 animate-fadeIn flex flex-col gap-4">
      {/* Stats bar */}
      <div className="flex items-center gap-3 p-2.5 rounded-lg bg-bg-surface border border-line-subtle flex-wrap">
        <span className="text-[11px] text-ink-muted">
          Original: <strong className="text-ink-secondary">{origWords} words</strong>
        </span>
        <span className="text-ink-muted text-[11px]">→</span>
        <span className="text-[11px] text-ink-muted">
          Rewritten: <strong className="text-ink-secondary">{newWords} words</strong>
        </span>
        {wordDiff !== 0 && (
          <span className={`text-[11px] font-medium ${wordDiff > 0 ? 'text-score-mid' : 'text-score-high'}`}>
            ({wordDiff > 0 ? '+' : ''}{wordDiff} words)
          </span>
        )}
      </div>

      {/* Original */}
      <div>
        <p className="text-[11px] uppercase tracking-wide text-ink-muted font-semibold mb-2">Original</p>
        <div className="p-3.5 rounded-xl bg-bg-surface border border-line-subtle max-h-40 overflow-y-auto">
          <p className="text-sm text-ink-muted font-mono leading-relaxed whitespace-pre-wrap break-words">
            {originalPrompt}
          </p>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex items-center justify-center gap-2">
        <div className="flex-1 h-px bg-line-subtle" />
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-accent">
            <path d="M6 1v10M2 7l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[10px] font-semibold text-accent-light">AI Improved</span>
        </div>
        <div className="flex-1 h-px bg-line-subtle" />
      </div>

      {/* Rewritten */}
      <div>
        <p className="text-[11px] uppercase tracking-wide text-score-high font-semibold mb-2">Improved Version</p>
        <div className="p-3.5 rounded-xl bg-score-high/5 border border-score-high/20 max-h-60 overflow-y-auto">
          <p className="text-sm text-ink-primary font-mono leading-relaxed whitespace-pre-wrap break-words">
            {rewriteResult}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <Button variant="primary" size="sm" onClick={handleUse} className="flex-1 min-w-[120px]">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Use this version
        </Button>
        <Button variant="ghost" size="sm" onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy'}
        </Button>
        <button
          onClick={onRewrite}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent/15 border border-accent/30 text-accent-light text-xs font-semibold hover:bg-accent/25 hover:border-accent/50 transition-all shadow-[0_0_8px_rgba(124,58,237,0.15)]"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M13.5 2.5l-8 8-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13.5 6.5V2.5H9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Rewrite again
        </button>
        <Button variant="ghost" size="sm" onClick={clearRewrite}>
          Discard
        </Button>
      </div>
    </div>
  )
}
