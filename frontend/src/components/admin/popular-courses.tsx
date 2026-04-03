'use client'

import { Trophy } from 'lucide-react'

interface PopularCourse {
  id: string
  title: string
  completions: number
}

interface PopularCoursesProps {
  courses: PopularCourse[]
}

export function PopularCourses({ courses }: PopularCoursesProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Popular Courses
      </h2>

      {courses.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No course data available yet.</p>
      ) : (
        <ul className="space-y-3">
          {courses.map((course, index) => (
            <li
              key={course.id}
              className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {course.title}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                <Trophy className="h-3.5 w-3.5" />
                <span>{course.completions}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
