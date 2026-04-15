import { create } from 'zustand'

interface CompareOutput {
  content: string
  isLoading: boolean
  error?: string
  score?: number
}

interface CompareState {
  // Prompts
  promptA: string
  promptB: string
  
  // Outputs
  outputA: CompareOutput
  outputB: CompareOutput
  
  // Shared variables (inherited from main prompt store)
  sharedVariables: Record<string, string>
  
  // Actions
  setPromptA: (prompt: string) => void
  setPromptB: (prompt: string) => void
  setOutputA: (output: Partial<CompareOutput>) => void
  setOutputB: (output: Partial<CompareOutput>) => void
  setSharedVariables: (vars: Record<string, string>) => void
  runComparison: () => void
  clearOutputs: () => void
  swapPrompts: () => void
  reset: () => void
}

const initialOutput: CompareOutput = {
  content: '',
  isLoading: false,
}

export const useCompareStore = create<CompareState>((set, get) => ({
  promptA: '',
  promptB: '',
  outputA: { ...initialOutput },
  outputB: { ...initialOutput },
  sharedVariables: {},

  setPromptA: (prompt) => set({ promptA: prompt }),
  setPromptB: (prompt) => set({ promptB: prompt }),
  
  setOutputA: (output) => set((s) => ({ 
    outputA: { ...s.outputA, ...output } 
  })),
  setOutputB: (output) => set((s) => ({ 
    outputB: { ...s.outputB, ...output } 
  })),
  
  setSharedVariables: (vars) => set({ sharedVariables: vars }),
  
  runComparison: () => {
    set({
      outputA: { ...initialOutput, isLoading: true },
      outputB: { ...initialOutput, isLoading: true },
    })
  },
  
  clearOutputs: () => set({
    outputA: { ...initialOutput },
    outputB: { ...initialOutput },
  }),
  
  swapPrompts: () => {
    const { promptA, promptB, outputA, outputB } = get()
    set({
      promptA: promptB,
      promptB: promptA,
      outputA: outputB,
      outputB: outputA,
    })
  },
  
  reset: () => set({
    promptA: '',
    promptB: '',
    outputA: { ...initialOutput },
    outputB: { ...initialOutput },
    sharedVariables: {},
  }),
}))
