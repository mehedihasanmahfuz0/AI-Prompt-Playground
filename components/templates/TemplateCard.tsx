'use client'

import { useRouter } from 'next/navigation'
import { usePromptStore } from '@/store/promptStore'
import { useVersionStore } from '@/store/versionStore'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { extractVariables } from '@/lib/variableParser'
import type { Template } from '@/types'

interface Props {
  template: Template
}

const CATEGORY_COLORS: Record<string, 'accent' | 'success' | 'warning' | 'default'> = {
  'Content':    'accent',
  'Development':'success',
  'Marketing':  'warning',
  'Business':   'accent',
  'AI / LLM':   'accent',
  'Creative':   'warning',
  'Career':     'success',
}

export function TemplateCard({ template }: Props) {
  const applyTemplate = usePromptStore((s) => s.applyTemplate)
  const addVersion = useVersionStore((s) => s.addVersion)
  const currentPrompt = usePromptStore((s) => s.prompt)
  const router = useRouter()
  const vars = extractVariables(template.prompt)

  const handleUse = () => {
    // Save current prompt as version if not empty
    if (currentPrompt.trim()) {
      addVersion({
        prompt: currentPrompt,
        source: 'template',
        label: `Before ${template.name} template`,
      })
    }
    applyTemplate(template)
    router.push('/playground')
  }

  const colorVariant = CATEGORY_COLORS[template.category] ?? 'default'

  return (
    <div className="glass-card p-4 flex flex-col gap-3 hover:border-line-strong transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink-primary truncate">{template.name}</p>
          <p className="text-xs text-ink-muted mt-0.5 leading-relaxed line-clamp-2">
            {template.description}
          </p>
        </div>
        <Badge variant={colorVariant} className="flex-shrink-0">{template.category}</Badge>
      </div>

      {/* Prompt preview */}
      <div className="p-2.5 rounded-lg bg-bg-surface border border-line-subtle">
        <p className="text-[11px] font-mono text-ink-muted leading-relaxed line-clamp-3">
          {template.prompt.slice(0, 120)}{template.prompt.length > 120 ? '…' : ''}
        </p>
      </div>

      {/* Variables */}
      {vars.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {vars.map((v) => (
            <span key={v}
              className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 border border-accent/20 text-accent-light font-mono">
              {`{{${v}}}`}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-line-subtle">
        <span className="text-[11px] text-ink-muted">
          {vars.length} variable{vars.length !== 1 ? 's' : ''}
        </span>
        <Button variant="secondary" size="sm" onClick={handleUse}>
          Use template →
        </Button>
      </div>
    </div>
  )
}
