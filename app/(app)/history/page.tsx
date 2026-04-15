'use client'

import { useState } from 'react'
import { useHistoryStore } from '@/store/historyStore'
import { HistoryList } from '@/components/history/HistoryList'
import { Button } from '@/components/ui'

export default function HistoryPage() {
  const entries  = useHistoryStore((s) => s.entries)
  const clearAll = useHistoryStore((s) => s.clearAll)
  const [search, setSearch]             = useState('')
  const [confirmClear, setConfirmClear] = useState(false)

  const filtered = search.trim()
    ? entries.filter(
        (e) =>
          e.prompt.toLowerCase().includes(search.toLowerCase()) ||
          e.output.toLowerCase().includes(search.toLowerCase())
      )
    : entries

  const handleClear = () => {
    if (confirmClear) {
      clearAll()
      setConfirmClear(false)
    } else {
      setConfirmClear(true)
      setTimeout(() => setConfirmClear(false), 3000)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-line-subtle flex-shrink-0 gap-3 flex-wrap">
        <div>
          <h1 className="text-sm font-semibold text-ink-primary">History</h1>
          <p className="text-xs text-ink-muted mt-0.5">
            {filtered.length} of {entries.length} run{entries.length !== 1 ? 's' : ''}
            {search && ` matching "${search}"`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none">
              <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.2" />
              <path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-bg-surface border border-line-base rounded-lg text-sm
                         text-ink-primary outline-none focus:border-accent transition-colors w-40 sm:w-52
                         placeholder:text-ink-muted"
            />
          </div>
          {entries.length > 0 && (
            <Button variant={confirmClear ? 'danger' : 'ghost'} size="sm" onClick={handleClear}>
              {confirmClear ? 'Confirm clear' : 'Clear all'}
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <HistoryList entries={entries} search={search} />
      </div>
    </div>
  )
}
