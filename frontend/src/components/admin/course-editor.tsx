'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { QuestionEditor } from './question-editor'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { courseFormSchema } from '@/lib/schemas'
import type { Difficulty, Question } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface ToolOption {
  id: string
  name: string
}

interface SkillOption {
  id: string
  name: string
}

interface CourseFormData {
  title: string
  description: string
  youtubeUrl: string
  toolId: string
  skillId: string
  difficulty: Difficulty
  duration: number
}

interface ExistingCourse {
  id: string
  title: string
  description: string
  youtubeUrl: string
  toolId: string
  skillId: string
  creatorId: string
  difficulty: string
  duration: number
  status: string
  questions?: Question[]
}

interface CourseEditorProps {
  course?: ExistingCourse
  isEdit: boolean
}

const difficulties: { value: Difficulty; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

const emptyForm: CourseFormData = {
  title: '',
  description: '',
  youtubeUrl: '',
  toolId: '',
  skillId: '',
  difficulty: 'beginner',
  duration: 0,
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export type { CourseFormData, ExistingCourse }

export function CourseEditor({ course, isEdit }: CourseEditorProps) {
  const router = useRouter()
  const { accessToken } = useAuth()

  const [form, setForm] = useState<CourseFormData>(emptyForm)
  const [tools, setTools] = useState<ToolOption[]>([])
  const [skills, setSkills] = useState<SkillOption[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize form from existing course
  useEffect(() => {
    if (course) {
      setForm({
        title: course.title,
        description: course.description,
        youtubeUrl: course.youtubeUrl || '',
        toolId: course.toolId,
        skillId: course.skillId,
        difficulty: (course.difficulty as Difficulty) || 'beginner',
        duration: course.duration,
      })
      setQuestions(course.questions || [])
    }
  }, [course])

  // Fetch tools and skills
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

  const handleChange = useCallback((field: keyof CourseFormData, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  async function handleSave(status: 'draft' | 'published') {
    setError(null)

    // Validate with Zod
    const result = courseFormSchema.safeParse(form)
    if (!result.success) {
      const firstError = result.error.issues[0]
      setError(firstError?.message || 'Validation failed')
      return
    }

    if (!accessToken) {
      setError('Not authenticated')
      return
    }

    setIsSaving(true)
    try {
      const url = isEdit
        ? `${API_URL}/api/v1/admin/courses/${course?.id}`
        : `${API_URL}/api/v1/admin/courses`
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          youtubeUrl: form.youtubeUrl,
          youtubeId: extractYouTubeId(form.youtubeUrl) || '',
          thumbnailUrl: `https://img.youtube.com/vi/${extractYouTubeId(form.youtubeUrl) || ''}/maxresdefault.jpg`,
          toolId: form.toolId,
          skillId: form.skillId,
          creatorId: course?.creatorId || 'c1000000-0000-0000-0000-000000000001',
          difficulty: form.difficulty,
          duration: form.duration,
          status,
        }),
      })

      if (!res.ok) {
        throw new Error(`Failed to ${isEdit ? 'update' : 'create'} course (${res.status})`)
      }

      router.push('/admin/courses')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save course')
    } finally {
      setIsSaving(false)
    }
  }

  const videoId = extractYouTubeId(form.youtubeUrl)

  const selectClasses =
    'w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 transition-colors outline-none focus:border-cyan-400 focus:bg-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-cyan-500'

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 lg:px-[200px]">
      {/* Back link */}
      <Link
        href="/admin/courses"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Course Management
      </Link>

      {/* Header row */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-zinc-900 dark:text-zinc-100">
            {isEdit ? 'Edit Course' : 'Create New Course'}
          </h1>
          <p className="mt-1 text-[15px] text-zinc-500 dark:text-zinc-400">
            Fill in the course details and add quiz questions
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSave('draft')}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 dark:border-zinc-600 dark:text-zinc-300"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Draft
          </Button>
          <Button
            type="button"
            onClick={() => handleSave('published')}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-cyan-600 disabled:opacity-60"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            Publish
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
          {error}
        </div>
      )}

      {/* Course Information Card */}
      <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-8 dark:border-zinc-700 dark:bg-zinc-800">
        <h2 className="mb-6 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Course Information
        </h2>

        <div className="flex flex-col gap-6">
          {/* Title — shadcn/ui Input */}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Title</span>
            <Input
              type="text"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g. ChatGPT Basics: Learn AI Conversations"
              className="h-10 rounded-lg border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 focus-visible:border-cyan-400 focus-visible:bg-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus-visible:border-cyan-500"
            />
          </label>

          {/* Description — shadcn/ui Textarea */}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Description
            </span>
            <Textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe what students will learn..."
              rows={4}
              className="rounded-lg border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 focus-visible:border-cyan-400 focus-visible:bg-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus-visible:border-cyan-500"
            />
          </label>

          {/* YouTube URL — shadcn/ui Input */}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              YouTube Video URL
            </span>
            <Input
              type="url"
              value={form.youtubeUrl}
              onChange={(e) => handleChange('youtubeUrl', e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="h-10 rounded-lg border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 focus-visible:border-cyan-400 focus-visible:bg-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus-visible:border-cyan-500"
            />
          </label>

          {/* Video Preview */}
          <div className="overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
            {videoId ? (
              <div className="relative aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="Video preview"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center">
                <p className="text-sm text-zinc-400 dark:text-zinc-500">
                  Enter a YouTube URL to preview the video
                </p>
              </div>
            )}
          </div>

          {/* Tool / Skill / Difficulty row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Tool</span>
              <select
                value={form.toolId}
                onChange={(e) => handleChange('toolId', e.target.value)}
                className={selectClasses}
              >
                <option value="">Select tool</option>
                {tools.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Skill</span>
              <select
                value={form.skillId}
                onChange={(e) => handleChange('skillId', e.target.value)}
                className={selectClasses}
              >
                <option value="">Select skill</option>
                {skills.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Difficulty
              </span>
              <select
                value={form.difficulty}
                onChange={(e) => handleChange('difficulty', e.target.value)}
                className={selectClasses}
              >
                {difficulties.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      {/* Quiz Questions Card */}
      <QuestionEditor
        courseId={course?.id || ''}
        questions={questions}
        onQuestionsChange={setQuestions}
      />
    </div>
  )
}
