'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
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

async function fetchTools(): Promise<Tool[]> {
  const res = await fetch(`${API_URL}/api/v1/tools`)
  if (!res.ok) return []
  const data = (await res.json()) as { tools: Tool[] }
  return data.tools || []
}

async function fetchSkills(): Promise<Skill[]> {
  const res = await fetch(`${API_URL}/api/v1/skills`)
  if (!res.ok) return []
  const data = (await res.json()) as { skills: Skill[] }
  return data.skills || []
}

async function fetchCourses(params: {
  search: string
  toolId: string | null
  skillId: string | null
  difficulty: string | null
}): Promise<{ courses: CourseItem[]; total: number }> {
  const searchParams = new URLSearchParams()
  if (params.search) searchParams.set('search', params.search)
  if (params.toolId) searchParams.set('tool_id', params.toolId)
  if (params.skillId) searchParams.set('skill_id', params.skillId)
  if (params.difficulty) searchParams.set('difficulty', params.difficulty)

  const res = await fetch(`${API_URL}/api/v1/courses?${searchParams.toString()}`)
  if (!res.ok) return { courses: [], total: 0 }
  const data = (await res.json()) as { courses: CourseItem[]; total: number }
  return { courses: data.courses || [], total: data.total || 0 }
}

export default function CoursesPage() {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // Filter state
  const [search, setSearch] = useState('')
  const [toolId, setToolId] = useState<string | null>(null)
  const [skillId, setSkillId] = useState<string | null>(null)
  const [difficulty, setDifficulty] = useState<string | null>(null)

  // TanStack Query: fetch tools and skills (cached, fetched once)
  const { data: tools = [] } = useQuery({
    queryKey: ['tools'],
    queryFn: fetchTools,
  })

  const { data: skills = [] } = useQuery({
    queryKey: ['skills'],
    queryFn: fetchSkills,
  })

  // TanStack Query: fetch courses (re-fetches when filters change)
  const { data: courseData, isLoading } = useQuery({
    queryKey: ['courses', search, toolId, skillId, difficulty],
    queryFn: () => fetchCourses({ search, toolId, skillId, difficulty }),
  })

  const courses = courseData?.courses ?? []

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
