import { test, expect } from '@playwright/test'

test.describe('Course Discovery', () => {
  test('renders page title', async ({ page }) => {
    await page.goto('/courses')
    await expect(page.getByText('Explore Courses')).toBeVisible()
  })

  test('renders filter sidebar on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/courses')
    await expect(page.getByText('Tools').first()).toBeVisible()
    await expect(page.getByText('Skills').first()).toBeVisible()
    await expect(page.getByText('Difficulty').first()).toBeVisible()
  })

  test('shows login button for unauthenticated users', async ({ page }) => {
    await page.goto('/courses')
    await expect(page.getByRole('button', { name: 'Log In' })).toBeVisible()
  })
})
