'use client'

import { CourseCard } from './course-card'

interface Course {
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

interface ToolMap {
  [id: string]: string
}

interface CourseGridProps {
  courses: Course[]
  toolNames: ToolMap
  skillNames: ToolMap
}

export function CourseGrid({ courses, toolNames, skillNames }: CourseGridProps) {
  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium text-zinc-500 dark:text-zinc-400">No courses found</p>
        <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
          Try adjusting your filters or search terms
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          toolName={toolNames[course.toolId]}
          skillName={skillNames[course.skillId]}
        />
      ))}
    </div>
  )
}
