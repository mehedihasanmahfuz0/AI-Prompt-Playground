import type { AnalysisResult, ModelId } from '@/types'

const BASE = '/api'

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`)
  }
  return data as T
}

interface RunResponse {
  output: string
  model: ModelId
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
}

interface RewriteResponse {
  rewritten: string
}

export const api = {
  runPrompt: (prompt: string, model: ModelId) =>
    post<RunResponse>('/run', { prompt, model }),

  analyzePrompt: (prompt: string) =>
    post<AnalysisResult>('/analyze', { prompt }),

  rewritePrompt: (prompt: string) =>
    post<RewriteResponse>('/rewrite', { prompt }),
}
