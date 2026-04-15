import { create } from 'zustand'
import { extractVariables, resolvePrompt } from '@/lib/variableParser'
import type { ModelId, Template } from '@/types'

interface PromptState {
  prompt: string
  variables: Record<string, string>
  model: ModelId

  setPrompt: (prompt: string) => void
  setVariable: (name: string, value: string) => void
  setModel: (model: ModelId) => void
  applyTemplate: (template: Template) => void
  reset: () => void
}

export const usePromptStore = create<PromptState>((set, get) => ({
  prompt: '',
  variables: {},
  model: 'llama-3.3-70b-versatile',

  setPrompt: (prompt) => {
    const existing = get().variables
    const vars = extractVariables(prompt)
    const variables = vars.reduce<Record<string, string>>((acc, name) => {
      acc[name] = existing[name] ?? ''
      return acc
    }, {})
    set({ prompt, variables })
  },

  setVariable: (name, value) =>
    set((s) => ({ variables: { ...s.variables, [name]: value } })),

  setModel: (model) => set({ model }),

  applyTemplate: (template) => {
    const vars = extractVariables(template.prompt)
    const variables = vars.reduce<Record<string, string>>(
      (acc, name) => ({ ...acc, [name]: '' }),
      {}
    )
    set({ prompt: template.prompt, variables })
  },

  reset: () => set({ prompt: '', variables: {} }),
}))

// Derived selector — use this in components, not getResolvedPrompt()
export function selectResolved(s: PromptState) {
  return resolvePrompt(s.prompt, s.variables)
}
