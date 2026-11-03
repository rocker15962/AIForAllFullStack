'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Eye } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { YouTubeEmbed, QuizSection, GuestBanner } from '@/components/course-learning'
import type { MyCourseProgress, QuizQuestion } from '@/components/course-learning/quiz-section'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface CourseDetail {
  id: string
  title: string
  description: string
  youtubeId: string
  thumbnailUrl: string
  difficulty: string
  /** Video length in seconds */
  duration: number
  tool: { id: string; name: string; icon: string }
  skill: { id: string; name: string; icon: string }
  creator: { id: string; name: string; avatarUrl: string; channelUrl: string }
  questions: QuizQuestion[]
  status: 'draft' | 'published' | 'archived'
  /** Not published: opened by an admin or with a preview link (BR-05) */
  isPreview: boolean
}

function CourseLearning() {
  const params = useParams()
  const searchParams = useSearchParams()
  const courseId = params.id as string
  const previewToken = searchParams.get('preview') ?? ''
  const { user, accessToken, isLoading: authLoading } = useAuth()

  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [progress, setProgress] = useState<MyCourseProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    let cancelled = false
    const headers: Record<string, string> = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : {}

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const query = previewToken ? `?preview=${encodeURIComponent(previewToken)}` : ''
        const res = await fetch(`${API_URL}/api/v1/courses/${courseId}${query}`, { headers })
        if (!res.ok) {
          // Drafts without access and archived courses also answer 404 (BR-05, BR-31).
          if (!cancelled)
            setError(res.status === 404 ? 'Course not found' : 'Failed to load course')
          return
        }
        const detail = (await res.json()) as CourseDetail

        // BR-19: resume the signed-in learner's current round.
        let saved: MyCourseProgress | null = null
        if (accessToken && !detail.isPreview) {
          const progressRes = await fetch(`${API_URL}/api/v1/courses/${courseId}/progress`, {
            headers,
          })
          if (progressRes.ok) saved = (await progressRes.json()) as MyCourseProgress
        }
        if (!cancelled) {
          setCourse(detail)
          setProgress(saved)
        }
      } catch {
        if (!cancelled) setError('Failed to load course')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [authLoading, accessToken, courseId, previewToken])

  // BR-17: the in-progress record starts once 10% of the video has played.
  const canTrackStart = !!user && !!accessToken && !!course && !course.isPreview
  const handleStart = useCallback(() => {
    if (!accessToken) return
    fetch(`${API_URL}/api/v1/courses/${courseId}/start`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    }).catch(() => {
      // Best effort: answering a question also creates the record.
    })
  }, [accessToken, courseId])

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-zinc-500">{error || 'Course not found'}</p>
          <Link href="/courses" className="mt-4 inline-block text-sm text-cyan-500 hover:underline">
            Back to course list
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1040px] px-6 py-6">
      {/* ← Back to course list */}
      <Link
        href="/courses"
        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to course list
      </Link>

      {course.isPreview && (
        <div
          role="status"
          className="mb-4 flex items-center gap-3 rounded-lg border-l-4 border-amber-500 bg-amber-50 px-4 py-3 dark:bg-amber-900/20"
        >
          <Eye className="h-[18px] w-[18px] shrink-0 text-amber-600" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Preview — this course isn&rsquo;t published yet. Answers are checked but not saved.
          </p>
        </div>
      )}

      {/* YouTube Video — rounded-xl, fills width */}
      <YouTubeEmbed
        videoId={course.youtubeId}
        durationSeconds={course.duration}
        onStartThresholdReached={canTrackStart ? handleStart : undefined}
      />

      {/* Title — below video, padding-top 24px */}
      <h1 className="pt-6 pb-4 text-[22px] font-bold text-zinc-900 dark:text-zinc-100">
        {course.title}
      </h1>

      {/* Guest banner (only for unauthenticated) */}
      <GuestBanner />

      {/* Quiz — header + segmented progress + quiz card */}
      <QuizSection
        courseId={course.id}
        questions={course.questions || []}
        isPreview={course.isPreview}
        previewToken={previewToken}
        initialProgress={progress}
      />
    </div>
  )
}

export default function CourseLearningPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-56px)] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
        </div>
      }
    >
      <CourseLearning />
    </Suspense>
  )
}
