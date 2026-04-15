import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { HistoryEntry } from '@/types'

const MAX_HISTORY = 100

interface HistoryState {
  entries: HistoryEntry[]
  addEntry: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => string
  removeEntry: (id: string) => void
  clearAll: () => void
  getEntry: (id: string) => HistoryEntry | undefined
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      entries: [],

      addEntry: (entry) => {
        const newEntry: HistoryEntry = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          ...entry,
        }
        set((s) => ({
          entries: [newEntry, ...s.entries].slice(0, MAX_HISTORY),
        }))
        return newEntry.id
      },

      removeEntry: (id) =>
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),

      clearAll: () => set({ entries: [] }),

      getEntry: (id) => get().entries.find((e) => e.id === id),
    }),
    {
      name: 'pp-history-v1',
      partialize: (s) => ({ entries: s.entries }),
    }
  )
)
