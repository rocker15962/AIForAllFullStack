'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { YouTubeEmbed, QuizSection, GuestBanner } from '@/components/course-learning'
import { CourseCard } from '@/components/course-discovery'

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

interface RecommendedCourse {
  id: string
  title: string
  thumbnailUrl: string
  difficulty: string
  toolName: string
  skillName: string
}

const difficultyConfig: Record<string, { classes: string; label: string }> = {
  beginner: { classes: 'bg-green-100 text-green-700', label: '初級' },
  intermediate: { classes: 'bg-amber-100 text-amber-700', label: '中級' },
  advanced: { classes: 'bg-rose-100 text-rose-700', label: '進階' },
}

function DifficultyTag({ difficulty }: { difficulty: string }) {
  const config = difficultyConfig[difficulty] || difficultyConfig.beginner
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${config.classes}`}>
      {config.label}
    </span>
  )
}

export default function CourseLearningPage() {
  const params = useParams()
  const courseId = params.id as string
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [recommended, setRecommended] = useState<RecommendedCourse[]>([])
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
        const data = await res.json()
        setCourse(data)

        // Fetch recommended
        const recRes = await fetch(`${API_URL}/api/v1/courses/${courseId}/recommended`)
        if (recRes.ok) {
          const recData = await recRes.json()
          setRecommended(recData.courses || [])
        }
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
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      {/* Back link */}
      <Link
        href="/courses"
        className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        <ArrowLeft className="h-4 w-4" />
        返回課程列表
      </Link>

      {/* Course header */}
      <div className="mb-4">
        <div className="mb-2 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[11px] font-medium text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
            {course.tool.name}
          </span>
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
            {course.skill.name}
          </span>
          <DifficultyTag difficulty={course.difficulty} />
        </div>
        <h1 className="mb-2 text-xl font-bold text-zinc-900 sm:text-2xl dark:text-zinc-100">
          {course.title}
        </h1>
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          {course.creator.avatarUrl ? (
            <img
              src={course.creator.avatarUrl}
              alt={course.creator.name}
              className="h-5 w-5 rounded-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="h-5 w-5 rounded-full bg-cyan-200" />
          )}
          <span>{course.creator.name}</span>
          <span>·</span>
          <span>{course.questions.length} 題</span>
        </div>
      </div>

      {/* Video */}
      <div className="mb-6">
        <YouTubeEmbed videoId={course.youtubeId} />
      </div>

      {/* Description */}
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">{course.description}</p>

      {/* Guest banner */}
      <GuestBanner />

      {/* Quiz */}
      <div className="mb-8">
        <QuizSection courseId={course.id} questions={course.questions} />
      </div>

      {/* Recommended */}
      {recommended.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">推薦課程</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {recommended.map((rec) => (
              <CourseCard
                key={rec.id}
                course={{
                  id: rec.id,
                  title: rec.title,
                  description: '',
                  thumbnailUrl: rec.thumbnailUrl,
                  difficulty: rec.difficulty,
                  duration: 0,
                  toolId: '',
                  skillId: '',
                  creatorId: '',
                  questionCount: 0,
                }}
                toolName={rec.toolName}
                skillName={rec.skillName}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
