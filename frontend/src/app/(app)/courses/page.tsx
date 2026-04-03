'use client'

import { useState, useEffect, useCallback } from 'react'
import { SearchBar, FilterChips, CourseGrid } from '@/components/course-discovery'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface Tool {
  id: string
  name: string
  icon: string
  order: number
}

interface Skill {
  id: string
  name: string
  icon: string
  order: number
}

interface CourseItem {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  difficulty: string
  duration: number
  toolId: string
  skillId: string
  creatorId: string
  questionCount: number
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseItem[]>([])
  const [tools, setTools] = useState<Tool[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Filter state
  const [search, setSearch] = useState('')
  const [toolId, setToolId] = useState<string | null>(null)
  const [skillId, setSkillId] = useState<string | null>(null)
  const [difficulty, setDifficulty] = useState<string | null>(null)

  // Fetch tools and skills once
  useEffect(() => {
    async function fetchCategories() {
      try {
        const [toolsRes, skillsRes] = await Promise.all([
          fetch(`${API_URL}/api/v1/tools`),
          fetch(`${API_URL}/api/v1/skills`),
        ])
        if (toolsRes.ok) {
          const data = await toolsRes.json()
          setTools(data.tools || [])
        }
        if (skillsRes.ok) {
          const data = await skillsRes.json()
          setSkills(data.skills || [])
        }
      } catch {
        // Silently handle — empty filters
      }
    }
    fetchCategories()
  }, [])

  // Fetch courses when filters change
  const fetchCourses = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (toolId) params.set('tool_id', toolId)
      if (skillId) params.set('skill_id', skillId)
      if (difficulty) params.set('difficulty', difficulty)

      const res = await fetch(`${API_URL}/api/v1/courses?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setCourses(data.courses || [])
        setTotal(data.total || 0)
      }
    } catch {
      setCourses([])
      setTotal(0)
    } finally {
      setIsLoading(false)
    }
  }, [search, toolId, skillId, difficulty])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  // Build name lookup maps
  const toolNames: Record<string, string> = {}
  for (const t of tools) {
    toolNames[t.id] = t.name
  }
  const skillNames: Record<string, string> = {}
  for (const s of skills) {
    skillNames[s.id] = s.name
  }

  const clearAll = () => {
    setSearch('')
    setToolId(null)
    setSkillId(null)
    setDifficulty(null)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">探索課程</h1>

      {/* Search */}
      <div className="mb-4">
        <SearchBar value={search} onChange={setSearch} />
      </div>

      {/* Filters (desktop) */}
      <div className="mb-4 hidden sm:block">
        <FilterChips
          tools={tools}
          skills={skills}
          selectedToolId={toolId}
          selectedSkillId={skillId}
          selectedDifficulty={difficulty}
          onToolChange={setToolId}
          onSkillChange={setSkillId}
          onDifficultyChange={setDifficulty}
          onClearAll={clearAll}
        />
      </div>

      {/* Filter button (mobile) */}
      <div className="mb-4 sm:hidden">
        <MobileFilterButton
          activeCount={[toolId, skillId, difficulty].filter(Boolean).length}
          tools={tools}
          skills={skills}
          selectedToolId={toolId}
          selectedSkillId={skillId}
          selectedDifficulty={difficulty}
          onToolChange={setToolId}
          onSkillChange={setSkillId}
          onDifficultyChange={setDifficulty}
          onClearAll={clearAll}
        />
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="mb-4 text-sm text-zinc-500">
          顯示 {courses.length} 堂課程{total > courses.length ? `（共 ${total} 堂）` : ''}
        </p>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
        </div>
      ) : (
        <CourseGrid courses={courses} toolNames={toolNames} skillNames={skillNames} />
      )}
    </div>
  )
}

// Simple mobile filter button + bottom sheet
function MobileFilterButton({
  activeCount,
  tools,
  skills,
  selectedToolId,
  selectedSkillId,
  selectedDifficulty,
  onToolChange,
  onSkillChange,
  onDifficultyChange,
  onClearAll,
}: {
  activeCount: number
  tools: { id: string; name: string }[]
  skills: { id: string; name: string }[]
  selectedToolId: string | null
  selectedSkillId: string | null
  selectedDifficulty: string | null
  onToolChange: (id: string | null) => void
  onSkillChange: (id: string | null) => void
  onDifficultyChange: (v: string | null) => void
  onClearAll: () => void
}) {
  const [open, setOpen] = useState(false)

  const difficulties = [
    { id: 'beginner', name: '初級' },
    { id: 'intermediate', name: '中級' },
    { id: 'advanced', name: '進階' },
  ]

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
      >
        篩選
        {activeCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-xs text-white">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="absolute right-0 bottom-0 left-0 max-h-[70vh] overflow-y-auto rounded-t-2xl bg-white p-6 dark:bg-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">篩選</h3>
              <button
                onClick={() => {
                  onClearAll()
                  setOpen(false)
                }}
                className="text-sm text-zinc-500"
              >
                清除
              </button>
            </div>

            {/* Tools */}
            {tools.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">工具</p>
                <div className="flex flex-wrap gap-2">
                  {tools.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => onToolChange(selectedToolId === t.id ? null : t.id)}
                      className={`rounded-full px-3 py-1 text-xs ${selectedToolId === t.id ? 'bg-cyan-100 text-cyan-700' : 'bg-zinc-100 text-zinc-600'}`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">技能</p>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => onSkillChange(selectedSkillId === s.id ? null : s.id)}
                      className={`rounded-full px-3 py-1 text-xs ${selectedSkillId === s.id ? 'bg-cyan-100 text-cyan-700' : 'bg-zinc-100 text-zinc-600'}`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Difficulty */}
            <div className="mb-6">
              <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">難度</p>
              <div className="flex flex-wrap gap-2">
                {difficulties.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => onDifficultyChange(selectedDifficulty === d.id ? null : d.id)}
                    className={`rounded-full px-3 py-1 text-xs ${selectedDifficulty === d.id ? 'bg-cyan-100 text-cyan-700' : 'bg-zinc-100 text-zinc-600'}`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="w-full rounded-lg bg-cyan-500 py-3 text-sm font-medium text-white"
            >
              套用
            </button>
          </div>
        </div>
      )}
    </>
  )
}
