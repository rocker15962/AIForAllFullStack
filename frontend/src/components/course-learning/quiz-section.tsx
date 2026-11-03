'use client'

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { firstUnansweredIndex, isPassing } from '@/lib/learning-rules'
import { QuizProgress } from './quiz-progress'
import { QuestionMC } from './question-mc'
import { QuestionSA } from './question-sa'
import { AnswerFeedback } from './answer-feedback'
import { CompletionView } from './completion-view'
import { RecommendedCourses } from './recommended-courses'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export interface QuizQuestion {
  id: string
  type: string
  question: string
  options?: { id: string; text: string }[]
  order: number
}

/** GET /courses/:id/progress — the signed-in learner's current round. */
export interface MyCourseProgress {
  status: 'not_started' | 'in_progress' | 'completed'
  answers: { questionId: string; correct: boolean }[]
  score: number | null
  badgeEarned: boolean
}

interface QuizSectionProps {
  courseId: string
  questions: QuizQuestion[]
  /** Unpublished course opened by an admin or preview link: graded, not saved (BR-05). */
  isPreview?: boolean
  previewToken?: string
  /** Signed-in learner's saved round, used to resume (BR-19). */
  initialProgress?: MyCourseProgress | null
}

type Phase = 'answering' | 'feedback' | 'guest-submitted' | 'finishing' | 'completed'

interface FeedbackData {
  correct: boolean
  correctAnswer: string
  explanation: string
}

interface ResultData {
  score: number
  totalQuestions: number
  correctAnswers: number
  passed: boolean
  badgeEarned: boolean
}

/** Answer verdicts by question ID; `null` means answered as a guest (not graded, BR-11). */
type AnswerMap = Record<string, boolean | null>

function answersFromProgress(progress?: MyCourseProgress | null): AnswerMap {
  const map: AnswerMap = {}
  for (const a of progress?.answers ?? []) map[a.questionId] = a.correct
  return map
}

function countCorrect(answers: AnswerMap): number {
  return Object.values(answers).filter((v) => v === true).length
}

export function QuizSection({
  courseId,
  questions,
  isPreview = false,
  previewToken = '',
  initialProgress = null,
}: QuizSectionProps) {
  const { user, accessToken, login } = useAuth()
  const isGuest = !user || !accessToken
  const records = !isGuest && !isPreview
  const questionIds = useMemo(() => questions.map((q) => q.id), [questions])

  const [answers, setAnswers] = useState<AnswerMap>(() =>
    records ? answersFromProgress(initialProgress) : {},
  )
  const [currentIndex, setCurrentIndex] = useState(() => {
    const i = firstUnansweredIndex(questionIds, new Set(Object.keys(answers)))
    return i === -1 ? 0 : i
  })
  const [phase, setPhase] = useState<Phase>(() => {
    if (!records || questions.length === 0) return 'answering'
    const allAnswered = questionIds.every((id) => id in answers)
    if (!allAnswered) return 'answering'
    // Every question answered: show the saved result, or score the round now.
    return initialProgress?.score != null ? 'completed' : 'finishing'
  })
  const [result, setResult] = useState<ResultData | null>(() => {
    if (!records || initialProgress?.score == null) return null
    const correct = countCorrect(answers)
    return {
      score: initialProgress.score,
      totalQuestions: questions.length,
      correctAnswers: correct,
      passed: isPassing(correct, questions.length),
      badgeEarned: initialProgress.badgeEarned,
    }
  })
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [feedback, setFeedback] = useState<FeedbackData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)

  const currentQuestion = questions[currentIndex]
  const answeredCount = Object.keys(answers).length
  const isLast =
    !!currentQuestion && questionIds.every((id) => id === currentQuestion.id || id in answers)

  const authHeaders = useMemo(
    (): Record<string, string> => (accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    [accessToken],
  )

  const handleSubmit = useCallback(async () => {
    if (!currentQuestion || !selectedAnswer.trim() || isBusy) return
    setError(null)

    // BR-11: guests get no verdict and no explanation — only a prompt to sign in.
    if (isGuest) {
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: null }))
      setPhase('guest-submitted')
      return
    }

    setIsBusy(true)
    try {
      const query = isPreview && previewToken ? `?preview=${encodeURIComponent(previewToken)}` : ''
      const res = await fetch(`${API_URL}/api/v1/courses/${courseId}/submit${query}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ questionId: currentQuestion.id, answer: selectedAnswer }),
      })
      if (res.status === 503) {
        // BR-09: AI grading failed — nothing was saved, the learner tries again later.
        setError("We couldn't check your answer right now. Please try again in a moment.")
        return
      }
      if (!res.ok) {
        setError('Your answer was not submitted. Please try again.')
        return
      }
      const data = (await res.json()) as FeedbackData
      // Show the correct option as "B. text" rather than its ID.
      const options = currentQuestion.options ?? []
      const optionIndex = options.findIndex((o) => o.id === data.correctAnswer)
      setFeedback({
        ...data,
        correctAnswer:
          optionIndex >= 0
            ? `${String.fromCharCode(65 + optionIndex)}. ${options[optionIndex].text}`
            : data.correctAnswer,
      })
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: data.correct }))
      setPhase('feedback')
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsBusy(false)
    }
  }, [
    currentQuestion,
    selectedAnswer,
    isBusy,
    isGuest,
    isPreview,
    previewToken,
    courseId,
    authHeaders,
  ])

  const finish = useCallback(async () => {
    setError(null)
    if (!records) {
      // Guests see a sign-in prompt; previews are scored locally and not saved.
      const correct = countCorrect(answers)
      setResult({
        score: questions.length ? (correct / questions.length) * 100 : 0,
        totalQuestions: questions.length,
        correctAnswers: correct,
        passed: isPassing(correct, questions.length),
        badgeEarned: false,
      })
      setPhase('completed')
      return
    }

    setIsBusy(true)
    setPhase('finishing')
    try {
      const res = await fetch(`${API_URL}/api/v1/courses/${courseId}/complete`, {
        method: 'POST',
        headers: authHeaders,
      })
      if (!res.ok) throw new Error(`complete failed (${res.status})`)
      const data = (await res.json()) as ResultData
      setResult(data)
      setPhase('completed')
    } catch {
      setError("We couldn't load your results. Please try again.")
    } finally {
      setIsBusy(false)
    }
  }, [records, answers, questions.length, courseId, authHeaders])

  // A saved round with every question answered but no score yet: score it now.
  const autoFinished = useRef(false)
  useEffect(() => {
    if (phase === 'finishing' && !autoFinished.current) {
      autoFinished.current = true
      void finish()
    }
  }, [phase, finish])

  const handleNext = useCallback(() => {
    if (isLast) {
      void finish()
      return
    }
    const answered = new Set(Object.keys(answers))
    const next = firstUnansweredIndex(questionIds, answered, currentIndex + 1)
    setCurrentIndex(next === -1 ? 0 : next)
    setSelectedAnswer('')
    setFeedback(null)
    setPhase('answering')
  }, [isLast, finish, answers, questionIds, currentIndex])

  // BR-16: a new round replaces the previous answers and score; the badge is kept.
  const handleRetake = useCallback(async () => {
    setError(null)
    if (records) {
      setIsBusy(true)
      try {
        const res = await fetch(`${API_URL}/api/v1/courses/${courseId}/retake`, {
          method: 'POST',
          headers: authHeaders,
        })
        if (!res.ok) throw new Error(`retake failed (${res.status})`)
      } catch {
        setError("We couldn't start a new round. Please try again.")
        setIsBusy(false)
        return
      }
      setIsBusy(false)
    }
    setAnswers({})
    setResult(null)
    setCurrentIndex(0)
    setSelectedAnswer('')
    setFeedback(null)
    setPhase('answering')
  }, [records, courseId, authHeaders])

  // No questions
  if (questions.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 p-8 text-center dark:border-zinc-700">
        <p className="text-sm text-zinc-500">No quiz questions for this course</p>
      </div>
    )
  }

  // Guest finished: no score without signing in (BR-11)
  if (phase === 'completed' && isGuest) {
    return (
      <div className="py-8 text-center">
        <h2 className="mb-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          You finished the quiz
        </h2>
        <p className="mb-6 text-sm text-zinc-500">
          Sign in to see your score and explanations, save your progress and earn the badge.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => login(`/courses/${courseId}`)}
            className="rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cyan-600"
          >
            Sign In
          </button>
          <Link
            href="/courses"
            className="rounded-lg border border-zinc-200 bg-white px-6 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          >
            Explore More Courses
          </Link>
        </div>
      </div>
    )
  }

  if (phase === 'completed' && result) {
    return (
      <CompletionView
        score={result.score}
        totalQuestions={result.totalQuestions}
        correctAnswers={result.correctAnswers}
        passed={result.passed}
        badgeEarned={result.badgeEarned}
        onRetake={handleRetake}
        isRetaking={isBusy}
      >
        {error && <p className="mt-4 text-sm text-rose-600 dark:text-rose-400">{error}</p>}
        {!isPreview && <RecommendedCourses courseId={courseId} accessToken={accessToken} />}
      </CompletionView>
    )
  }

  if (phase === 'finishing') {
    return (
      <div className="flex flex-col items-center gap-4 py-12" aria-live="polite">
        {error ? (
          <>
            <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
            <button
              type="button"
              onClick={() => void finish()}
              disabled={isBusy}
              className="rounded-lg bg-cyan-500 px-5 py-2 text-sm font-semibold text-white hover:bg-cyan-600 disabled:opacity-60"
            >
              Try Again
            </button>
          </>
        ) : (
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Quiz header — "Quiz" left, "Question X / Y" right, bottom border */}
      <div className="flex items-center justify-between border-b border-zinc-200 py-4 dark:border-zinc-700">
        <span className="text-base font-semibold text-zinc-700 dark:text-zinc-300">Quiz</span>
        <span className="text-sm text-zinc-500">
          Question {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Segmented progress bar */}
      <div className="py-3">
        <QuizProgress current={answeredCount} total={questions.length} />
      </div>

      {/* Quiz card — white bg, rounded-xl, border, padding 32px */}
      <div className="rounded-xl border border-zinc-200 bg-white p-8 dark:border-zinc-700 dark:bg-zinc-800">
        {phase === 'answering' && currentQuestion && (
          <>
            {currentQuestion.type === 'multiple_choice' && currentQuestion.options ? (
              <QuestionMC
                question={currentQuestion.question}
                options={currentQuestion.options}
                selectedAnswer={selectedAnswer || null}
                onSelect={setSelectedAnswer}
                onSubmit={handleSubmit}
                disabled={isBusy}
              />
            ) : (
              <QuestionSA
                question={currentQuestion.question}
                answer={selectedAnswer}
                onChange={setSelectedAnswer}
                onSubmit={handleSubmit}
                disabled={isBusy}
              />
            )}
            {error && (
              <p role="alert" className="mt-4 text-sm text-rose-600 dark:text-rose-400">
                {error}
              </p>
            )}
          </>
        )}

        {phase === 'feedback' && feedback && (
          <AnswerFeedback
            correct={feedback.correct}
            correctAnswer={feedback.correctAnswer}
            explanation={feedback.explanation}
            onNext={handleNext}
            isLast={isLast}
          />
        )}

        {phase === 'guest-submitted' && (
          <div>
            <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-800 dark:bg-cyan-900/20">
              <p className="mb-1 text-sm font-semibold text-cyan-800 dark:text-cyan-300">
                Answer submitted
              </p>
              <p className="text-sm text-cyan-700 dark:text-cyan-400">
                Sign in to see whether you got it right and read the explanation.
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleNext}
                className="rounded-lg bg-cyan-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-cyan-600"
              >
                {isLast ? 'Finish' : 'Next →'}
              </button>
              <button
                type="button"
                onClick={() => login(`/courses/${courseId}`)}
                className="rounded-lg border border-cyan-500 px-5 py-2 text-sm font-semibold text-cyan-600 transition-colors hover:bg-cyan-50 dark:text-cyan-400 dark:hover:bg-cyan-900/20"
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
