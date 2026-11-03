import { render, screen } from '@testing-library/react'
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

const toolNames = { 'tool-1': 'ChatGPT', 'tool-2': 'Midjourney' }
const skillNames = { 'skill-1': 'Prompting', 'skill-2': 'Image Gen' }

describe('CourseTable', () => {
  const defaultProps = {
    courses: mockCourses,
    toolNames,
    skillNames,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
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

    expect(screen.getByText('Beginner')).toBeInTheDocument()
    expect(screen.getByText('Advanced')).toBeInTheDocument()
  })

  it('renders status indicators', () => {
    render(<CourseTable {...defaultProps} />)

    expect(screen.getByText('Published')).toBeInTheDocument()
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('renders question counts', () => {
    render(<CourseTable {...defaultProps} />)

    expect(screen.getByText('5 questions')).toBeInTheDocument()
    expect(screen.getByText('0 questions')).toBeInTheDocument()
  })

  it('shows singular "question" for count of 1', () => {
    const singleQ: CourseCardItem[] = [{ ...mockCourses[0], questionCount: 1 }]
    render(<CourseTable {...defaultProps} courses={singleQ} />)

    expect(screen.getByText('1 question')).toBeInTheDocument()
  })

  it('shows empty state when no courses', () => {
    render(<CourseTable {...defaultProps} courses={[]} />)

    expect(screen.getByText('No courses found')).toBeInTheDocument()
    expect(screen.getByText('Try adjusting your filters or search terms')).toBeInTheDocument()
  })

  it('calls onEdit when clicking card body', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    render(<CourseTable {...defaultProps} onEdit={onEdit} />)

    // Click on the title area (inside the button)
    await user.click(screen.getByText('Intro to ChatGPT'))
    expect(onEdit).toHaveBeenCalledWith(mockCourses[0])
  })

  it('offers restore instead of publish/archive for archived courses (BR-31)', async () => {
    const user = userEvent.setup()
    const onRestore = vi.fn()
    const archived: CourseCardItem[] = [{ ...mockCourses[0], status: 'archived' }]
    render(<CourseTable {...defaultProps} courses={archived} onRestore={onRestore} />)

    expect(screen.getByText('Archived')).toBeInTheDocument()
    expect(screen.queryByTitle('Publish')).not.toBeInTheDocument()
    expect(screen.queryByTitle('Archive')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Restore Intro to ChatGPT' }))
    expect(onRestore).toHaveBeenCalledWith(archived[0])
  })

  it('offers a preview link only for drafts (BR-05)', async () => {
    const user = userEvent.setup()
    const onCopyPreviewLink = vi.fn()
    render(<CourseTable {...defaultProps} onCopyPreviewLink={onCopyPreviewLink} />)

    expect(
      screen.queryByRole('button', { name: 'Copy preview link for Intro to ChatGPT' }),
    ).not.toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Copy preview link for Advanced Prompting' }),
    )
    expect(onCopyPreviewLink).toHaveBeenCalledWith(mockCourses[1])
  })
})
