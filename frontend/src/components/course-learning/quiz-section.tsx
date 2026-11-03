'use client'

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { Info } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import {
  firstUnansweredIndex,
  isPassing,
  PASSING_SCORE,
  savedRoundState,
} from '@/lib/learning-rules'
import { QuizProgress } from './quiz-progress'
import { QuestionMC } from './question-mc'
import { QuestionSA } from './question-sa'
import { AnswerFeedback } from './answer-feedback'
import { CompletionView, GuestResultView } from './completion-view'
import { RecommendedCourses } from './recommended-courses'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export interface QuizQuestion {
  id: string
  type: string
  question: string
  options?: { id: string; text: string }[]
  order: number
}

/**
 * GET /courses/:id/progress — the signed-in learner's current round.
 * `status` can be 'completed' while `answers` is partial: a retake of a passed course (BR-36).
 */
export interface MyCourseProgress {
  status: 'not_started' | 'in_progress' | 'completed'
  answers: { questionId: string; correct: boolean }[]
  /** Score of the current round once scored; null while it is being answered. */
  score: number | null
  badgeEarned: boolean
  badgeEarnedAt?: string | null
  /** Result of the most recently scored round; null if never scored. */
  latestRoundPassed?: boolean | null
}

interface QuizSectionProps {
  courseId: string
  questions: QuizQuestion[]
  /** Unpublished course opened by an admin or preview link: graded, not saved (BR-05). */
  isPreview?: boolean
  previewToken?: string
  /** Signed-in learner's saved round, used to resume (BR-19). */
  initialProgress?: MyCourseProgress | null
  /**
   * Start a new round right away when the saved round is already scored — My Learning's
   * 「重做測驗」 (BR-36). Ignored for guests, previews and rounds still being answered.
   */
  startRetake?: boolean
}

type Phase = 'answering' | 'feedback' | 'guest-submitted' | 'finishing' | 'completed'

interface FeedbackData {
  correct: boolean
  correctAnswer: string
  explanation: string
}

/** POST /courses/:id/complete */
interface ResultData {
  score: number
  totalQuestions: number
  correctAnswers: number
  passed: boolean
  badgeEarned: boolean
  badgeEarnedAt?: string | null
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

interface RoundState {
  answers: AnswerMap
  currentIndex: number
  phase: Phase
  result: ResultData | null
}

/** Where to pick up a saved round (BR-19): keep answering, score it now, or show its result. */
function resumeRound(
  questionIds: string[],
  progress: MyCourseProgress | null,
  records: boolean,
): RoundState {
  const answers = records ? answersFromProgress(progress) : {}
  const answered = new Set(Object.keys(answers))
  const first = firstUnansweredIndex(questionIds, answered)
  const state = records ? savedRoundState(questionIds, answered, progress?.score) : 'answering'

  let result: ResultData | null = null
  if (state === 'scored' && progress?.score != null) {
    result = {
      score: progress.score,
      totalQuestions: questionIds.length,
      correctAnswers: countCorrect(answers),
      passed: progress.latestRoundPassed ?? progress.score >= PASSING_SCORE,
      badgeEarned: progress.badgeEarned,
      badgeEarnedAt: progress.badgeEarnedAt ?? null,
    }
  }
  let phase: Phase = 'answering'
  if (state === 'scored') phase = 'completed'
  if (state === 'needs-scoring') phase = 'finishing'
  return { answers, currentIndex: first === -1 ? 0 : first, phase, result }
}

const primaryButton =
  'rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cyan-600 disabled:opacity-60'
const outlineButton =
  'rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'

function Spinner() {
  return (
    <div className="flex justify-center py-12" aria-live="polite">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
    </div>
  )
}

export function QuizSection({
  courseId,
  questions,
  isPreview = false,
  previewToken = '',
  initialProgress = null,
  startRetake = false,
}: QuizSectionProps) {
  const { user, accessToken, login } = useAuth()
  const isGuest = !user || !accessToken
  const records = !isGuest && !isPreview
  const questionIds = useMemo(() => questions.map((q) => q.id), [questions])

  const [initial] = useState(() => resumeRound(questionIds, initialProgress, records))
  const [answers, setAnswers] = useState<AnswerMap>(initial.answers)
  const [currentIndex, setCurrentIndex] = useState(initial.currentIndex)
  const [phase, setPhase] = useState<Phase>(initial.phase)
  const [result, setResult] = useState<ResultData | null>(initial.result)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [feedback, setFeedback] = useState<FeedbackData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)

  // Work to do as soon as the saved round is shown: score it, or start the requested retake.
  const [mountAction] = useState<'score' | 'retake' | null>(() => {
    if (initial.phase === 'finishing') return 'score'
    if (startRetake && records && initial.phase === 'completed') return 'retake'
    return null
  })
  const [isAutoRetaking, setIsAutoRetaking] = useState(mountAction === 'retake')
  const mountActionDone = useRef(false)

  const currentQuestion = questions[currentIndex]
  const answeredCount = Object.keys(answers).length
  const isLast =
    !!currentQuestion && questionIds.every((id) => id === currentQuestion.id || id in answers)
  const returnPath = `/courses/${courseId}${
    previewToken ? `?preview=${encodeURIComponent(previewToken)}` : ''
  }`

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
        setError('目前無法判定你的答案，請稍後再試。')
        return
      }
      if (!res.ok) {
        setError('答案沒有送出，請再試一次。')
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
      setError('網路連線失敗，請檢查網路後再試一次。')
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
      setError('無法載入結果，請再試一次。')
    } finally {
      setIsBusy(false)
    }
  }, [records, answers, questions.length, courseId, authHeaders])

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
        setError('無法開始新的一輪，請再試一次。')
        return
      } finally {
        setIsBusy(false)
      }
    }
    setAnswers({})
    setResult(null)
    setCurrentIndex(0)
    setSelectedAnswer('')
    setFeedback(null)
    setPhase('answering')
  }, [records, courseId, authHeaders])

  // Runs once: later 'finishing' phases come from handleNext, which already calls finish().
  useEffect(() => {
    if (!mountAction || mountActionDone.current) return
    mountActionDone.current = true
    if (mountAction === 'score') void finish()
    else void handleRetake().finally(() => setIsAutoRetaking(false))
  }, [mountAction, finish, handleRetake])

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

  // No questions
  if (questions.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 p-8 text-center dark:border-zinc-700">
        <p className="text-sm text-zinc-500">這堂課沒有測驗題目</p>
      </div>
    )
  }

  if (isAutoRetaking) return <Spinner />

  // Guest finished: no score without signing in (BR-11)
  if (phase === 'completed' && isGuest) {
    return <GuestResultView totalQuestions={questions.length} onLogin={() => login(returnPath)} />
  }

  if (phase === 'completed' && result) {
    return (
      <>
        <CompletionView
          score={result.score}
          totalQuestions={result.totalQuestions}
          correctAnswers={result.correctAnswers}
          passed={result.passed}
          badgeEarned={result.badgeEarned}
          badgeEarnedAt={result.badgeEarnedAt}
          onRetake={handleRetake}
          isRetaking={isBusy}
        >
          {error && (
            <p role="alert" className="mt-4 text-sm text-rose-600 dark:text-rose-400">
              {error}
            </p>
          )}
        </CompletionView>
        {/* BR-15: signed-in learners only, never for previews */}
        {records && <RecommendedCourses courseId={courseId} accessToken={accessToken} />}
      </>
    )
  }

  if (phase === 'finishing') {
    if (!error) return <Spinner />
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">
          {error}
        </p>
        <button
          type="button"
          onClick={() => void finish()}
          disabled={isBusy}
          className={primaryButton}
        >
          再試一次
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Quiz header — "Quiz" left, "Question X / Y" right, bottom border */}
      <div className="flex items-center justify-between border-b border-zinc-200 py-4 dark:border-zinc-700">
        <span className="text-base font-semibold text-zinc-700 dark:text-zinc-300">課後測驗</span>
        <span className="text-sm text-zinc-500">
          第 {currentIndex + 1} 題 / 共 {questions.length} 題
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

        {/* BR-11: a guest's answer is not graded; the note asks them to sign in */}
        {phase === 'guest-submitted' && (
          <div className="flex flex-col gap-4">
            <div
              role="status"
              className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-700 dark:bg-zinc-900/50"
            >
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-cyan-500" aria-hidden="true" />
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  答案已送出
                </h3>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  登入後就能看到每題的對錯和解說，學習進度也會保存下來。
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => login(returnPath)} className={primaryButton}>
                登入查看對錯
              </button>
              <button type="button" onClick={handleNext} className={outlineButton}>
                {isLast ? '查看結果' : '下一題 →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
