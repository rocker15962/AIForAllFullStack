# UX Flows & Interactive Elements Design Spec

## Overview

Supplement existing AI for All screen designs with missing interactive elements (modals, toasts, banners) and annotate each screen with flow notes describing navigation paths and trigger conditions.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Login method | Dedicated /login page | Cleaner UX than modal overlay |
| Auth gating | None — open platform | Low friction; progress simply not saved for guests |
| Destructive action confirmation | Always modal | Consistent, prevents accidental deletions |
| Course completion feedback | Celebration modal | Creates a rewarding moment with score + badge |

## New Screen

### Login Page (/login)

- 1440x900, centered card layout
- Background: gradient (primary-50 to white)
- Card: 480px wide, white, rounded corners, shadow
- Content (top to bottom):
  - Logo "AI for All" (18px bold, primary-700)
  - Heading "Welcome Back" (28px bold)
  - Subtitle "Sign in to track your progress and earn badges" (14px, neutral-500)
  - Google sign-in button (white bg, black text, Google icon, full-width)
  - Facebook sign-in button (Facebook blue bg, white text, full-width)
  - Divider
  - "Continue without signing in" link (routes to Course Discovery)
- Flow: Landing Page "Get Started" / "Log In" -> this page -> OAuth success -> Course Discovery

## New Modal Components

### 1. Completion Modal (reusable component)

- 480px wide card, semi-transparent black overlay backdrop
- Content:
  - Trophy icon (64px, amber/gold circle background)
  - "Course Completed!" heading (24px bold)
  - Score "4 / 5 correct" (36px bold, primary-600)
  - Score percentage "80% Score" (14px, neutral-500)
  - Badge preview (course thumbnail + "Badge Earned" label)
  - Two buttons side-by-side:
    - "Browse Courses" outline button -> Course Discovery
    - "Next Course" primary button with arrow icon -> next course
- Trigger: user answers final quiz question correctly or incorrectly
- Flow: Course Learning (final question) -> this modal -> Course Discovery OR next Course Learning

### 2. Confirm Dialog (reusable component)

- 420px wide card, semi-transparent overlay
- Content:
  - Warning icon (red circle background, 48px)
  - Title "Delete Course?" (20px bold) — customizable via instance override
  - Description "This action cannot be undone. All associated data will be permanently removed." (14px, neutral-500) — customizable
  - Two buttons:
    - "Cancel" outline button -> closes modal
    - "Delete" red solid button (error color) -> executes action
- Used in: Course Management (delete course), User Management (delete user), Category Management (delete tool/skill), Create/Edit Course (delete question)

### 3. Toast Notification (reusable component, two variants)

- 360px wide, positioned top-right of viewport
- Structure: colored left border + icon + message text + close (X) button
- Success variant: green left border, check-circle icon (success color), green icon
- Error variant: red left border, alert-circle icon (error color), red icon
- Used after: publish/unpublish course, save profile, delete actions, create/edit operations

## New Banner Component

### Guest Banner

- Full-width, placed above video player in Course Learning page
- Background: primary-50, left border: primary-500 (4px)
- Content: info icon + "Sign up to save your progress and earn badges" + "Sign Up" button (small, primary)
- Flow: "Sign Up" button -> Login Page

## Flow Annotations (Notes)

Each existing screen gets a Note placed to its right documenting:

| Screen | From | Trigger | To |
|--------|------|---------|-----|
| Landing Page | Direct URL | "Get Started" / "Log In" | Login Page |
| Landing Page | Direct URL | "Explore Courses" | Course Discovery |
| Login Page | Landing / Guest Banner | OAuth success | Course Discovery |
| Login Page | Landing / Guest Banner | "Continue without signing in" | Course Discovery |
| Course Discovery | Landing / Login / Navbar | Click course card | Course Learning |
| Course Learning | Course Discovery / My Learning | Complete final question | Completion Modal |
| Course Learning (guest) | Course Discovery | Page load (not logged in) | Shows Guest Banner |
| Completion Modal | Course Learning | "Browse Courses" | Course Discovery |
| Completion Modal | Course Learning | "Next Course" | Next Course Learning |
| My Learning | User dropdown | Click course card | Course Learning |
| Profile | User dropdown | "Save" | Toast (success/error) |
| Course Management | Admin nav | "Delete" button | Confirm Dialog |
| Course Management | Admin nav | "Create" / "Edit" | Create/Edit Course |
| User Management | Admin nav | "Delete" button | Confirm Dialog |
| Category Management | Admin nav | "Delete" button | Confirm Dialog |
| Create/Edit Course | Course Management | "Save" | Toast + redirect to Course Management |

## Error & Edge Case Handling

### New Reusable Components for Error States

#### 1. Empty State (reusable component)

- Centered layout: icon (64px, neutral circle bg) + title + description + optional CTA button
- Usage: search/filter no results, no courses in My Learning, no badges, empty admin lists
- Icon and text customizable via instance overrides

#### 2. Error State (reusable component)

- Centered layout: error icon (64px, red circle bg) + "Something went wrong" + description + "Try Again" primary button
- Usage: API load failures on any page (Course Discovery, Admin Dashboard, etc.)

#### 3. FormInput Error State (reusable component)

- Label + input with red border (error color) + red error message below
- Usage: required field validation, invalid YouTube URL, profile form errors

#### 4. Video Unavailable (reusable component)

- 16:9 placeholder (640x360): neutral background + video-off icon + "Video Unavailable" title + description
- Usage: YouTube video removed or restricted in Course Learning page

#### 5. Alert Banner (reusable component)

- Horizontal bar: red background (#fef2f2) + alert icon + message + close button
- Usage: OAuth login failure on Login Page, authorization denied

### Error Handling by Page

| Page | Error Scenario | UI Response |
|------|---------------|-------------|
| **Login Page** | OAuth fails | AlertBanner at top of card |
| | User denies authorization | AlertBanner "Authorization was denied" |
| **Course Discovery** | API load fails | ErrorState with Retry |
| | Search/filter returns nothing | EmptyState "No results found" + Clear Filters |
| **Course Learning** | YouTube video removed | VideoUnavailable placeholder |
| | No quiz questions | "No quiz available" message + mark complete |
| | Quiz submission fails | Error Toast, preserve user answers |
| **My Learning** | No in-progress courses | EmptyState "Start your first course" |
| | No completed courses | EmptyState "Complete a course to see it here" |
| | No badges | EmptyState "Earn badges by completing courses" |
| **Profile** | Avatar upload fails | Error Toast |
| | Save fails | Error Toast, preserve form data |
| | Validation error | FormInput red border + error message |
| **Admin Dashboard** | No data | StatCards show 0, empty chart |
| | Analytics API fails | ErrorState with Retry |
| **Course Management** | No courses | EmptyState "Create your first course" |
| | Delete fails | Error Toast |
| | Search no results | EmptyState |
| **User Management** | Delete fails | Error Toast |
| | Search no results | EmptyState |
| **Category Management** | Delete in-use item | Error Toast "Cannot delete: used by X courses" |
| | Reorder fails | Error Toast, revert order |
| **Create/Edit Course** | Required fields empty | FormInput error state |
| | Invalid YouTube URL | FormInput error + format hint |
| | Save fails | Error Toast, preserve form data |
