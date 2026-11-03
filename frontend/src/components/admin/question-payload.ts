import type { Question, QuestionOption } from '@/types'

/** A question as sent to POST/PUT /admin/courses (saved together with the course, BR-29). */
export interface QuestionPayload {
  /** Existing question UUID, or a temporary client ID for a new question. */
  id: string
  type: 'multiple_choice' | 'short_answer'
  question: string
  options: QuestionOption[]
  correctAnswer: string
  sampleAnswer: string
  explanation: string
}

const OPTION_IDS = ['a', 'b', 'c', 'd']

function isMultipleChoice(type: Question['type']): boolean {
  return type === 'multiple_choice' || type === 'multiple-choice'
}

function normalizeOptions(options: Question['options']): QuestionOption[] {
  return (options ?? []).map((o, i) =>
    typeof o === 'string' ? { id: OPTION_IDS[i] ?? String(i), text: o } : o,
  )
}

/** Converts an editor question to the API payload. Questions are ordered by array position. */
export function toQuestionPayload(q: Question): QuestionPayload {
  if (isMultipleChoice(q.type)) {
    const options = normalizeOptions(q.options)
    let correctAnswer = q.correctAnswer === undefined ? '' : String(q.correctAnswer)
    // Older data may store the correct option as an index.
    if (typeof q.correctAnswer === 'number' && options[q.correctAnswer]) {
      correctAnswer = options[q.correctAnswer].id
    }
    return {
      id: q.id,
      type: 'multiple_choice',
      question: q.question,
      options,
      correctAnswer,
      sampleAnswer: '',
      explanation: q.explanation ?? '',
    }
  }
  return {
    id: q.id,
    type: 'short_answer',
    question: q.question,
    options: [],
    correctAnswer: '',
    sampleAnswer: q.sampleAnswer ?? '',
    explanation: q.explanation ?? '',
  }
}
