'use client'

import { useState, useCallback } from 'react'
import { useVersionStore, PromptVersion } from '@/store/versionStore'
import { usePromptStore } from '@/store/promptStore'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

const SOURCE_ICONS: Record<PromptVersion['source'], string> = {
  manual: '✏️',
  rewrite: '✨',
  template: '📋',
  suggestion: '💡',
}

const SOURCE_LABELS: Record<PromptVersion['source'], string> = {
  manual: 'Manual edit',
  rewrite: 'AI rewritten',
  template: 'Template',
  suggestion: 'Suggestion applied',
}

export function VersionHistory() {
  const [isOpen, setIsOpen] = useState(false)
  const [editingLabel, setEditingLabel] = useState<string | null>(null)
  const [labelInput, setLabelInput] = useState('')
  
  const versions = useVersionStore((s) => s.versions)
  const currentVersionId = useVersionStore((s) => s.currentVersionId)
  const revertToVersion = useVersionStore((s) => s.revertToVersion)
  const updateVersionLabel = useVersionStore((s) => s.updateVersionLabel)
  const clearAllVersions = useVersionStore((s) => s.clearAllVersions)
  
  const setPrompt = usePromptStore((s) => s.setPrompt)

  const handleRevert = useCallback((version: PromptVersion) => {
    revertToVersion(version.id)
    setPrompt(version.prompt)
    setIsOpen(false)
  }, [revertToVersion, setPrompt])

  const handleStartEditLabel = (version: PromptVersion) => {
    setEditingLabel(version.id)
    setLabelInput(version.label || '')
  }

  const handleSaveLabel = (id: string) => {
    if (labelInput.trim()) {
      updateVersionLabel(id, labelInput.trim())
    }
    setEditingLabel(null)
    setLabelInput('')
  }

  const handleDeleteVersion = (id: string) => {
    useVersionStore.getState().deleteVersion(id)
  }

  if (versions.length === 0) {
    return null
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
          isOpen
            ? 'bg-accent/15 border-accent/40 text-accent-light'
            : 'bg-bg-surface border-line-base text-ink-secondary hover:text-ink-primary hover:border-line-strong'
        )}
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <path d="M8 4v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
        v{versions.length}
        {currentVersionId && (
          <span className="text-[10px] text-ink-muted">
            · {(() => {
              const version = versions.find((v) => v.id === currentVersionId)
              if (!version) return null
              return formatDistanceToNow(version.timestamp, { addSuffix: true })
            })()}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-bg-elevated border border-line-base rounded-xl shadow-glow z-50 animate-fadeIn">
            <div className="flex items-center justify-between p-3 border-b border-line-subtle">
              <span className="text-xs font-semibold text-ink-primary">
                Version History
              </span>
              <button
                onClick={() => {
                  if (confirm('Clear all version history?')) {
                    clearAllVersions()
                  }
                }}
                className="text-[11px] text-score-low hover:text-score-low/80 transition-colors"
              >
                Clear all
              </button>
            </div>

            <div className="p-2 space-y-1">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className={cn(
                    'group p-2.5 rounded-lg border transition-all cursor-pointer',
                    currentVersionId === version.id
                      ? 'bg-accent/10 border-accent/30'
                      : 'bg-bg-surface border-line-subtle hover:border-line-base'
                  )}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base" title={SOURCE_LABELS[version.source]}>
                      {SOURCE_ICONS[version.source]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {editingLabel === version.id ? (
                          <input
                            type="text"
                            value={labelInput}
                            onChange={(e) => setLabelInput(e.target.value)}
                            onBlur={() => handleSaveLabel(version.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveLabel(version.id)
                              if (e.key === 'Escape') setEditingLabel(null)
                            }}
                            autoFocus
                            className="flex-1 bg-bg-elevated border border-accent/30 rounded px-2 py-0.5 text-xs text-ink-primary outline-none"
                            placeholder="Version label..."
                          />
                        ) : (
                          <button
                            onClick={() => handleStartEditLabel(version)}
                            className="text-xs font-medium text-ink-primary hover:text-accent-light transition-colors truncate"
                          >
                            {version.label || `Version ${versions.length - index}`}
                          </button>
                        )}
                        {version.score !== undefined && version.score !== null && (
                          <span
                            className={cn(
                              'text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                              version.score >= 70
                                ? 'bg-score-high/15 text-score-high'
                                : version.score >= 40
                                ? 'bg-score-mid/15 text-score-mid'
                                : 'bg-score-low/15 text-score-low'
                            )}
                          >
                            {version.score}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-ink-muted mt-0.5">
                        {formatDistanceToNow(version.timestamp, { addSuffix: true })}
                      </p>
                      <p className="text-[11px] text-ink-secondary mt-1 line-clamp-2 font-mono">
                        {version.prompt.slice(0, 60)}
                        {version.prompt.length > 60 ? '...' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mt-2 pt-2 border-t border-line-subtle/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevert(version)}
                      className="flex-1"
                    >
                      Revert
                    </Button>
                    <button
                      onClick={() => handleDeleteVersion(version.id)}
                      className="p-1.5 rounded text-ink-muted hover:text-score-low transition-colors"
                      title="Delete version"
                    >
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                        <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
