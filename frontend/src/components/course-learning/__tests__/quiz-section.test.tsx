import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuizSection } from '../quiz-section'
import type { MyCourseProgress, QuizQuestion } from '../quiz-section'

const authState: { user: { id: string } | null; accessToken: string | null } = {
  user: null,
  accessToken: null,
}
const login = vi.fn()
vi.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({ ...authState, login }),
}))

const options = [
  { id: 'a', text: 'Alpha' },
  { id: 'b', text: 'Bravo' },
  { id: 'c', text: 'Charlie' },
  { id: 'd', text: 'Delta' },
]
const questions: QuizQuestion[] = [
  { id: 'q1', type: 'multiple_choice', question: 'First?', options, order: 1 },
  { id: 'q2', type: 'multiple_choice', question: 'Second?', options, order: 2 },
  { id: 'q3', type: 'short_answer', question: 'Explain third', order: 3 },
]

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve(new Response(JSON.stringify(body), { status }))
}

const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset()
  login.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => {
  vi.unstubAllGlobals()
})

function signIn() {
  authState.user = { id: 'u1' }
  authState.accessToken = 'token'
}
function signOut() {
  authState.user = null
  authState.accessToken = null
}

describe('QuizSection — guests (BR-11)', () => {
  beforeEach(signOut)

  it('does not grade guest answers and prompts to sign in', async () => {
    const user = userEvent.setup()
    render(<QuizSection courseId="c1" questions={questions} />)

    await user.click(screen.getByText('Bravo'))
    await user.click(screen.getByRole('button', { name: 'Submit Answer' }))

    expect(screen.getByText('Answer submitted')).toBeInTheDocument()
    expect(
      screen.getByText('Sign in to see whether you got it right and read the explanation.'),
    ).toBeInTheDocument()
    expect(screen.queryByText(/Correct!/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Incorrect/)).not.toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('QuizSection — signed in', () => {
  beforeEach(signIn)

  it('resumes at the first unanswered question (BR-19)', () => {
    const progress: MyCourseProgress = {
      status: 'in_progress',
      answers: [
        { questionId: 'q1', correct: true },
        { questionId: 'q2', correct: false },
      ],
      score: null,
      badgeEarned: false,
    }
    render(<QuizSection courseId="c1" questions={questions} initialProgress={progress} />)
    expect(screen.getByText('Question 3 / 3')).toBeInTheDocument()
    expect(screen.getByText('Explain third')).toBeInTheDocument()
  })

  it('asks to try again when grading is unavailable (BR-09)', async () => {
    const user = userEvent.setup()
    fetchMock.mockReturnValueOnce(jsonResponse({ error: 'unavailable' }, 503))
    const progress: MyCourseProgress = {
      status: 'in_progress',
      answers: [
        { questionId: 'q1', correct: true },
        { questionId: 'q2', correct: true },
      ],
      score: null,
      badgeEarned: false,
    }
    render(<QuizSection courseId="c1" questions={questions} initialProgress={progress} />)

    await user.type(screen.getByPlaceholderText('Type your answer...'), 'my answer')
    await user.click(screen.getByRole('button', { name: 'Submit Answer' }))

    expect(
      await screen.findByText(
        "We couldn't check your answer right now. Please try again in a moment.",
      ),
    ).toBeInTheDocument()
    // Still on the same question, answer kept for another try
    expect(screen.getByText('Explain third')).toBeInTheDocument()
    expect(screen.getByDisplayValue('my answer')).toBeInTheDocument()
  })

  it('shows the correct option text when wrong', async () => {
    const user = userEvent.setup()
    fetchMock.mockReturnValueOnce(
      jsonResponse({ correct: false, correctAnswer: 'c', explanation: 'Because C.' }),
    )
    render(<QuizSection courseId="c1" questions={questions} />)

    await user.click(screen.getByText('Alpha'))
    await user.click(screen.getByRole('button', { name: 'Submit Answer' }))

    expect(await screen.findByText('Correct answer: C. Charlie')).toBeInTheDocument()
    expect(screen.getByText('Because C.')).toBeInTheDocument()
  })

  it('shows "Keep going!" and a retake below 60% (BR-12, BR-16)', async () => {
    const user = userEvent.setup()
    const progress: MyCourseProgress = {
      status: 'in_progress',
      answers: [
        { questionId: 'q1', correct: true },
        { questionId: 'q2', correct: false },
        { questionId: 'q3', correct: false },
      ],
      score: 33.33,
      badgeEarned: false,
    }
    fetchMock.mockImplementation((url: string) => {
      if (url.endsWith('/recommended')) return jsonResponse({ courses: [] })
      if (url.endsWith('/retake')) return jsonResponse({ retake: true })
      return jsonResponse({})
    })
    render(<QuizSection courseId="c1" questions={questions} initialProgress={progress} />)

    expect(screen.getByRole('heading', { name: 'Keep going!' })).toBeInTheDocument()
    expect(screen.queryByText('Congratulations!')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Retake Quiz' }))
    await waitFor(() => expect(screen.getByText('Question 1 / 3')).toBeInTheDocument())
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/api/v1/courses/c1/retake',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('scores the round with the server when the last question is answered', async () => {
    const user = userEvent.setup()
    const progress: MyCourseProgress = {
      status: 'in_progress',
      answers: [
        { questionId: 'q1', correct: true },
        { questionId: 'q3', correct: true },
      ],
      score: null,
      badgeEarned: false,
    }
    fetchMock.mockImplementation((url: string) => {
      if (url.includes('/submit'))
        return jsonResponse({ correct: true, correctAnswer: 'b', explanation: '' })
      if (url.endsWith('/complete'))
        return jsonResponse({
          score: 100,
          totalQuestions: 3,
          correctAnswers: 3,
          passed: true,
          badgeEarned: true,
          passingScore: 60,
        })
      return jsonResponse({ courses: [] })
    })
    render(<QuizSection courseId="c1" questions={questions} initialProgress={progress} />)

    expect(screen.getByText('Question 2 / 3')).toBeInTheDocument()
    await user.click(screen.getByText('Bravo'))
    await user.click(screen.getByRole('button', { name: 'Submit Answer' }))
    await user.click(await screen.findByRole('button', { name: 'View Results' }))

    expect(await screen.findByText('Congratulations!')).toBeInTheDocument()
    expect(screen.getByText('Perfect!')).toBeInTheDocument()
    expect(screen.getByText('You earned the badge for this course.')).toBeInTheDocument()
  })

  it('grades previews without saving (BR-05)', async () => {
    const user = userEvent.setup()
    fetchMock.mockReturnValueOnce(
      jsonResponse({ correct: true, correctAnswer: 'b', explanation: '' }),
    )
    render(<QuizSection courseId="c1" questions={questions} isPreview previewToken="tok en" />)
    await user.click(screen.getByText('Bravo'))
    await user.click(screen.getByRole('button', { name: 'Submit Answer' }))

    expect(fetchMock.mock.calls[0][0]).toBe(
      'http://localhost:8080/api/v1/courses/c1/submit?preview=tok%20en',
    )
  })
})
