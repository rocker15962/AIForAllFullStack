'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { QuizProgress } from './quiz-progress'
import { QuestionMC } from './question-mc'
import { QuestionSA } from './question-sa'
import { AnswerFeedback } from './answer-feedback'
import { CompletionView } from './completion-view'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface Question {
  id: string
  type: string
  question: string
  options?: { id: string; text: string }[]
  order: number
}

interface QuizSectionProps {
  courseId: string
  questions: Question[]
}

type QuizState = 'idle' | 'answering' | 'feedback' | 'completed'

interface FeedbackData {
  correct: boolean
  correctAnswer: string
  explanation: string
}

export function QuizSection({ courseId, questions }: QuizSectionProps) {
  const { user, accessToken } = useAuth()
  const [state, setState] = useState<QuizState>(questions.length > 0 ? 'answering' : 'completed')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [feedback, setFeedback] = useState<FeedbackData | null>(null)
  const [answers, setAnswers] = useState<{ correct: boolean }[]>([])

  const currentQuestion = questions[currentIndex]
  const isLast = currentIndex === questions.length - 1

  const handleSubmit = useCallback(async () => {
    if (!currentQuestion || !selectedAnswer.trim()) return

    let result: FeedbackData

    if (user && accessToken) {
      try {
        const res = await fetch(`${API_URL}/api/v1/courses/${courseId}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            questionId: currentQuestion.id,
            answer: selectedAnswer,
          }),
        })
        if (res.ok) {
          result = await res.json()
        } else {
          result = { correct: false, correctAnswer: '', explanation: '提交失敗，請重試' }
        }
      } catch {
        result = { correct: false, correctAnswer: '', explanation: '網路錯誤' }
      }
    } else {
      result = {
        correct: currentQuestion.type === 'multiple_choice' ? selectedAnswer === 'a' : true,
        correctAnswer: '',
        explanation: '登入後可查看詳細解說',
      }
    }

    setFeedback(result)
    setAnswers((prev) => [...prev, { correct: result.correct }])
    setState('feedback')
  }, [currentQuestion, selectedAnswer, user, accessToken, courseId])

  const handleNext = useCallback(async () => {
    if (isLast) {
      if (user && accessToken) {
        try {
          await fetch(`${API_URL}/api/v1/courses/${courseId}/complete`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}` },
          })
        } catch {
          // Continue even if API fails
        }
      }
      setState('completed')
    } else {
      setCurrentIndex((prev) => prev + 1)
      setSelectedAnswer('')
      setFeedback(null)
      setState('answering')
    }
  }, [isLast, user, accessToken, courseId])

  if (questions.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 p-8 text-center dark:border-zinc-700">
        <p className="text-sm text-zinc-500">此課程尚無測驗題目</p>
      </div>
    )
  }

  if (state === 'completed') {
    const correctCount = answers.filter((a) => a.correct).length
    const score = (correctCount / questions.length) * 100
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700">
        <CompletionView
          score={score}
          totalQuestions={questions.length}
          correctAnswers={correctCount}
        />
      </div>
    )
  }

  return (
    <div>
      {/* Quiz header */}
      <div className="flex items-center justify-between border-b border-zinc-200 py-4 dark:border-zinc-700">
        <span className="text-base font-semibold text-zinc-700 dark:text-zinc-300">Quiz</span>
        <span className="text-sm text-zinc-500">
          Question {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Segmented progress bar */}
      <div className="py-4">
        <QuizProgress current={answers.length} total={questions.length} />
      </div>

      {/* Quiz card */}
      <div className="rounded-xl border border-zinc-200 bg-white p-8 dark:border-zinc-700 dark:bg-zinc-800">
        {state === 'answering' && currentQuestion && (
          <>
            {currentQuestion.type === 'multiple_choice' && currentQuestion.options ? (
              <QuestionMC
                question={currentQuestion.question}
                options={currentQuestion.options}
                selectedAnswer={selectedAnswer || null}
                onSelect={setSelectedAnswer}
                onSubmit={handleSubmit}
                disabled={false}
              />
            ) : (
              <QuestionSA
                question={currentQuestion.question}
                answer={selectedAnswer}
                onChange={setSelectedAnswer}
                onSubmit={handleSubmit}
                disabled={false}
              />
            )}
          </>
        )}

        {state === 'feedback' && feedback && (
          <AnswerFeedback
            correct={feedback.correct}
            correctAnswer={feedback.correctAnswer}
            explanation={feedback.explanation}
            onNext={handleNext}
            isLast={isLast}
          />
        )}
      </div>
    </div>
  )
}
