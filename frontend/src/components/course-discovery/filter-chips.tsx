'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, X } from 'lucide-react'

interface FilterOption {
  id: string
  name: string
}

interface FilterChipsProps {
  tools: FilterOption[]
  skills: FilterOption[]
  selectedToolId: string | null
  selectedSkillId: string | null
  selectedDifficulty: string | null
  onToolChange: (id: string | null) => void
  onSkillChange: (id: string | null) => void
  onDifficultyChange: (value: string | null) => void
  onClearAll: () => void
}

const difficulties: FilterOption[] = [
  { id: 'beginner', name: '初級' },
  { id: 'intermediate', name: '中級' },
  { id: 'advanced', name: '進階' },
]

export function FilterChips({
  tools,
  skills,
  selectedToolId,
  selectedSkillId,
  selectedDifficulty,
  onToolChange,
  onSkillChange,
  onDifficultyChange,
  onClearAll,
}: FilterChipsProps) {
  const hasActiveFilters = selectedToolId || selectedSkillId || selectedDifficulty
  const selectedToolName = tools.find((t) => t.id === selectedToolId)?.name
  const selectedSkillName = skills.find((s) => s.id === selectedSkillId)?.name
  const selectedDifficultyName = difficulties.find((d) => d.id === selectedDifficulty)?.name

  return (
    <div>
      {/* Dropdown row */}
      <div className="mb-3 flex flex-wrap gap-2">
        <FilterDropdown
          label="工具"
          options={tools}
          selectedId={selectedToolId}
          onChange={onToolChange}
        />
        <FilterDropdown
          label="技能"
          options={skills}
          selectedId={selectedSkillId}
          onChange={onSkillChange}
        />
        <FilterDropdown
          label="難度"
          options={difficulties}
          selectedId={selectedDifficulty}
          onChange={onDifficultyChange}
        />
      </div>

      {/* Active filter tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {selectedToolName && (
            <ActiveTag label={selectedToolName} onRemove={() => onToolChange(null)} />
          )}
          {selectedSkillName && (
            <ActiveTag label={selectedSkillName} onRemove={() => onSkillChange(null)} />
          )}
          {selectedDifficultyName && (
            <ActiveTag label={selectedDifficultyName} onRemove={() => onDifficultyChange(null)} />
          )}
          <button
            onClick={onClearAll}
            className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            清除篩選
          </button>
        </div>
      )}
    </div>
  )
}

function FilterDropdown({
  label,
  options,
  selectedId,
  onChange,
}: {
  label: string
  options: FilterOption[]
  selectedId: string | null
  onChange: (id: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const isActive = selectedId !== null

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
          isActive
            ? 'border-cyan-500 bg-cyan-50 text-cyan-700 dark:border-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-300'
            : 'border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600'
        }`}
      >
        {label}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-20 mt-1 min-w-[160px] rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                onChange(selectedId === opt.id ? null : opt.id)
                setOpen(false)
              }}
              className={`block w-full px-4 py-2 text-left text-sm transition-colors ${
                selectedId === opt.id
                  ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'
                  : 'text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              {opt.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ActiveTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-medium text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300">
      {label}
      <button onClick={onRemove} className="hover:text-cyan-900 dark:hover:text-cyan-100">
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}
