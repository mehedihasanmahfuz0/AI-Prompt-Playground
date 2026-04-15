'use client'

import { useRef, useEffect } from 'react'
import { usePromptStore } from '@/store/promptStore'
import { estimateTokens, formatTokenCount } from '@/lib/tokenCounter'
import { Tooltip } from '@/components/ui'
import { cn } from '@/lib/cn'
import { VersionHistory } from './VersionHistory'

const MODELS = [
  { value: 'llama-3.3-70b-versatile', label: '70B · Best' },
  { value: 'llama-3.1-8b-instant',    label: '8B · Fast' },
] as const

interface Props {
  onRun: () => void
  promptEmpty: boolean
}

export function PromptEditor({ onRun, promptEmpty }: Props) {
  const prompt   = usePromptStore((s) => s.prompt)
  const model    = usePromptStore((s) => s.model)
  const setPrompt = usePromptStore((s) => s.setPrompt)
  const setModel  = usePromptStore((s) => s.setModel)
  const reset     = usePromptStore((s) => s.reset)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 400) + 'px'
  }, [prompt])

  const tokenEst   = estimateTokens(prompt)
  const isNearLimit = tokenEst > 1800

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd/Ctrl+Enter to run
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      if (!promptEmpty) onRun()
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Write your prompt here...\n\nTip: Use {{variable}} syntax for dynamic inputs.\nExample: Explain {{topic}} to a {{audience}} in {{language}}.\n\nPress Ctrl+Enter to run.`}
          className="prompt-textarea min-h-[180px] max-h-[400px] pr-10"
          spellCheck={false}
          autoFocus
        />
        {prompt && (
          <Tooltip text="Clear prompt">
            <button
              onClick={reset}
              className="absolute top-3 right-3 p-1 rounded text-ink-muted hover:text-score-low transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </Tooltip>
        )}
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value as typeof model)}
            className="bg-bg-surface border border-line-base text-ink-secondary text-xs rounded-lg
                       px-2.5 py-1.5 outline-none focus:border-accent transition-colors cursor-pointer
                       flex-shrink-0"
          >
            {MODELS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <VersionHistory />
        </div>

        <div className="flex items-center gap-2">
          <span className={cn('text-[11px] tabular-nums', isNearLimit ? 'text-score-mid' : 'text-ink-muted')}>
            {formatTokenCount(tokenEst)} tokens
          </span>
          <span className="text-[11px] text-ink-muted hidden sm:inline">
            · {prompt.length} chars
          </span>
          <span className="text-[11px] text-ink-muted hidden sm:inline">
            · Ctrl+↵ to run
          </span>
        </div>
      </div>
    </div>
  )
}
