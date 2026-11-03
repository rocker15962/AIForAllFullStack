import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CompletionView, GuestResultView } from '../completion-view'

describe('CompletionView — passed (BR-12, BR-14)', () => {
  it('shows the trophy and congratulations', () => {
    render(<CompletionView score={80} totalQuestions={5} correctAnswers={4} />)
    expect(screen.getByTestId('result-trophy')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '恭喜完成！' })).toBeInTheDocument()
  })

  it('shows the score and the correct count', () => {
    render(<CompletionView score={80} totalQuestions={5} correctAnswers={4} />)
    expect(screen.getByText('80%')).toBeInTheDocument()
    expect(screen.getByText('答對 4 / 5 題')).toBeInTheDocument()
  })

  it('shows 滿分！ for 100% and 做得好！ from 60%', () => {
    const { rerender } = render(
      <CompletionView score={100} totalQuestions={5} correctAnswers={5} />,
    )
    expect(screen.getByText('滿分！')).toBeInTheDocument()
    rerender(<CompletionView score={60} totalQuestions={5} correctAnswers={3} />)
    expect(screen.getByText('做得好！')).toBeInTheDocument()
  })

  it('offers 探索更多課程 and 返回課程列表', () => {
    render(<CompletionView score={80} totalQuestions={5} correctAnswers={4} />)
    expect(screen.getByRole('link', { name: '探索更多課程' })).toHaveAttribute('href', '/courses')
    expect(screen.getByRole('link', { name: '返回課程列表' })).toHaveAttribute('href', '/courses')
  })

  it('tells the learner they earned the badge', () => {
    render(<CompletionView score={80} totalQuestions={5} correctAnswers={4} badgeEarned />)
    expect(screen.getByText('你獲得了這堂課的徽章。')).toBeInTheDocument()
  })
})

describe('CompletionView — not passed (BR-12)', () => {
  it('shows no trophy, a gray score, the passing rule and a retake', async () => {
    const onRetake = vi.fn()
    render(<CompletionView score={40} totalQuestions={5} correctAnswers={2} onRetake={onRetake} />)

    expect(screen.queryByTestId('result-trophy')).not.toBeInTheDocument()
    expect(screen.queryByText('恭喜完成！')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '繼續加油！' })).toBeInTheDocument()
    expect(screen.getByText('答對 60% 以上才算完課、拿到徽章。')).toBeInTheDocument()
    expect(screen.getByText('40%')).toHaveClass('text-zinc-400')
    expect(screen.getByRole('link', { name: '返回課程列表' })).toHaveAttribute('href', '/courses')
    expect(screen.queryByRole('link', { name: '探索更多課程' })).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: '重做測驗' }))
    expect(onRetake).toHaveBeenCalled()
  })

  it('does not mention a badge the learner never earned', () => {
    render(<CompletionView score={40} totalQuestions={5} correctAnswers={2} />)
    expect(screen.queryByText(/你仍保留之前拿到的徽章/)).not.toBeInTheDocument()
  })

  it('tells a learner who failed a retake they keep the earlier badge, with its date (BR-36)', () => {
    render(
      <CompletionView
        score={40}
        totalQuestions={5}
        correctAnswers={2}
        badgeEarned
        badgeEarnedAt="2026-09-23T10:00:00Z"
      />,
    )
    expect(screen.getByText('你仍保留之前拿到的徽章（9月23日取得）')).toBeInTheDocument()
  })

  it('leaves out the date when it is unknown', () => {
    render(<CompletionView score={20} totalQuestions={5} correctAnswers={1} badgeEarned />)
    expect(screen.getByText('你仍保留之前拿到的徽章')).toBeInTheDocument()
  })
})

describe('GuestResultView (BR-11)', () => {
  it('shows no score and asks the guest to sign in', async () => {
    const onLogin = vi.fn()
    render(<GuestResultView totalQuestions={5} onLogin={onLogin} />)

    expect(screen.getByRole('heading', { name: '5 題都做完了' })).toBeInTheDocument()
    expect(
      screen.getByText('登入後就能看到分數、每題的對錯和解說，也能拿到這堂課的徽章。'),
    ).toBeInTheDocument()
    expect(screen.queryByText(/%/)).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: '返回課程列表' })).toHaveAttribute('href', '/courses')

    await userEvent.click(screen.getByRole('button', { name: '登入查看結果' }))
    expect(onLogin).toHaveBeenCalled()
  })
})
