'use client'

import Link from 'next/link'
import { retakeHref, unavailableCourseLabel } from '@/lib/learning-rules'
import type { InProgressCourse } from '@/types'
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

interface ProgressCardProps {
  course: InProgressCourse
}

export function ProgressCard({ course }: ProgressCardProps) {
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

  // A never-passed course whose whole round was scored below 60%: say so and offer a retake.
  // Once a new round is under way, the card shows its progress again.
  const answeredAll = course.totalQuestions > 0 && course.currentQuestion >= course.totalQuestions
  const failedScore =
    answeredAll && course.latestRoundPassed === false && course.score != null ? course.score : null

  return (
    <div className={cardClasses}>
      <CardThumbnail src={course.courseThumbnail} alt={course.courseTitle} />

      {failedScore !== null ? (
        <CardProgressBar
          value={failedScore}
          tone="highlight"
          label={`最新一輪未通過 · ${Math.round(failedScore)}%`}
        />
      ) : (
        <CardProgressBar value={course.progress} tone="accent" label={`進度 ${course.progress}%`} />
      )}

      <div className="flex flex-col gap-2.5 p-4">
        <CourseTitle>{course.courseTitle}</CourseTitle>
        <CourseTags
          toolName={course.toolName}
          skillName={course.skillName}
          difficulty={course.difficulty}
        />

        {failedScore !== null ? (
          <>
            <CardMeta
              left={<LatestRoundFailed score={failedScore} />}
              right={formatShortDate(course.lastAccessedAt)}
            />
            <Link href={retakeHref(course.courseId)} className={outlineFooterButton}>
              重做測驗
            </Link>
          </>
        ) : (
          <>
            <CardMeta
              left={
                <span className="font-medium text-cyan-500">
                  進度 {course.progress}% · 已答 {course.currentQuestion}/{course.totalQuestions} 題
                </span>
              }
              right={formatShortDate(course.lastAccessedAt)}
            />
            <Link
              href={`/courses/${course.courseId}`}
              className="block rounded-lg bg-cyan-500 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-cyan-600"
            >
              繼續學習
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
