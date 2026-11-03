import { test, expect } from '@playwright/test'

test.describe('Login Page', () => {
  test('renders login form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('歡迎回來')).toBeVisible()
    await expect(page.getByText('使用 Google 繼續')).toBeVisible()
    await expect(page.getByText('使用 Facebook 繼續')).toBeVisible()
    await expect(page.getByText('先不登入，直接逛逛')).toBeVisible()
  })

  test('renders dual-color logo', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('AI')).toBeVisible()
    await expect(page.getByText('for All')).toBeVisible()
  })

  test('skip link navigates to courses', async ({ page }) => {
    await page.goto('/login')
    await page.getByText('先不登入，直接逛逛').click()
    await expect(page).toHaveURL('/courses')
  })
})
