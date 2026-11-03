'use client'

import Link from 'next/link'
import { retakeHref, unavailableCourseLabel } from '@/lib/learning-rules'
import type { CompletedCourse } from '@/types'
import {
  CardMeta,
  CardProgressBar,
  CardThumbnail,
  CourseTags,
  CourseTitle,
  LatestRoundFailed,
  UnavailableCourseCard,
  cardClasses,
  formatShortDate,
  outlineFooterButton,
} from './card-parts'

interface CompletedCardProps {
  course: CompletedCourse
}

export function CompletedCard({ course }: CompletedCardProps) {
  const unavailable = unavailableCourseLabel(course.courseStatus)
  if (unavailable) {
    return (
      <UnavailableCourseCard
        title={course.courseTitle}
        thumbnail={course.courseThumbnail}
        toolName={course.toolName}
        skillName={course.skillName}
        difficulty={course.difficulty}
        reason={unavailable}
      />
    )
  }

  const tags = (
    <CourseTags
      toolName={course.toolName}
      skillName={course.skillName}
      difficulty={course.difficulty}
    />
  )

  // BR-36: a retake scored below 60% — the course stays completed and keeps its badge.
  if (course.latestRoundPassed === false) {
    return (
      <div className={cardClasses}>
        <CardThumbnail src={course.courseThumbnail} alt={course.courseTitle} />
        <CardProgressBar
          value={course.score}
          tone="highlight"
          label={`最新一輪未通過 · ${Math.round(course.score)}%`}
        />
        <div className="flex flex-col gap-2.5 p-4">
          <CourseTitle>{course.courseTitle}</CourseTitle>
          {tags}
          <CardMeta left={<LatestRoundFailed score={course.score} />} right="徽章保留" />
          <Link href={retakeHref(course.courseId)} className={outlineFooterButton}>
            重做測驗
          </Link>
        </div>
      </div>
    )
  }

  return (
    <Link href={`/courses/${course.courseId}`} className="group block">
      <div className={`${cardClasses} transition-shadow group-hover:shadow-md`}>
        <CardThumbnail src={course.courseThumbnail} alt={course.courseTitle} />
        <CardProgressBar value={100} tone="success" label={`分數：${Math.round(course.score)}%`} />
        <div className="flex flex-col gap-2.5 p-4">
          <CourseTitle>{course.courseTitle}</CourseTitle>
          {tags}
          <CardMeta
            left={
              <span className="font-medium text-green-600 dark:text-green-400">
                分數：{Math.round(course.score)}%
              </span>
            }
            right={formatShortDate(course.completedAt)}
          />
        </div>
      </div>
    </Link>
  )
}
