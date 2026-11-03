'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { RecommendedCourse } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

const difficultyTags: Record<string, { classes: string; label: string }> = {
  beginner: {
    classes: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    label: '入門',
  },
  intermediate: {
    classes: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    label: '中級',
  },
  advanced: {
    classes: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    label: '進階',
  },
}

interface RecommendedCoursesProps {
  courseId: string
  /** Signed-in learners only: the token also lets the API leave out completed courses. */
  accessToken?: string | null
}

/**
 * Up to 4 next courses below the result (BR-15): same tool or skill, not yet completed.
 * Shows only as many cards as there are courses, and nothing at all for guests or when empty.
 */
export function RecommendedCourses({ courseId, accessToken }: RecommendedCoursesProps) {
  const [courses, setCourses] = useState<RecommendedCourse[]>([])

  useEffect(() => {
    if (!accessToken) return
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`${API_URL}/api/v1/courses/${courseId}/recommended`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        if (!res.ok) return
        const data = (await res.json()) as { courses?: RecommendedCourse[] }
        if (!cancelled) setCourses(data.courses ?? [])
      } catch {
        // Recommendations are optional; the result screen works without them.
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [courseId, accessToken])

  if (!accessToken || courses.length === 0) return null

  return (
    <section
      aria-labelledby="recommended-heading"
      className="flex flex-col gap-4 border-t border-zinc-200 pt-6 pb-12 dark:border-zinc-700"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2
          id="recommended-heading"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
        >
          接下來可以學
        </h2>
        <span className="text-[13px] text-zinc-500 dark:text-zinc-400">
          同工具或同技能，不含你已完成的課
        </span>
      </div>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {courses.map((c) => {
          const difficulty = difficultyTags[c.difficulty] ?? difficultyTags.beginner
          return (
            <li key={c.id}>
              <Link
                href={`/courses/${c.id}`}
                className="group block h-full overflow-hidden rounded-xl border border-zinc-200 bg-white transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800"
              >
                <div className="h-[120px] bg-zinc-200 dark:bg-zinc-700">
                  {c.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.thumbnailUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div
                      className="flex h-full items-center justify-center text-3xl text-zinc-400"
                      aria-hidden="true"
                    >
                      ▶
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2.5 p-4">
                  <div className="flex flex-wrap gap-1.5">
                    {c.toolName && (
                      <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[11px] font-medium text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                        {c.toolName}
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${difficulty.classes}`}
                    >
                      {difficulty.label}
                    </span>
                  </div>
                  <h3 className="line-clamp-2 text-[15px] leading-snug font-semibold text-zinc-900 group-hover:text-cyan-600 dark:text-zinc-100 dark:group-hover:text-cyan-400">
                    {c.title}
                  </h3>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
