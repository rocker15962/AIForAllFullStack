'use client'

interface FilterOption {
  id: string
  name: string
}

interface FilterSidebarProps {
  tools: FilterOption[]
  skills: FilterOption[]
  selectedToolId: string | null
  selectedSkillId: string | null
  selectedDifficulty: string | null
  onToolChange: (id: string | null) => void
  onSkillChange: (id: string | null) => void
  onDifficultyChange: (value: string | null) => void
}

const difficulties: FilterOption[] = [
  { id: 'beginner', name: 'Beginner' },
  { id: 'intermediate', name: 'Intermediate' },
  { id: 'advanced', name: 'Advanced' },
]

export function FilterSidebar({
  tools,
  skills,
  selectedToolId,
  selectedSkillId,
  selectedDifficulty,
  onToolChange,
  onSkillChange,
  onDifficultyChange,
}: FilterSidebarProps) {
  return (
    <div className="flex w-60 shrink-0 flex-col gap-6">
      {/* Tools */}
      <FilterSection
        title="Tools"
        options={tools}
        selectedId={selectedToolId}
        onChange={onToolChange}
      />

      {/* Skills */}
      <FilterSection
        title="Skills"
        options={skills}
        selectedId={selectedSkillId}
        onChange={onSkillChange}
      />

      {/* Difficulty */}
      <FilterSection
        title="Difficulty"
        options={difficulties}
        selectedId={selectedDifficulty}
        onChange={onDifficultyChange}
      />
    </div>
  )
}

function FilterSection({
  title,
  options,
  selectedId,
  onChange,
}: {
  title: string
  options: FilterOption[]
  selectedId: string | null
  onChange: (id: string | null) => void
}) {
  return (
    <div>
      <h3 className="mb-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300">{title}</h3>
      <div className="flex flex-col gap-2">
        {options.map((opt) => (
          <label
            key={opt.id}
            className="flex cursor-pointer items-center gap-2 text-[13px] text-zinc-600 dark:text-zinc-400"
          >
            <input
              type="checkbox"
              checked={selectedId === opt.id}
              onChange={() => onChange(selectedId === opt.id ? null : opt.id)}
              className="h-3.5 w-3.5 rounded border-zinc-300 text-cyan-500 focus:ring-cyan-500 dark:border-zinc-600"
            />
            {opt.name}
          </label>
        ))}
      </div>
    </div>
  )
}
