'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Loader2, ShieldAlert } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { CourseEditor } from '@/components/admin/course-editor'
import type { ExistingCourse } from '@/components/admin/course-editor'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export default function EditCoursePage() {
  const params = useParams<{ id: string }>()
  const { user, accessToken, isLoading: authLoading } = useAuth()

  const [course, setCourse] = useState<ExistingCourse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCourse() {
      if (!accessToken || !params.id) return
      setIsLoading(true)
      try {
        // Use admin API to get full course data (includes correctAnswer, explanation)
        const res = await fetch(`${API_URL}/api/v1/admin/courses/${params.id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        if (!res.ok) {
          throw new Error(`Failed to fetch course (${res.status})`)
        }
        const raw = await res.json()
        const mapped: ExistingCourse = {
          id: raw.id,
          title: raw.title,
          description: raw.description,
          youtubeUrl:
            raw.youtubeUrl ||
            (raw.youtubeId ? `https://www.youtube.com/watch?v=${raw.youtubeId}` : ''),
          toolId: raw.toolId || raw.tool?.id || '',
          skillId: raw.skillId || raw.skill?.id || '',
          difficulty: raw.difficulty || 'beginner',
          duration: raw.duration || 0,
          status: raw.status || 'draft',
          questions: raw.questions || [],
        }
        setCourse(mapped)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load course')
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading && accessToken) {
      fetchCourse()
    } else if (!authLoading) {
      setIsLoading(false)
    }
  }, [accessToken, authLoading, params.id])

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  if (!user || !user.isAdmin) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center">
        <div className="text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-zinc-400" />
          <h1 className="mt-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Admin access required
          </h1>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {error || 'Course not found'}
          </h1>
        </div>
      </div>
    )
  }

  return <CourseEditor course={course} isEdit={true} />
}
