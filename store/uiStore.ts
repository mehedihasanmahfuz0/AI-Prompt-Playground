import { create } from 'zustand'
import type { AnalysisResult, TabId } from '@/types'

interface UiState {
  activeTab: TabId
  setActiveTab: (tab: TabId) => void

  analysisResult: AnalysisResult | null
  setAnalysisResult: (result: AnalysisResult) => void
  clearAnalysis: () => void

  rewriteResult: string | null
  setRewriteResult: (result: string) => void
  clearRewrite: () => void
}

export const useUiStore = create<UiState>((set) => ({
  activeTab: 'output',
  setActiveTab: (tab) => set({ activeTab: tab }),

  analysisResult: null,
  setAnalysisResult: (result) => set({ analysisResult: result }),
  clearAnalysis: () => set({ analysisResult: null }),

  rewriteResult: null,
  setRewriteResult: (result) => set({ rewriteResult: result }),
  clearRewrite: () => set({ rewriteResult: null }),
}))
