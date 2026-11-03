import { describe, it, expect } from 'vitest'
import { toQuestionPayload } from '../question-payload'

describe('toQuestionPayload (BR-29)', () => {
  it('keeps multiple-choice options and the correct option id', () => {
    const payload = toQuestionPayload({
      id: 'q1',
      courseId: 'c1',
      type: 'multiple_choice',
      question: 'Pick one',
      options: [
        { id: 'a', text: 'A' },
        { id: 'b', text: 'B' },
        { id: 'c', text: 'C' },
        { id: 'd', text: 'D' },
      ],
      correctAnswer: 'c',
      explanation: 'Because',
      order: 1,
    })
    expect(payload).toMatchObject({
      id: 'q1',
      type: 'multiple_choice',
      correctAnswer: 'c',
      sampleAnswer: '',
      explanation: 'Because',
    })
    expect(payload.options).toHaveLength(4)
  })

  it('converts legacy string options and index answers', () => {
    const payload = toQuestionPayload({
      id: 'q2',
      courseId: 'c1',
      type: 'multiple-choice',
      question: 'Pick',
      options: ['w', 'x', 'y', 'z'],
      correctAnswer: 1,
      order: 2,
    })
    expect(payload.options[1]).toEqual({ id: 'b', text: 'x' })
    expect(payload.correctAnswer).toBe('b')
  })

  it('sends the sample answer for short-answer questions', () => {
    const payload = toQuestionPayload({
      id: 'temp-1',
      courseId: '',
      type: 'short_answer',
      question: 'Explain',
      sampleAnswer: 'A model answer',
      order: 3,
    })
    expect(payload).toMatchObject({
      type: 'short_answer',
      sampleAnswer: 'A model answer',
      options: [],
      correctAnswer: '',
    })
  })
})
