'use client'

import { useCallback, useEffect } from 'react'
import { useCompareStore } from '@/store/compareStore'
import { usePromptStore, selectResolved } from '@/store/promptStore'
import { useUiStore } from '@/store/uiStore'
import { useRunPrompt } from '@/hooks/useRunPrompt'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { SkeletonBlock } from '@/components/ui/Skeleton'
import { resolvePrompt } from '@/lib/variableParser'
import { cn } from '@/lib/cn'
import ReactMarkdown from 'react-markdown'

// Cache for analyzed prompts to ensure consistency
const analysisCache = new Map<string, number>()

export function ComparePanel() {
  const {
    promptA,
    promptB,
    outputA,
    outputB,
    sharedVariables,
    setPromptA,
    setPromptB,
    setOutputA,
    setOutputB,
    swapPrompts,
    clearOutputs,
  } = useCompareStore()

  // Sync shared variables from main prompt store
  const mainVariables = usePromptStore((s) => s.variables)
  const mainResolved = usePromptStore(selectResolved)
  const analysisResult = useUiStore((s) => s.analysisResult)

  const resolvedA = resolvePrompt(promptA, sharedVariables)
  const resolvedB = resolvePrompt(promptB, sharedVariables)

  const runMutationA = useRunPrompt()
  const runMutationB = useRunPrompt()

  // Helper to get score - uses cache or main analysis result for consistency
  const getScore = useCallback(async (prompt: string): Promise<number | undefined> => {
    // Check cache first
    if (analysisCache.has(prompt)) {
      return analysisCache.get(prompt)
    }

    // If this is the main editor prompt and we have an analysis result, use that
    if (prompt === mainResolved && analysisResult) {
      analysisCache.set(prompt, analysisResult.score)
      return analysisResult.score
    }

    // Otherwise, analyze and cache
    try {
      const result = await api.analyzePrompt(prompt)
      analysisCache.set(prompt, result.score)
      return result.score
    } catch {
      return undefined
    }
  }, [mainResolved, analysisResult])

  // Keep sharedVariables in sync with main prompt store
  useEffect(() => {
    useCompareStore.setState({ sharedVariables: mainVariables })
  }, [mainVariables])

  const handleRunA = useCallback(async () => {
    if (!resolvedA.trim()) return
    setOutputA({ isLoading: true, content: '', error: undefined, score: undefined })
    runMutationA.mutate(
      { prompt: resolvedA },
      {
        onSuccess: async (data) => {
          // Get score - uses cache or main analysis for consistency
          const score = await getScore(resolvedA)
          setOutputA({ isLoading: false, content: data.output, score })
        },
        onError: (error) => {
          setOutputA({ isLoading: false, error: error.message })
        },
      }
    )
  }, [resolvedA, runMutationA, setOutputA, getScore])

  const handleRunB = useCallback(async () => {
    if (!resolvedB.trim()) return
    setOutputB({ isLoading: true, content: '', error: undefined, score: undefined })
    runMutationB.mutate(
      { prompt: resolvedB },
      {
        onSuccess: async (data) => {
          // Get score - uses cache or main analysis for consistency
          const score = await getScore(resolvedB)
          setOutputB({ isLoading: false, content: data.output, score })
        },
        onError: (error) => {
          setOutputB({ isLoading: false, error: error.message })
        },
      }
    )
  }, [resolvedB, runMutationB, setOutputB, getScore])

  const handleRunBoth = useCallback(() => {
    handleRunA()
    handleRunB()
  }, [handleRunA, handleRunB])

  const isLoading = outputA.isLoading || outputB.isLoading
  const hasOutputs = outputA.content || outputB.content

  return (
    <div className="p-4 md:p-5 animate-fadeIn h-full flex flex-col">
      {/* Header with actions */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <p className="text-xs font-semibold text-ink-secondary uppercase tracking-wide">
            A/B Compare
          </p>
          <p className="text-[11px] text-ink-muted mt-0.5">
            Test two prompts with the same variables
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={swapPrompts} disabled={isLoading}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M4 6l4-4 4 4M4 10l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Swap
          </Button>
          <Button variant="secondary" size="sm" onClick={clearOutputs} disabled={isLoading}>
            Clear
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleRunBoth}
            loading={isLoading}
            disabled={!resolvedA.trim() && !resolvedB.trim()}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M3 2.5l7 4-7 4v-8z" fill="currentColor"/>
            </svg>
            Run Both
          </Button>
        </div>
      </div>

      {/* Variables indicator */}
      {Object.keys(sharedVariables).length > 0 && (
        <div className="mb-4 p-2.5 rounded-lg bg-bg-surface border border-line-subtle flex flex-wrap gap-2 items-center">
          <span className="text-[11px] text-ink-muted">Shared variables:</span>
          {Object.entries(sharedVariables).map(([name, value]) => (
            <span
              key={name}
              className={cn(
                'text-[10px] px-2 py-0.5 rounded-full font-mono',
                value?.trim()
                  ? 'bg-score-high/15 text-score-high border border-score-high/30'
                  : 'bg-accent/10 text-accent-light border border-accent/20'
              )}
            >
              {name}: {value?.trim() || '∅'}
            </span>
          ))}
        </div>
      )}

      {/* Side-by-side editors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Prompt A */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-accent-light">Variant A</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRunA}
              loading={outputA.isLoading}
              disabled={!resolvedA.trim()}
            >
              Run A
            </Button>
          </div>
          <textarea
            value={promptA}
            onChange={(e) => setPromptA(e.target.value)}
            placeholder="Enter prompt variant A...&#10;&#10;Tip: Use {{variables}} from the main editor"
            className="prompt-textarea min-h-[120px] max-h-[200px] text-sm"
            spellCheck={false}
          />
          <div className="flex items-center justify-between text-[11px] text-ink-muted">
            <span>{promptA.length} chars</span>
            <span className={cn(
              'tabular-nums',
              !resolvedA.includes('{{') && 'text-score-high'
            )}>
              {resolvedA.includes('{{') ? 'Has unfilled variables' : 'Ready to run'}
            </span>
          </div>
        </div>

        {/* Prompt B */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-score-mid">Variant B</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRunB}
              loading={outputB.isLoading}
              disabled={!resolvedB.trim()}
            >
              Run B
            </Button>
          </div>
          <textarea
            value={promptB}
            onChange={(e) => setPromptB(e.target.value)}
            placeholder="Enter prompt variant B...&#10;&#10;Tip: Use {{variables}} from the main editor"
            className="prompt-textarea min-h-[120px] max-h-[200px] text-sm"
            spellCheck={false}
          />
          <div className="flex items-center justify-between text-[11px] text-ink-muted">
            <span>{promptB.length} chars</span>
            <span className={cn(
              'tabular-nums',
              !resolvedB.includes('{{') && 'text-score-high'
            )}>
              {resolvedB.includes('{{') ? 'Has unfilled variables' : 'Ready to run'}
            </span>
          </div>
        </div>
      </div>

      {/* Outputs comparison */}
      {hasOutputs && (
        <div className="flex-1 flex flex-col gap-3 overflow-hidden">
          {/* Score comparison bar */}
          {outputA.score !== undefined && outputB.score !== undefined && (
            <div className="p-2.5 rounded-lg bg-bg-surface border border-line-subtle flex items-center justify-center gap-4">
              <span className="text-xs font-semibold text-accent-light">A: {outputA.score}</span>
              <div className="flex-1 h-2 rounded-full bg-bg-elevated overflow-hidden flex">
                <div
                  className="h-full bg-accent transition-all"
                  style={{
                    width: `${outputA.score + outputB.score > 0 ? (outputA.score / (outputA.score + outputB.score)) * 100 : 50}%`,
                  }}
                />
                <div
                  className="h-full bg-score-mid transition-all"
                  style={{
                    width: `${outputA.score + outputB.score > 0 ? (outputB.score / (outputA.score + outputB.score)) * 100 : 50}%`,
                  }}
                />
              </div>
              <span className="text-xs font-semibold text-score-mid">B: {outputB.score}</span>
              {outputA.score !== outputB.score && (
                <span className={cn(
                  'text-[10px] px-2 py-0.5 rounded-full font-medium',
                  outputA.score > outputB.score
                    ? 'bg-accent/15 text-accent-light'
                    : 'bg-score-mid/15 text-score-mid'
                )}>
                  {outputA.score > outputB.score ? 'A Wins' : 'B Wins'}
                  (+{Math.abs(outputA.score - outputB.score)})
                </span>
              )}
            </div>
          )}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
            {/* Output A */}
            <div className="flex flex-col gap-2 overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-accent-light">Output A</span>
                <div className="flex items-center gap-3">
                  {outputA.score !== undefined && (
                    <span className={cn(
                      'text-[11px] px-2 py-0.5 rounded-full font-semibold',
                      outputA.score >= 70
                        ? 'bg-score-high/15 text-score-high'
                        : outputA.score >= 40
                        ? 'bg-score-mid/15 text-score-mid'
                        : 'bg-score-low/15 text-score-low'
                    )}>
                      Score: {outputA.score}
                    </span>
                  )}
                  {outputA.content && (
                    <span className="text-[11px] text-ink-muted">
                      {outputA.content.trim().split(/\s+/).length} words
                    </span>
                  )}
                </div>
              </div>
            <div className="flex-1 overflow-y-auto p-3 rounded-xl bg-bg-surface border border-line-subtle">
              {outputA.isLoading ? (
                <SkeletonBlock lines={6} />
              ) : outputA.error ? (
                <div className="p-3 rounded-lg bg-score-low/10 border border-score-low/20">
                  <p className="text-xs text-score-low">{outputA.error}</p>
                </div>
              ) : outputA.content ? (
                <div className="output-prose text-sm">
                  <ReactMarkdown>{outputA.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-xs text-ink-muted italic">No output yet</p>
              )}
            </div>
          </div>

          {/* Output B */}
          <div className="flex flex-col gap-2 overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-score-mid">Output B</span>
              <div className="flex items-center gap-3">
                {outputB.score !== undefined && (
                  <span className={cn(
                    'text-[11px] px-2 py-0.5 rounded-full font-semibold',
                    outputB.score >= 70
                      ? 'bg-score-high/15 text-score-high'
                      : outputB.score >= 40
                      ? 'bg-score-mid/15 text-score-mid'
                      : 'bg-score-low/15 text-score-low'
                  )}>
                    Score: {outputB.score}
                  </span>
                )}
                {outputB.content && (
                  <span className="text-[11px] text-ink-muted">
                    {outputB.content.trim().split(/\s+/).length} words
                  </span>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 rounded-xl bg-bg-surface border border-line-subtle">
              {outputB.isLoading ? (
                <SkeletonBlock lines={6} />
              ) : outputB.error ? (
                <div className="p-3 rounded-lg bg-score-low/10 border border-score-low/20">
                  <p className="text-xs text-score-low">{outputB.error}</p>
                </div>
              ) : outputB.content ? (
                <div className="output-prose text-sm">
                  <ReactMarkdown>{outputB.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-xs text-ink-muted italic">No output yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Empty state */}
      {!hasOutputs && (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-bg-surface border border-line-base flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-ink-muted">
              <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="13" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="13" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
          <p className="text-sm text-ink-secondary font-medium mb-1">Compare two prompt variants</p>
          <p className="text-xs text-ink-muted max-w-xs leading-relaxed">
            Write two different prompts above and click <strong className="text-ink-secondary">Run Both</strong> to see which performs better with the same variables.
          </p>
        </div>
      )}
    </div>
  )
}
