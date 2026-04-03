// =============================================================================
// Core Types
// =============================================================================

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'
export type AuthProvider = 'google' | 'facebook'
export type CourseStatus = 'draft' | 'published'
export type ProgressStatus = 'in_progress' | 'completed'
export type QuestionType = 'multiple_choice' | 'short_answer'

// =============================================================================
// User
// =============================================================================

export interface User {
  id: string
  name: string
  email: string
  avatarUrl: string
  provider: AuthProvider
  isAdmin?: boolean
  createdAt: string
  lastActiveAt: string
}

// =============================================================================
// Course
// =============================================================================

export interface Course {
  id: string
  title: string
  description: string
  youtubeUrl: string
  youtubeId: string
  thumbnailUrl: string
  toolId: string
  skillId: string
  creatorId: string
  difficulty: Difficulty
  duration: number // in seconds
  status: CourseStatus
  createdAt: string
  updatedAt: string
  questions?: Question[] // optional for admin views
}

// =============================================================================
// Question
// =============================================================================

export interface QuestionOption {
  id: string
  text: string
}

export interface Question {
  id: string
  courseId: string
  type: QuestionType | 'multiple-choice' | 'short-answer'
  question: string
  options?: (string | QuestionOption)[] // for multiple_choice - can be strings or {id, text} objects
  correctAnswer?: number | string // option id or index
  acceptableKeywords?: string[] // for short_answer validation
  sampleAnswer?: string // for short_answer
  explanation?: string
  order: number
}

// =============================================================================
// Tool & Skill (Categories)
// =============================================================================

export interface Tool {
  id: string
  name: string
  icon: string // lucide icon name
  order: number
}

export interface Skill {
  id: string
  name: string
  icon: string // lucide icon name
  order: number
}

// =============================================================================
// Creator
// =============================================================================

export interface Creator {
  id: string
  name: string
  avatarUrl: string
  channelUrl: string
}

// =============================================================================
// Progress
// =============================================================================

export interface UserAnswer {
  questionId: string
  answer: string
  isCorrect: boolean
}

export interface Progress {
  id: string
  userId: string
  courseId: string
  status: ProgressStatus
  currentQuestion?: number // if in_progress
  score?: number // if completed
  answers: UserAnswer[]
  startedAt: string
  completedAt?: string
  lastAccessedAt: string
}

// =============================================================================
// Derived Types (for UI components)
// =============================================================================

/** Course with resolved references for display */
export interface CourseWithDetails extends Course {
  tool: Tool
  skill: Skill
  creator: Creator
  questionCount: number
  progress: Progress | null
}

/** In-progress course for My Learning */
export interface InProgressCourse {
  id: string
  courseId: string
  courseTitle: string
  courseThumbnail: string
  toolName: string
  skillName: string
  difficulty: Difficulty
  progress: number // percentage 0-100
  currentQuestion: number
  totalQuestions: number
  lastAccessedAt: string
}

/** Completed course for My Learning */
export interface CompletedCourse {
  id: string
  courseId: string
  courseTitle: string
  courseThumbnail: string
  toolName: string
  skillName: string
  difficulty: Difficulty
  score: number
  totalQuestions: number
  completedAt: string
}

/** Badge earned from completing a course */
export interface Badge {
  id: string
  courseId: string
  courseTitle: string
  thumbnailUrl: string
  earnedAt: string
}

/** Recommended course (after completion) */
export interface RecommendedCourse {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  difficulty: Difficulty
  toolName: string
  skillName: string
}

// =============================================================================
// Admin Dashboard Types
// =============================================================================

export interface DashboardStats {
  totalUsers: number
  totalCourses: number
  totalCompletions: number
  activeUsers: number
}

export interface TrendDataPoint {
  date: string
  newUsers: number
  activeUsers: number
}

export interface PopularCourse {
  courseId: string
  title: string
  completions: number
  rating: number
}

/** User with progress for admin view */
export interface UserWithProgress extends User {
  progress: UserProgress[]
}

/** User progress summary for admin view */
export interface UserProgress {
  courseId: string
  status: 'in-progress' | 'completed'
  score?: number
  completedAt?: string
  currentQuestion?: number
  lastAccessedAt?: string
}

// =============================================================================
// Filter State (for Course Discovery)
// =============================================================================

export interface FilterState {
  searchQuery: string
  toolId: string | null
  skillId: string | null
  difficulty: Difficulty | null
}

// =============================================================================
// Quiz State (for Course Learning)
// =============================================================================

export interface QuizState {
  currentQuestionIndex: number
  answers: UserAnswer[]
  isCompleted: boolean
  score: number
}

// =============================================================================
// Component Props Types
// =============================================================================

export interface NavigationItem {
  label: string
  href: string
  isActive?: boolean
}

export interface CourseCardData {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  toolId: string
  skillId: string
  creatorId: string
  difficulty: Difficulty
  duration: number
  questionCount: number
  progress?: {
    status: ProgressStatus
    completedQuestions?: number
  } | null
}
