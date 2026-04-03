'use client'

import { useState, useEffect, useCallback } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { SearchBar, FilterSidebar, CourseGrid } from '@/components/course-discovery'

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
  const [_total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

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

  const activeFilterCount = [toolId, skillId, difficulty].filter(Boolean).length

  return (
    <div className="px-6 py-8 sm:px-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-zinc-900 dark:text-zinc-100">Explore Courses</h1>
        <p className="mt-2 text-[15px] text-zinc-500">
          Find the right AI courses for you and start your learning journey
        </p>
      </div>

      {/* Body: Sidebar + Main Content */}
      <div className="flex gap-8">
        {/* Sidebar (desktop) */}
        <div className="hidden lg:block">
          <div className="mb-6">
            <SearchBar value={search} onChange={setSearch} />
          </div>
          <FilterSidebar
            tools={tools}
            skills={skills}
            selectedToolId={toolId}
            selectedSkillId={skillId}
            selectedDifficulty={difficulty}
            onToolChange={setToolId}
            onSkillChange={setSkillId}
            onDifficultyChange={setDifficulty}
          />
        </div>

        {/* Main Content */}
        <div className="min-w-0 flex-1">
          {/* Mobile: search + filter button */}
          <div className="mb-4 flex gap-2 lg:hidden">
            <div className="flex-1">
              <SearchBar value={search} onChange={setSearch} />
            </div>
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filter
              {activeFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-xs text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
            </div>
          ) : (
            <CourseGrid courses={courses} toolNames={toolNames} skillNames={skillNames} />
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMobileFilterOpen(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="absolute right-0 bottom-0 left-0 max-h-[70vh] overflow-y-auto rounded-t-2xl bg-white p-6 dark:bg-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Filter</h3>
              <button
                onClick={() => {
                  setToolId(null)
                  setSkillId(null)
                  setDifficulty(null)
                }}
                className="text-sm text-zinc-500"
              >
                Clear
              </button>
            </div>
            <FilterSidebar
              tools={tools}
              skills={skills}
              selectedToolId={toolId}
              selectedSkillId={skillId}
              selectedDifficulty={difficulty}
              onToolChange={setToolId}
              onSkillChange={setSkillId}
              onDifficultyChange={setDifficulty}
            />
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="mt-6 w-full rounded-lg bg-cyan-500 py-3 text-sm font-medium text-white"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
