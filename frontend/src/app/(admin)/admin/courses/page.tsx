'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus,
  BookOpen,
  CheckCircle,
  FileText,
  HelpCircle,
  Loader2,
  ShieldAlert,
  Search,
  X,
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { ConfirmDialog, useToast } from '@/components/shared'
import { CourseTable } from '@/components/admin'
import type { CourseCardItem } from '@/components/admin'
import type { CourseStatus } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface ToolOption {
  id: string
  name: string
  icon: string
  order: number
}

interface SkillOption {
  id: string
  name: string
  icon: string
  order: number
}

interface AdminCourse {
  id: string
  title: string
  description: string
  youtubeUrl: string
  thumbnailUrl: string
  toolId: string
  skillId: string
  difficulty: string
  duration: number
  status: CourseStatus
  questionCount: number
  createdAt: string
  updatedAt: string
}

const statCards = [
  {
    key: 'total' as const,
    label: 'Total Courses',
    icon: BookOpen,
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/40',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    key: 'published' as const,
    label: 'Published',
    icon: CheckCircle,
    iconBg: 'bg-green-100 dark:bg-green-900/40',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  {
    key: 'drafts' as const,
    label: 'Drafts',
    icon: FileText,
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    key: 'questions' as const,
    label: 'Total Questions',
    icon: HelpCircle,
    iconBg: 'bg-violet-100 dark:bg-violet-900/40',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
] as const

type StatKey = (typeof statCards)[number]['key']

export default function CourseManagementPage() {
  const router = useRouter()
  const { user, accessToken, isLoading: authLoading } = useAuth()

  const [courses, setCourses] = useState<AdminCourse[]>([])
  const [tools, setTools] = useState<ToolOption[]>([])
  const [skills, setSkills] = useState<SkillOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [levelFilter, setLevelFilter] = useState<string>('')
  const [toolFilter, setToolFilter] = useState<string>('')
  const [skillFilter, setSkillFilter] = useState<string>('')

  const { showToast } = useToast()

  // Archive confirmation (BR-31: "delete" archives the course)
  const [deletingCourse, setDeletingCourse] = useState<CourseCardItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Fetch tools and skills once
  useEffect(() => {
    async function fetchCategories() {
      try {
        const [toolsRes, skillsRes] = await Promise.all([
          fetch(`${API_URL}/api/v1/tools`),
          fetch(`${API_URL}/api/v1/skills`),
        ])
        if (toolsRes.ok) {
          const data = (await toolsRes.json()) as { tools: ToolOption[] }
          setTools(data.tools || [])
        }
        if (skillsRes.ok) {
          const data = (await skillsRes.json()) as { skills: SkillOption[] }
          setSkills(data.skills || [])
        }
      } catch {
        // Silently handle — empty dropdowns
      }
    }
    fetchCategories()
  }, [])

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    if (!accessToken) return
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)

      const res = await fetch(`${API_URL}/api/v1/admin/courses?${params.toString()}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok) {
        throw new Error(`Failed to fetch courses (${res.status})`)
      }
      const data = (await res.json()) as { courses: AdminCourse[] }
      setCourses(data.courses || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setCourses([])
    } finally {
      setIsLoading(false)
    }
  }, [accessToken, search, statusFilter])

  useEffect(() => {
    if (authLoading) return
    if (!accessToken || !user?.isAdmin) {
      setIsLoading(false)
      return
    }
    fetchCourses()
  }, [fetchCourses, authLoading, accessToken, user?.isAdmin])

  // Build name lookup maps
  const toolNames: Record<string, string> = {}
  for (const t of tools) {
    toolNames[t.id] = t.name
  }
  const skillNames: Record<string, string> = {}
  for (const s of skills) {
    skillNames[s.id] = s.name
  }

  // Apply client-side level filter (API handles search + status)
  const filteredCourses = courses
    .filter((c) => !levelFilter || c.difficulty === levelFilter)
    .filter((c) => !toolFilter || c.toolId === toolFilter)
    .filter((c) => !skillFilter || c.skillId === skillFilter)

  // Compute stats from unfiltered course list
  const stats: Record<StatKey, number> = {
    total: courses.length,
    published: courses.filter((c) => c.status === 'published').length,
    drafts: courses.filter((c) => c.status === 'draft').length,
    questions: courses.reduce((sum, c) => sum + c.questionCount, 0),
  }

  // Map to card items
  const cardItems: CourseCardItem[] = filteredCourses.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    thumbnailUrl: c.thumbnailUrl,
    difficulty: c.difficulty,
    duration: c.duration,
    toolId: c.toolId,
    skillId: c.skillId,
    status: c.status,
    questionCount: c.questionCount,
  }))

  // Handlers
  function handleEdit(card: CourseCardItem) {
    router.push(`/admin/courses/${card.id}/edit`)
  }

  function handleDeleteRequest(card: CourseCardItem) {
    setDeletingCourse(card)
  }

  async function handleDeleteConfirm() {
    if (!deletingCourse || !accessToken) return
    setIsDeleting(true)
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/courses/${deletingCourse.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok) {
        throw new Error(`Failed to archive course (${res.status})`)
      }
      setDeletingCourse(null)
      showToast('success', 'Course archived')
      await fetchCourses()
    } catch {
      showToast('error', 'Could not archive the course. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleRestore(card: CourseCardItem) {
    if (!accessToken) return
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/courses/${card.id}/restore`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok) throw new Error(`Failed to restore course (${res.status})`)
      showToast('success', 'Course restored as a draft')
      await fetchCourses()
    } catch {
      showToast('error', 'Could not restore the course. Please try again.')
    }
  }

  // BR-05: shareable link that opens the draft until it is published
  async function handleCopyPreviewLink(card: CourseCardItem) {
    if (!accessToken) return
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/courses/${card.id}/preview-link`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok) throw new Error(`Failed to create preview link (${res.status})`)
      const data = (await res.json()) as { path: string }
      await navigator.clipboard.writeText(`${window.location.origin}${data.path}`)
      showToast('success', 'Preview link copied. It works until the course is published.')
    } catch {
      showToast('error', 'Could not create a preview link. Please try again.')
    }
  }

  async function handleTogglePublish(card: CourseCardItem) {
    if (!accessToken) return
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/courses/${card.id}/publish`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok) {
        throw new Error(`Failed to toggle publish (${res.status})`)
      }
      await fetchCourses()
    } catch {
      // Silently handle
    }
  }

  // Auth loading
  if (authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  // Not admin
  if (!user || !user.isAdmin) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center">
        <div className="text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-zinc-400" />
          <h1 className="mt-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Admin access required
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            You must be an administrator to view this page.
          </p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && courses.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Failed to load courses
          </h1>
          <p className="mt-2 text-sm text-zinc-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-zinc-900 dark:text-zinc-100">
            Course Management
          </h1>
          <p className="mt-1 text-[15px] text-zinc-500 dark:text-zinc-400">
            Add, edit, and manage platform course content
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className="flex shrink-0 items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan-600"
        >
          <Plus className="h-4 w-4" />
          Add Course
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon
          const value = stats[card.key]
          return (
            <div
              key={card.key}
              className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-4 dark:border-zinc-700 dark:bg-zinc-800"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${card.iconBg}`}
              >
                <Icon className={`h-4.5 w-4.5 ${card.iconColor}`} />
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{card.label}</p>
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Search + Filter Row */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pr-10 pl-10 text-sm text-zinc-900 transition-colors outline-none focus:border-cyan-400 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-cyan-500"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('')
                setSearch('')
              }}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-[13px] text-zinc-600 transition-colors outline-none focus:border-cyan-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
        >
          <option value="">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>

        {/* Level filter */}
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-[13px] text-zinc-600 transition-colors outline-none focus:border-cyan-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
        >
          <option value="">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        {/* Tool filter */}
        <select
          value={toolFilter}
          onChange={(e) => setToolFilter(e.target.value)}
          className="rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-[13px] text-zinc-600 transition-colors outline-none focus:border-cyan-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
        >
          <option value="">All Tools</option>
          {tools.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        {/* Skill filter */}
        <select
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value)}
          className="rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-[13px] text-zinc-600 transition-colors outline-none focus:border-cyan-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
        >
          <option value="">All Skills</option>
          {skills.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      ) : (
        <CourseTable
          courses={cardItems}
          toolNames={toolNames}
          skillNames={skillNames}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          onTogglePublish={handleTogglePublish}
          onRestore={handleRestore}
          onCopyPreviewLink={handleCopyPreviewLink}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingCourse}
        onClose={() => setDeletingCourse(null)}
        onConfirm={handleDeleteConfirm}
        title="Archive Course"
        description={`"${deletingCourse?.title ?? ''}" will be hidden from learners. Their progress and badges are kept, and you can restore the course from the Archived filter.`}
        confirmLabel="Archive"
        isLoading={isDeleting}
      />
    </div>
  )
}
