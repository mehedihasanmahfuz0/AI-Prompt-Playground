'use client'

import { useState, useCallback } from 'react'
import { usePromptStore, selectResolved } from '@/store/promptStore'
import { useUiStore } from '@/store/uiStore'
import { useRunPrompt } from '@/hooks/useRunPrompt'
import { useAnalyzePrompt } from '@/hooks/useAnalyzePrompt'
import { useRewritePrompt } from '@/hooks/useRewritePrompt'
import { PromptEditor } from '@/components/editor/PromptEditor'
import { VariableInjector } from '@/components/editor/VariableInjector'
import { PromptPreview } from '@/components/editor/PromptPreview'
import { OutputPanel } from '@/components/output/OutputPanel'
import { QualityScore } from '@/components/analysis/QualityScore'
import { Suggestions } from '@/components/analysis/Suggestions'
import { ComparePanel } from '@/components/analysis/ComparePanel'
import { PromptRewriter } from '@/components/analysis/PromptRewriter'
import { MobileNav } from '@/components/layout/MobileNav'
import { Button } from '@/components/ui'
import { cn } from '@/lib/cn'
import type { TabId } from '@/types'

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'output',  label: 'Output',      icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 2.5l7 4-7 4v-8z" fill="currentColor"/></svg> },
  { id: 'score',   label: 'Score',       icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M8 5v5.5l3 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { id: 'suggest', label: 'Suggestions', icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2L9.5 6.5H14L10.5 9.5L12 14L8 11L4 14L5.5 9.5L2 6.5H6.5L8 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg> },
  { id: 'rewrite', label: 'Rewriter',    icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M13.5 2.5l-8 8-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M13.5 6.5V2.5H9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { id: 'compare', label: 'Compare',     icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="5" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="3" width="5" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg> },
]

export default function PlaygroundPage() {
  // ✅ Fix: subscribe to prompt+variables reactively, not via a stale method call
  const resolved    = usePromptStore(selectResolved)
  const activeTab   = useUiStore((s) => s.activeTab)
  const setActiveTab = useUiStore((s) => s.setActiveTab)
  const analysisResult = useUiStore((s) => s.analysisResult)

  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)
  // mobile: show editor or results panel
  const [mobilePanel, setMobilePanel] = useState<'editor' | 'results'>('editor')

  const runMutation     = useRunPrompt()
  const analyzeMutation = useAnalyzePrompt()
  const rewriteMutation = useRewritePrompt()

  const promptEmpty = !resolved.trim()

  const handleRun = useCallback(() => {
    if (promptEmpty) return
    setOutput('')
    setActiveTab('output')
    setMobilePanel('results')
    runMutation.mutate(
      { prompt: resolved },
      { onSuccess: (data) => setOutput(data.output) }
    )
  }, [resolved, promptEmpty, runMutation, setActiveTab])

  const handleAnalyze = useCallback(() => {
    if (promptEmpty) return
    analyzeMutation.mutate({ prompt: resolved })
  }, [resolved, promptEmpty, analyzeMutation])

  const handleRewrite = useCallback(() => {
    if (promptEmpty) return
    rewriteMutation.mutate({ prompt: resolved })
  }, [resolved, promptEmpty, rewriteMutation])

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRegenerate = () => {
    if (promptEmpty) return
    setOutput('')
    runMutation.mutate(
      { prompt: resolved, score: analysisResult?.score },
      { onSuccess: (data) => setOutput(data.output) }
    )
  }

  const rightPanel = (
    <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 py-3 border-b border-line-subtle flex-shrink-0 overflow-x-auto">
        {/* Mobile back button - more prominent with text label */}
        <button
          onClick={() => setMobilePanel('editor')}
          className="md:hidden flex-shrink-0 mr-3 px-3 py-2 rounded-lg bg-accent/15 border border-accent/30 text-accent-light hover:bg-accent/25 hover:border-accent/50 transition-all flex items-center gap-1.5"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-xs font-semibold">Editor</span>
        </button>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all border',
              activeTab === tab.id
                ? 'bg-accent/15 border-accent/40 text-accent-light shadow-[0_0_12px_rgba(124,58,237,0.2)]'
                : 'bg-bg-surface border-line-base text-ink-secondary hover:text-ink-primary hover:border-line-strong hover:bg-bg-hover'
            )}
          >
            <span className={cn('transition-transform', activeTab === tab.id && 'scale-110')}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'output' && (
          <OutputPanel
            output={output}
            isLoading={runMutation.isPending}
            error={runMutation.error?.message}
            onRegenerate={output ? handleRegenerate : undefined}
            onCopy={handleCopy}
            copied={copied}
          />
        )}
        {activeTab === 'score' && (
          <QualityScore
            result={analysisResult}
            isLoading={analyzeMutation.isPending}
            error={analyzeMutation.error?.message}
            onAnalyze={handleAnalyze}
            promptEmpty={promptEmpty}
          />
        )}
        {activeTab === 'suggest' && (
          <Suggestions
            result={analysisResult}
            isLoading={analyzeMutation.isPending}
            error={analyzeMutation.error?.message}
            onAnalyze={handleAnalyze}
            promptEmpty={promptEmpty}
          />
        )}
        {activeTab === 'rewrite' && (
          <PromptRewriter
            isLoading={rewriteMutation.isPending}
            error={rewriteMutation.error?.message}
            onRewrite={handleRewrite}
            promptEmpty={promptEmpty}
          />
        )}
        {activeTab === 'compare' && <ComparePanel />}
      </div>
    </div>
  )

  const leftPanel = (
    <div className="flex flex-col w-full md:w-[48%] min-w-0 md:border-r border-line-subtle overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-5 py-4 border-b border-line-subtle flex-shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-ink-primary">Prompt Editor</h1>
          <p className="text-xs text-ink-muted mt-0.5 hidden sm:block">Write, inject variables, preview</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Mobile: show results button */}
          {output && (
            <button
              onClick={() => setMobilePanel('results')}
              className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                         text-accent-light bg-accent/10 border border-accent/20 transition-all"
            >
              View output
            </button>
          )}
          <Button
            variant="primary"
            size="md"
            onClick={handleRun}
            loading={runMutation.isPending}
            disabled={promptEmpty}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M3 2.5l7 4-7 4v-8z" fill="currentColor" />
            </svg>
            Run
          </Button>
        </div>
      </div>

      {/* Editor body */}
      <div className="flex flex-col gap-4 p-4 md:p-5">
        <PromptEditor onRun={handleRun} promptEmpty={promptEmpty} />
        <VariableInjector />
        <PromptPreview />
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop: side-by-side */}
      <div className="hidden md:flex h-full overflow-hidden">
        {leftPanel}
        {rightPanel}
      </div>

      {/* Mobile: stacked, toggle between panels */}
      <div className="flex md:hidden flex-col h-full overflow-hidden">
        {mobilePanel === 'editor' ? leftPanel : rightPanel}
      </div>
    </>
  )
}
