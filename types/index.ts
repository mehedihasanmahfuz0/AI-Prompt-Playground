export interface HistoryEntry {
  id: string
  timestamp: number
  prompt: string
  output: string
  model: string
  score: number | null
}

export interface AnalysisResult {
  score: number
  criteria: {
    clarity: number
    context: number
    constraints: number
    outputFormat: number
  }
  suggestions: string[]
}

export interface Template {
  id: string
  name: string
  category: string
  description: string
  prompt: string
}

export type TabId = 'output' | 'score' | 'suggest' | 'rewrite' | 'compare'

export type ModelId = 'llama-3.3-70b-versatile' | 'llama-3.1-8b-instant'
