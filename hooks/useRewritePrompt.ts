'use client'

import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useUiStore } from '@/store/uiStore'
import { useVersionStore } from '@/store/versionStore'

export function useRewritePrompt() {
  const setRewriteResult = useUiStore((s) => s.setRewriteResult)
  const addVersion = useVersionStore((s) => s.addVersion)
  const analysisResult = useUiStore((s) => s.analysisResult)

  return useMutation({
    mutationFn: ({ prompt }: { prompt: string }) => api.rewritePrompt(prompt),
    onSuccess: (data, variables) => {
      setRewriteResult(data.rewritten)
      // Save the original prompt as a version
      addVersion({
        prompt: variables.prompt,
        source: 'rewrite',
        score: analysisResult?.score ?? null,
        label: 'Pre-rewrite version',
      })
    },
  })
}
