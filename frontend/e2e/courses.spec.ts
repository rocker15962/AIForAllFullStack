import { test, expect } from '@playwright/test'

test.describe('Course Discovery', () => {
  test('renders page title', async ({ page }) => {
    await page.goto('/courses')
    // The nav link has the same text, so target the page heading
    await expect(page.getByRole('heading', { name: '探索課程', level: 1 })).toBeVisible()
  })

  test('renders filter sidebar on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/courses')
    await expect(page.getByText('工具', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('技能', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('難度', { exact: true }).first()).toBeVisible()
  })

  test('shows login button for unauthenticated users', async ({ page }) => {
    await page.goto('/courses')
    await expect(page.getByRole('button', { name: '登入' })).toBeVisible()
  })
})
