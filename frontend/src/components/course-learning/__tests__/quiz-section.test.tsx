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
    await user.click(screen.getByRole('button', { name: '送出答案' }))

    expect(screen.getByRole('heading', { name: '答案已送出' })).toBeInTheDocument()
    expect(
      screen.getByText('登入後就能看到每題的對錯和解說，學習進度也會保存下來。'),
    ).toBeInTheDocument()
    expect(screen.queryByText(/答對了/)).not.toBeInTheDocument()
    expect(screen.queryByText(/答錯了/)).not.toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: '登入查看對錯' }))
    expect(login).toHaveBeenCalledWith('/courses/c1')
  })

  it('moves on with 下一題 and finishes without a score', async () => {
    const user = userEvent.setup()
    render(<QuizSection courseId="c1" questions={questions} />)

    await user.click(screen.getByText('Bravo'))
    await user.click(screen.getByRole('button', { name: '送出答案' }))
    await user.click(screen.getByRole('button', { name: '下一題 →' }))
    expect(screen.getByText('Second?')).toBeInTheDocument()

    await user.click(screen.getByText('Alpha'))
    await user.click(screen.getByRole('button', { name: '送出答案' }))
    await user.click(screen.getByRole('button', { name: '下一題 →' }))

    await user.type(screen.getByPlaceholderText('輸入你的答案…'), 'because')
    await user.click(screen.getByRole('button', { name: '送出答案' }))
    await user.click(screen.getByRole('button', { name: '查看結果' }))

    expect(screen.getByRole('heading', { name: '3 題都做完了' })).toBeInTheDocument()
    expect(screen.queryByText(/%/)).not.toBeInTheDocument()
    expect(screen.queryByText('接下來可以學')).not.toBeInTheDocument()
    // Nothing is graded, saved or recommended for guests
    expect(fetchMock).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: '登入查看結果' }))
    expect(login).toHaveBeenCalledWith('/courses/c1')
  })

  it('keeps the preview link when a guest signs in from a preview', async () => {
    const user = userEvent.setup()
    render(<QuizSection courseId="c1" questions={questions} isPreview previewToken="tok" />)
    await user.click(screen.getByText('Bravo'))
    await user.click(screen.getByRole('button', { name: '送出答案' }))
    await user.click(screen.getByRole('button', { name: '登入查看對錯' }))
    expect(login).toHaveBeenCalledWith('/courses/c1?preview=tok')
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
    expect(screen.getByText('第 3 題 / 共 3 題')).toBeInTheDocument()
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

    await user.type(screen.getByPlaceholderText('輸入你的答案…'), 'my answer')
    await user.click(screen.getByRole('button', { name: '送出答案' }))

    expect(await screen.findByText('目前無法判定你的答案，請稍後再試。')).toBeInTheDocument()
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
    await user.click(screen.getByRole('button', { name: '送出答案' }))

    expect(await screen.findByText('正確答案：C. Charlie')).toBeInTheDocument()
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

    expect(screen.getByRole('heading', { name: '繼續加油！' })).toBeInTheDocument()
    expect(screen.queryByText('恭喜完成！')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '重做測驗' }))
    await waitFor(() => expect(screen.getByText('第 1 題 / 共 3 題')).toBeInTheDocument())
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

    expect(screen.getByText('第 2 題 / 共 3 題')).toBeInTheDocument()
    await user.click(screen.getByText('Bravo'))
    await user.click(screen.getByRole('button', { name: '送出答案' }))
    await user.click(await screen.findByRole('button', { name: '查看結果' }))

    expect(await screen.findByText('恭喜完成！')).toBeInTheDocument()
    expect(screen.getByText('滿分！')).toBeInTheDocument()
    expect(screen.getByText('你獲得了這堂課的徽章。')).toBeInTheDocument()
    const completeCalls = fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/complete'))
    expect(completeCalls).toHaveLength(1)
  })

  it('answers a retake in progress even though the course stays completed (BR-36)', () => {
    const progress: MyCourseProgress = {
      status: 'completed',
      answers: [{ questionId: 'q1', correct: false }],
      score: null,
      badgeEarned: true,
      badgeEarnedAt: '2026-09-23T10:00:00Z',
      latestRoundPassed: false,
    }
    render(<QuizSection courseId="c1" questions={questions} initialProgress={progress} />)
    expect(screen.getByText('第 2 題 / 共 3 題')).toBeInTheDocument()
    expect(screen.getByText('Second?')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('shows a failed retake with the kept badge and recommendations (BR-12, BR-15, BR-36)', async () => {
    const progress: MyCourseProgress = {
      status: 'completed',
      answers: [
        { questionId: 'q1', correct: true },
        { questionId: 'q2', correct: false },
        { questionId: 'q3', correct: false },
      ],
      score: 33.33,
      badgeEarned: true,
      badgeEarnedAt: '2026-09-23T10:00:00Z',
      latestRoundPassed: false,
    }
    fetchMock.mockImplementation((url: string) =>
      url.endsWith('/recommended')
        ? jsonResponse({
            courses: [
              {
                id: 'r1',
                title: 'Next course',
                thumbnailUrl: '',
                difficulty: 'intermediate',
                toolName: 'ChatGPT',
                skillName: 'Writing',
              },
            ],
          })
        : jsonResponse({}),
    )
    render(<QuizSection courseId="c1" questions={questions} initialProgress={progress} />)

    expect(screen.getByRole('heading', { name: '繼續加油！' })).toBeInTheDocument()
    expect(screen.getByText('33%')).toBeInTheDocument()
    expect(screen.getByText('你仍保留之前拿到的徽章（9月23日取得）')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: '接下來可以學' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Next course/ })).toHaveAttribute('href', '/courses/r1')
  })

  it('starts a new round right away when opened from My Learning (BR-36)', async () => {
    const progress: MyCourseProgress = {
      status: 'completed',
      answers: [
        { questionId: 'q1', correct: true },
        { questionId: 'q2', correct: false },
        { questionId: 'q3', correct: false },
      ],
      score: 33.33,
      badgeEarned: true,
      badgeEarnedAt: '2026-09-23T10:00:00Z',
      latestRoundPassed: false,
    }
    fetchMock.mockImplementation(() => jsonResponse({ retake: true }))
    render(
      <QuizSection courseId="c1" questions={questions} initialProgress={progress} startRetake />,
    )

    expect(await screen.findByText('第 1 題 / 共 3 題')).toBeInTheDocument()
    expect(screen.getByText('First?')).toBeInTheDocument()
    expect(screen.queryByText('繼續加油！')).not.toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/api/v1/courses/c1/retake',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('does not start another round when a retake is already being answered', () => {
    const progress: MyCourseProgress = {
      status: 'completed',
      answers: [{ questionId: 'q1', correct: true }],
      score: null,
      badgeEarned: true,
      badgeEarnedAt: null,
      latestRoundPassed: false,
    }
    render(
      <QuizSection courseId="c1" questions={questions} initialProgress={progress} startRetake />,
    )
    expect(screen.getByText('第 2 題 / 共 3 題')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('scores a fully answered saved round once', async () => {
    const progress: MyCourseProgress = {
      status: 'in_progress',
      answers: [
        { questionId: 'q1', correct: true },
        { questionId: 'q2', correct: true },
        { questionId: 'q3', correct: false },
      ],
      score: null,
      badgeEarned: false,
    }
    fetchMock.mockImplementation((url: string) =>
      url.endsWith('/complete')
        ? jsonResponse({
            score: 66.67,
            totalQuestions: 3,
            correctAnswers: 2,
            passed: true,
            badgeEarned: true,
            badgeEarnedAt: '2026-11-03T00:00:00Z',
            passingScore: 60,
          })
        : jsonResponse({ courses: [] }),
    )
    render(<QuizSection courseId="c1" questions={questions} initialProgress={progress} />)

    expect(await screen.findByText('恭喜完成！')).toBeInTheDocument()
    const completeCalls = fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/complete'))
    expect(completeCalls).toHaveLength(1)
  })

  it('grades previews without saving (BR-05)', async () => {
    const user = userEvent.setup()
    fetchMock.mockReturnValueOnce(
      jsonResponse({ correct: true, correctAnswer: 'b', explanation: '' }),
    )
    render(<QuizSection courseId="c1" questions={questions} isPreview previewToken="tok en" />)
    await user.click(screen.getByText('Bravo'))
    await user.click(screen.getByRole('button', { name: '送出答案' }))

    expect(fetchMock.mock.calls[0][0]).toBe(
      'http://localhost:8080/api/v1/courses/c1/submit?preview=tok%20en',
    )
  })

  it('shows no recommendations for previews (BR-05, BR-15)', async () => {
    const user = userEvent.setup()
    fetchMock.mockImplementation(() =>
      jsonResponse({ correct: true, correctAnswer: 'b', explanation: '' }),
    )
    const one = [questions[0]]
    render(<QuizSection courseId="c1" questions={one} isPreview previewToken="tok" />)
    await user.click(screen.getByText('Bravo'))
    await user.click(screen.getByRole('button', { name: '送出答案' }))
    await user.click(await screen.findByRole('button', { name: '查看結果' }))

    expect(screen.getByText('恭喜完成！')).toBeInTheDocument()
    expect(fetchMock.mock.calls.some(([url]) => String(url).includes('/recommended'))).toBe(false)
    expect(fetchMock.mock.calls.some(([url]) => String(url).includes('/complete'))).toBe(false)
  })
})
