'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface RecommendedCourse {
  id: string
  title: string
  thumbnailUrl: string
  difficulty: string
  toolName: string
  skillName: string
}

interface RecommendedCoursesProps {
  courseId: string
  accessToken?: string | null
}

/** Up to 4 next courses on the result screen (BR-15). Renders nothing when there are none. */
export function RecommendedCourses({ courseId, accessToken }: RecommendedCoursesProps) {
  const [courses, setCourses] = useState<RecommendedCourse[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`${API_URL}/api/v1/courses/${courseId}/recommended`, {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        })
        if (!res.ok) return
        const data = (await res.json()) as { courses: RecommendedCourse[] }
        if (!cancelled) setCourses(data.courses || [])
      } catch {
        // Recommendations are optional; the result screen works without them.
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [courseId, accessToken])

  if (courses.length === 0) return null

  return (
    <section className="mt-10 text-left" aria-labelledby="recommended-heading">
      <h3
        id="recommended-heading"
        className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-100"
      >
        Recommended next
      </h3>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {courses.map((c) => (
          <li key={c.id}>
            <Link
              href={`/courses/${c.id}`}
              className="group block overflow-hidden rounded-xl border border-zinc-200 bg-white transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800"
            >
              <div className="aspect-video bg-zinc-200 dark:bg-zinc-700">
                {c.thumbnailUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.thumbnailUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
              <div className="p-3">
                <p className="line-clamp-2 text-sm font-medium text-zinc-900 group-hover:text-cyan-600 dark:text-zinc-100">
                  {c.title}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {[c.toolName, c.skillName].filter(Boolean).join(' · ')}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
