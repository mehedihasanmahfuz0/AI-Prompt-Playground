'use client'

import { useState } from 'react'
import { TEMPLATES, CATEGORIES } from '@/data/templates'
import { TemplateCard } from '@/components/templates/TemplateCard'
import { cn } from '@/lib/cn'

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState('All')

  const categories = ['All', ...CATEGORIES]
  const filtered =
    activeCategory === 'All'
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.category === activeCategory)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-line-subtle flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-sm font-semibold text-ink-primary">Templates</h1>
            <p className="text-xs text-ink-muted mt-0.5">
              {TEMPLATES.length} ready-to-use prompt templates
            </p>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex gap-1 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                activeCategory === cat
                  ? 'bg-bg-hover text-ink-primary'
                  : 'text-ink-muted hover:text-ink-secondary hover:bg-bg-hover'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}
        >
          {filtered.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      </div>
    </div>
  )
}
