'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { YouTubeEmbed, QuizSection, GuestBanner } from '@/components/course-learning'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface CourseDetail {
  id: string
  title: string
  description: string
  youtubeId: string
  thumbnailUrl: string
  difficulty: string
  duration: number
  tool: { id: string; name: string; icon: string }
  skill: { id: string; name: string; icon: string }
  creator: { id: string; name: string; avatarUrl: string; channelUrl: string }
  questions: {
    id: string
    type: string
    question: string
    options?: { id: string; text: string }[]
    order: number
  }[]
}

export default function CourseLearningPage() {
  const params = useParams()
  const courseId = params.id as string
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await fetch(`${API_URL}/api/v1/courses/${courseId}`)
        if (!res.ok) {
          setError('課程不存在')
          return
        }
        setCourse(await res.json())
      } catch {
        setError('無法載入課程')
      } finally {
        setIsLoading(false)
      }
    }
    fetchCourse()
  }, [courseId])

  if (isLoading) {
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
          <p className="text-lg font-medium text-zinc-500">{error || '課程不存在'}</p>
          <Link href="/courses" className="mt-4 inline-block text-sm text-cyan-500 hover:underline">
            返回課程列表
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

      {/* YouTube Video — rounded-xl, fills width */}
      <YouTubeEmbed videoId={course.youtubeId} />

      {/* Title — below video, padding-top 24px */}
      <h1 className="pt-6 pb-4 text-[22px] font-bold text-zinc-900 dark:text-zinc-100">
        {course.title}
      </h1>

      {/* Guest banner (only for unauthenticated) */}
      <GuestBanner />

      {/* Quiz — header + segmented progress + quiz card */}
      <QuizSection courseId={course.id} questions={course.questions || []} />
    </div>
  )
}
