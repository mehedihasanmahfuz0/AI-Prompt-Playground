'use client'

import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useUiStore } from '@/store/uiStore'

export function useAnalyzePrompt() {
  const setAnalysisResult = useUiStore((s) => s.setAnalysisResult)

  return useMutation({
    mutationFn: ({ prompt }: { prompt: string }) => api.analyzePrompt(prompt),
    onSuccess: (data) => {
      setAnalysisResult(data)
    },
  })
}
