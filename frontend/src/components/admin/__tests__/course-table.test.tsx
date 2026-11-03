import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { CourseTable } from '../course-table'
import type { CourseCardItem } from '../course-table'

const mockCourses: CourseCardItem[] = [
  {
    id: '1',
    title: 'Intro to ChatGPT',
    description: 'Learn the basics of ChatGPT',
    thumbnailUrl: 'https://example.com/thumb1.jpg',
    difficulty: 'beginner',
    duration: 600,
    toolId: 'tool-1',
    skillId: 'skill-1',
    status: 'published',
    questionCount: 5,
  },
  {
    id: '2',
    title: 'Advanced Prompting',
    description: 'Master advanced prompt engineering techniques',
    thumbnailUrl: '',
    difficulty: 'advanced',
    duration: 1200,
    toolId: 'tool-2',
    skillId: 'skill-2',
    status: 'draft',
    questionCount: 0,
  },
]

const archivedCourse: CourseCardItem = {
  ...mockCourses[0],
  id: '3',
  title: 'Old Course',
  status: 'archived',
}

const toolNames = { 'tool-1': 'ChatGPT', 'tool-2': 'Midjourney' }
const skillNames = { 'skill-1': 'Prompting', 'skill-2': 'Image Gen' }

function card(title: string): HTMLElement {
  return screen.getByRole('article', { name: title })
}

describe('CourseTable', () => {
  const defaultProps = {
    courses: mockCourses,
    toolNames,
    skillNames,
    onEdit: vi.fn(),
    onArchive: vi.fn(),
    onTogglePublish: vi.fn(),
  }

  it('renders course cards with titles and descriptions', () => {
    render(<CourseTable {...defaultProps} />)

    expect(screen.getByText('Intro to ChatGPT')).toBeInTheDocument()
    expect(screen.getByText('Learn the basics of ChatGPT')).toBeInTheDocument()
    expect(screen.getByText('Advanced Prompting')).toBeInTheDocument()
  })

  it('renders tool and skill tags', () => {
    render(<CourseTable {...defaultProps} />)

    expect(screen.getByText('ChatGPT')).toBeInTheDocument()
    expect(screen.getByText('Prompting')).toBeInTheDocument()
    expect(screen.getByText('Midjourney')).toBeInTheDocument()
    expect(screen.getByText('Image Gen')).toBeInTheDocument()
  })

  it('renders difficulty badges', () => {
    render(<CourseTable {...defaultProps} />)

    expect(screen.getByText('入門')).toBeInTheDocument()
    expect(screen.getByText('進階')).toBeInTheDocument()
  })

  it('renders status indicators', () => {
    render(<CourseTable {...defaultProps} />)

    expect(screen.getByText('已發布')).toBeInTheDocument()
    expect(screen.getByText('草稿')).toBeInTheDocument()
  })

  it('renders question counts', () => {
    render(<CourseTable {...defaultProps} />)

    expect(screen.getByText('5 題')).toBeInTheDocument()
    expect(screen.getByText('0 題')).toBeInTheDocument()
  })

  it('renders a count of 1 with the same measure word', () => {
    const singleQ: CourseCardItem[] = [{ ...mockCourses[0], questionCount: 1 }]
    render(<CourseTable {...defaultProps} courses={singleQ} />)

    expect(screen.getByText('1 題')).toBeInTheDocument()
  })

  it('shows empty state when no courses', () => {
    render(<CourseTable {...defaultProps} courses={[]} />)

    expect(screen.getByText('找不到課程')).toBeInTheDocument()
    expect(screen.getByText('試著調整篩選條件或搜尋關鍵字')).toBeInTheDocument()
  })

  it('calls onEdit when clicking card body', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    render(<CourseTable {...defaultProps} onEdit={onEdit} />)

    await user.click(screen.getByText('Intro to ChatGPT'))
    expect(onEdit).toHaveBeenCalledWith(mockCourses[0])
  })

  describe('card actions (BR-31)', () => {
    it('offers unpublish, edit and archive on a published card', async () => {
      const user = userEvent.setup()
      const onTogglePublish = vi.fn()
      const onEdit = vi.fn()
      const onArchive = vi.fn()
      render(
        <CourseTable
          {...defaultProps}
          onTogglePublish={onTogglePublish}
          onEdit={onEdit}
          onArchive={onArchive}
        />,
      )
      const published = within(card('Intro to ChatGPT'))

      await user.click(published.getByRole('button', { name: '取消發布「Intro to ChatGPT」' }))
      expect(onTogglePublish).toHaveBeenCalledWith(mockCourses[0])

      await user.click(published.getByRole('button', { name: '編輯「Intro to ChatGPT」' }))
      expect(onEdit).toHaveBeenCalledWith(mockCourses[0])

      await user.click(published.getByRole('button', { name: '封存「Intro to ChatGPT」' }))
      expect(onArchive).toHaveBeenCalledWith(mockCourses[0])
    })

    it('offers publish (not unpublish) on a draft card', () => {
      render(<CourseTable {...defaultProps} />)
      const draft = within(card('Advanced Prompting'))

      expect(draft.getByRole('button', { name: '發布「Advanced Prompting」' })).toBeInTheDocument()
      expect(
        draft.queryByRole('button', { name: '取消發布「Advanced Prompting」' }),
      ).not.toBeInTheDocument()
    })

    it('uses the archive icon for 封存', () => {
      render(<CourseTable {...defaultProps} />)
      const archiveButton = screen.getByRole('button', { name: '封存「Intro to ChatGPT」' })

      expect(archiveButton.querySelector('svg.lucide-archive')).not.toBeNull()
    })
  })

  describe('draft footer (BR-05)', () => {
    it('shows a full-width 複製預覽連結 button on draft cards only', async () => {
      const user = userEvent.setup()
      const onCopyPreviewLink = vi.fn()
      render(<CourseTable {...defaultProps} onCopyPreviewLink={onCopyPreviewLink} />)

      expect(
        within(card('Intro to ChatGPT')).queryByRole('button', { name: '複製預覽連結' }),
      ).not.toBeInTheDocument()

      const copyButton = within(card('Advanced Prompting')).getByRole('button', {
        name: '複製預覽連結',
      })
      expect(copyButton).toHaveClass('w-full')
      await user.click(copyButton)
      expect(onCopyPreviewLink).toHaveBeenCalledWith(mockCourses[1])
    })

    it('does not open the editor when the footer button is clicked', async () => {
      const user = userEvent.setup()
      const onEdit = vi.fn()
      render(<CourseTable {...defaultProps} onEdit={onEdit} onCopyPreviewLink={vi.fn()} />)

      await user.click(
        within(card('Advanced Prompting')).getByRole('button', { name: '複製預覽連結' }),
      )
      expect(onEdit).not.toHaveBeenCalled()
    })
  })

  describe('archived card (BR-31)', () => {
    it('is dimmed with a gray 已封存 status', () => {
      render(<CourseTable {...defaultProps} courses={[archivedCourse]} />)

      expect(card('Old Course')).toHaveClass('opacity-70')
      expect(screen.getByText('已封存')).toBeInTheDocument()
    })

    it('has no publish, edit or archive actions and is not clickable', async () => {
      const user = userEvent.setup()
      const onEdit = vi.fn()
      render(
        <CourseTable
          {...defaultProps}
          courses={[archivedCourse]}
          onEdit={onEdit}
          onRestore={vi.fn()}
        />,
      )
      const archived = within(card('Old Course'))

      expect(archived.queryByRole('button', { name: /發布/ })).not.toBeInTheDocument()
      expect(archived.queryByRole('button', { name: /編輯/ })).not.toBeInTheDocument()
      expect(archived.queryByRole('button', { name: /封存/ })).not.toBeInTheDocument()
      // The only control left is the restore button
      expect(archived.getAllByRole('button')).toHaveLength(1)

      await user.click(screen.getByText('Old Course'))
      expect(onEdit).not.toHaveBeenCalled()
    })

    it('restores to draft from the footer button', async () => {
      const user = userEvent.setup()
      const onRestore = vi.fn()
      render(<CourseTable {...defaultProps} courses={[archivedCourse]} onRestore={onRestore} />)

      const restoreButton = within(card('Old Course')).getByRole('button', {
        name: '還原成草稿',
      })
      expect(restoreButton).toHaveClass('w-full')
      await user.click(restoreButton)
      expect(onRestore).toHaveBeenCalledWith(archivedCourse)
    })
  })
})
