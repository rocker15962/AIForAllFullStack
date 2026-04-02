import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserMenu } from '../user-menu'

function getTrigger() {
  return screen.getByRole('button', { name: /Demo User/i })
}

describe('UserMenu', () => {
  it('renders trigger with user name', () => {
    render(<UserMenu />)
    expect(screen.getByText('Demo User')).toBeInTheDocument()
  })

  it('shows dropdown when trigger is clicked', async () => {
    const user = userEvent.setup()
    render(<UserMenu />)

    await user.click(getTrigger())

    expect(screen.getByText('demo@aiforall.org')).toBeInTheDocument()
    expect(screen.getByText('我的學習')).toBeInTheDocument()
    expect(screen.getByText('個人資料')).toBeInTheDocument()
    expect(screen.getByText('登出')).toBeInTheDocument()
  })

  it('hides dropdown when trigger is clicked again', async () => {
    const user = userEvent.setup()
    render(<UserMenu />)

    await user.click(getTrigger())
    expect(screen.getByText('登出')).toBeInTheDocument()

    await user.click(getTrigger())
    expect(screen.queryByText('登出')).not.toBeInTheDocument()
  })

  it('closes dropdown on Escape key', async () => {
    const user = userEvent.setup()
    render(<UserMenu />)

    await user.click(getTrigger())
    expect(screen.getByText('登出')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByText('登出')).not.toBeInTheDocument()
  })

  it('closes dropdown when clicking outside', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <div data-testid="outside">outside</div>
        <UserMenu />
      </div>,
    )

    await user.click(getTrigger())
    expect(screen.getByText('登出')).toBeInTheDocument()

    await user.click(screen.getByTestId('outside'))
    expect(screen.queryByText('登出')).not.toBeInTheDocument()
  })

  it('has navigation links with correct hrefs', async () => {
    const user = userEvent.setup()
    render(<UserMenu />)

    await user.click(getTrigger())

    const myLearningLink = screen.getByRole('link', { name: '我的學習' })
    expect(myLearningLink).toHaveAttribute('href', '/my-learning')

    const profileLink = screen.getByRole('link', { name: '個人資料' })
    expect(profileLink).toHaveAttribute('href', '/profile')
  })
})
