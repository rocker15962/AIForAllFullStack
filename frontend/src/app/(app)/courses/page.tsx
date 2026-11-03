'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { SlidersHorizontal } from 'lucide-react'
import { SearchBar, FilterSidebar, CourseGrid, ResultsBar } from '@/components/course-discovery'
import { useDebouncedValue } from '@/lib/use-debounced-value'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface Tool {
  id: string
  name: string
  icon: string
  order: number
  /** Set when the category is archived (BR-33): hidden from filters, still named on cards. */
  archived_at?: string | null
}

interface Skill {
  id: string
  name: string
  icon: string
  order: number
  archived_at?: string | null
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

interface Creator {
  id: string
  name: string
  avatar_url: string
}

async function fetchCreators(): Promise<Creator[]> {
  const res = await fetch(`${API_URL}/api/v1/creators`)
  if (!res.ok) return []
  const data = (await res.json()) as { creators: Creator[] }
  return data.creators || []
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

  // Filter state — the search box is controlled; the query uses a debounced copy (300ms)
  const [searchInput, setSearchInput] = useState('')
  const search = useDebouncedValue(searchInput.trim(), 300)
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

  const { data: creators = [] } = useQuery({
    queryKey: ['creators'],
    queryFn: fetchCreators,
  })

  // TanStack Query: fetch courses (re-fetches when filters change)
  const { data: courseData, isLoading } = useQuery({
    queryKey: ['courses', search, toolId, skillId, difficulty],
    queryFn: () => fetchCourses({ search, toolId, skillId, difficulty }),
  })

  const courses = courseData?.courses ?? []
  // `total` is the filtered count across all pages, not just the first page
  const total = courseData?.total ?? 0

  // Build name lookup maps
  const toolNames: Record<string, string> = {}
  for (const t of tools) {
    toolNames[t.id] = t.name
  }
  const skillNames: Record<string, string> = {}
  for (const s of skills) {
    skillNames[s.id] = s.name
  }
  const creatorNames: Record<string, string> = {}
  const creatorAvatarUrls: Record<string, string> = {}
  for (const cr of creators) {
    creatorNames[cr.id] = cr.name
    creatorAvatarUrls[cr.id] = cr.avatar_url
  }

  const activeTools = tools.filter((t) => !t.archived_at)
  const activeSkills = skills.filter((s) => !s.archived_at)

  const activeFilterCount = [toolId, skillId, difficulty].filter(Boolean).length
  const hasActiveFilters = activeFilterCount > 0 || searchInput.trim() !== ''

  function clearAllFilters() {
    setSearchInput('')
    setToolId(null)
    setSkillId(null)
    setDifficulty(null)
  }

  return (
    <div className="px-6 py-8 sm:px-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-zinc-900 dark:text-zinc-100">探索課程</h1>
        <p className="mt-2 text-[15px] text-zinc-500">找到適合你的 AI 課程，開始你的學習旅程</p>
      </div>

      {/* Body: Sidebar + Main Content */}
      <div className="flex gap-8">
        {/* Sidebar (desktop) */}
        <div className="hidden lg:block">
          <div className="mb-6">
            <SearchBar value={searchInput} onChange={setSearchInput} />
          </div>
          <FilterSidebar
            tools={activeTools}
            skills={activeSkills}
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
              <SearchBar value={searchInput} onChange={setSearchInput} />
            </div>
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
            >
              <SlidersHorizontal className="h-4 w-4" />
              篩選
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
            <>
              <ResultsBar
                count={total}
                hasActiveFilters={hasActiveFilters}
                onClearAll={clearAllFilters}
              />
              <CourseGrid
                courses={courses}
                toolNames={toolNames}
                skillNames={skillNames}
                creatorNames={creatorNames}
                creatorAvatarUrls={creatorAvatarUrls}
              />
            </>
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
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">篩選</h3>
              <button
                onClick={() => {
                  setToolId(null)
                  setSkillId(null)
                  setDifficulty(null)
                }}
                className="text-sm text-zinc-500"
              >
                清除
              </button>
            </div>
            <FilterSidebar
              tools={activeTools}
              skills={activeSkills}
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
              套用
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
