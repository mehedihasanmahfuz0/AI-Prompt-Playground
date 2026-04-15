'use client'

import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useHistoryStore } from '@/store/historyStore'
import { usePromptStore } from '@/store/promptStore'

export function useRunPrompt() {
  const addEntry = useHistoryStore((s) => s.addEntry)
  const model = usePromptStore((s) => s.model)

  return useMutation({
    mutationFn: ({ prompt }: { prompt: string; score?: number | null }) =>
      api.runPrompt(prompt, model),
    onSuccess: (data, variables) => {
      addEntry({
        prompt: variables.prompt,
        output: data.output,
        model: data.model ?? model,
        score: variables.score ?? null,
      })
    },
  })
}
