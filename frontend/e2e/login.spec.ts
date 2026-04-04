import { test, expect } from '@playwright/test'

test.describe('Login Page', () => {
  test('renders login form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Welcome Back')).toBeVisible()
    await expect(page.getByText('Continue with Google')).toBeVisible()
    await expect(page.getByText('Continue with Facebook')).toBeVisible()
    await expect(page.getByText('Continue without signing in')).toBeVisible()
  })

  test('renders dual-color logo', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('AI')).toBeVisible()
    await expect(page.getByText('for All')).toBeVisible()
  })

  test('skip link navigates to courses', async ({ page }) => {
    await page.goto('/login')
    await page.getByText('Continue without signing in').click()
    await expect(page).toHaveURL('/courses')
  })
})
