'use client'

import { X } from 'lucide-react'

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

const difficulties = [
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

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Tool chips */}
      {tools.map((tool) => (
        <Chip
          key={`tool-${tool.id}`}
          label={tool.name}
          active={selectedToolId === tool.id}
          onClick={() => onToolChange(selectedToolId === tool.id ? null : tool.id)}
        />
      ))}

      {/* Divider */}
      {tools.length > 0 && skills.length > 0 && (
        <div className="mx-1 h-4 w-px bg-zinc-200 dark:bg-zinc-700" />
      )}

      {/* Skill chips */}
      {skills.map((skill) => (
        <Chip
          key={`skill-${skill.id}`}
          label={skill.name}
          active={selectedSkillId === skill.id}
          onClick={() => onSkillChange(selectedSkillId === skill.id ? null : skill.id)}
        />
      ))}

      {/* Divider */}
      {skills.length > 0 && <div className="mx-1 h-4 w-px bg-zinc-200 dark:bg-zinc-700" />}

      {/* Difficulty chips */}
      {difficulties.map((d) => (
        <Chip
          key={`diff-${d.id}`}
          label={d.name}
          active={selectedDifficulty === d.id}
          onClick={() => onDifficultyChange(selectedDifficulty === d.id ? null : d.id)}
        />
      ))}

      {/* Clear all */}
      {hasActiveFilters && (
        <button
          onClick={onClearAll}
          className="ml-2 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          清除篩選
        </button>
      )}
    </div>
  )
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300'
          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
      }`}
    >
      {label}
      {active && <X className="h-3 w-3" />}
    </button>
  )
}
