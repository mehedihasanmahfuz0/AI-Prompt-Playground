'use client'

import { usePromptStore } from '@/store/promptStore'
import { resolvePrompt } from '@/lib/variableParser'

export function PromptPreview() {
  const prompt = usePromptStore((s) => s.prompt)
  const variables = usePromptStore((s) => s.variables)

  const hasVars = Object.keys(variables).length > 0
  if (!hasVars || !prompt) return null

  const resolved = resolvePrompt(prompt, variables)
  if (resolved === prompt) return null

  return (
    <div>
      <p className="text-[11px] font-medium text-ink-muted uppercase tracking-wide mb-2">
        Preview (resolved)
      </p>
      <div className="p-3.5 rounded-xl bg-bg-surface border border-line-subtle">
        <pre className="text-xs text-ink-secondary font-mono leading-relaxed whitespace-pre-wrap break-words">
          {resolved}
        </pre>
      </div>
    </div>
  )
}
