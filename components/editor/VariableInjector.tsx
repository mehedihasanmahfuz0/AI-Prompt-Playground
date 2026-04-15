'use client'

import { usePromptStore } from '@/store/promptStore'

export function VariableInjector() {
  const variables  = usePromptStore((s) => s.variables)
  const setVariable = usePromptStore((s) => s.setVariable)

  const entries = Object.entries(variables)
  if (entries.length === 0) return null

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-wide">
          Variables
        </p>
        <span className="text-[11px] text-ink-muted">
          — fill these to resolve your prompt
        </span>
      </div>
      <div className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
        {entries.map(([name, value]) => (
          <div key={name}>
            <label className="text-[11px] text-accent-light mb-1 block font-mono">
              {`{{${name}}}`}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setVariable(name, e.target.value)}
              placeholder={`Enter ${name}…`}
              className="w-full bg-bg-surface border border-line-base rounded-lg px-3 py-2
                         text-sm text-ink-primary outline-none focus:border-accent transition-colors
                         placeholder:text-ink-muted"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
