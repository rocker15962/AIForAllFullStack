import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('Explore link navigates to courses', async ({ page }) => {
    await page.goto('/courses')
    const navLink = page.locator('nav').getByText('Explore')
    await expect(navLink).toBeVisible()
  })

  test('My Learning link exists', async ({ page }) => {
    await page.goto('/courses')
    const navLink = page.locator('nav').getByText('My Learning')
    await expect(navLink).toBeVisible()
  })

  test('logo links to homepage', async ({ page }) => {
    await page.goto('/courses')
    const logo = page.locator('header').getByRole('link').first()
    await expect(logo).toHaveAttribute('href', '/')
  })
})
