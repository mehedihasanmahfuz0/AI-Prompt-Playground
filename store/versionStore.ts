import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PromptVersion {
  id: string
  timestamp: number
  prompt: string
  source: 'manual' | 'rewrite' | 'template' | 'suggestion'
  score?: number | null
  label?: string
}

interface VersionState {
  versions: PromptVersion[]
  currentVersionId: string | null
  
  // Actions
  addVersion: (version: Omit<PromptVersion, 'id' | 'timestamp'>) => string
  revertToVersion: (id: string) => PromptVersion | undefined
  getVersion: (id: string) => PromptVersion | undefined
  getVersionHistory: () => PromptVersion[]
  deleteVersion: (id: string) => void
  clearAllVersions: () => void
  setCurrentVersionId: (id: string | null) => void
  updateVersionLabel: (id: string, label: string) => void
  // Helper to get latest version
  getLatestVersion: () => PromptVersion | undefined
}

const MAX_VERSIONS = 50

export const useVersionStore = create<VersionState>()(
  persist(
    (set, get) => ({
      versions: [],
      currentVersionId: null,

      addVersion: (version) => {
        const newVersion: PromptVersion = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          ...version,
        }
        set((s) => ({
          versions: [newVersion, ...s.versions].slice(0, MAX_VERSIONS),
          currentVersionId: newVersion.id,
        }))
        return newVersion.id
      },

      revertToVersion: (id) => {
        const version = get().versions.find((v) => v.id === id)
        if (version) {
          set({ currentVersionId: id })
        }
        return version
      },

      getVersion: (id) => {
        return get().versions.find((v) => v.id === id)
      },

      getVersionHistory: () => {
        return get().versions
      },

      deleteVersion: (id) => {
        set((s) => ({
          versions: s.versions.filter((v) => v.id !== id),
          currentVersionId: s.currentVersionId === id ? null : s.currentVersionId,
        }))
      },

      clearAllVersions: () => {
        set({ versions: [], currentVersionId: null })
      },

      setCurrentVersionId: (id) => {
        set({ currentVersionId: id })
      },

      updateVersionLabel: (id, label) => {
        set((s) => ({
          versions: s.versions.map((v) =>
            v.id === id ? { ...v, label } : v
          ),
        }))
      },

      getLatestVersion: () => {
        const { versions } = get()
        return versions[0]
      },
    }),
    {
      name: 'pp-versions-v1',
      partialize: (s) => ({ versions: s.versions }),
    }
  )
)
