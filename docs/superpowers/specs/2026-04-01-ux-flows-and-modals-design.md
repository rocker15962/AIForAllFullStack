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
