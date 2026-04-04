import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('renders hero section', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Learn AI Skills That Transform Your Career')).toBeVisible()
  })

  test('renders navigation', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Log In', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('Get Started', { exact: true }).first()).toBeVisible()
  })

  test('renders features section', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Everything You Need to Learn AI')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Curated Video Courses' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Interactive Quizzes' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Progress Tracking' })).toBeVisible()
  })

  test('renders how it works section', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'How It Works' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Browse Courses' })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Watch.*Learn/ })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Test.*Track/ })).toBeVisible()
  })

  test('renders footer', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('© 2026 AI for All')).toBeVisible()
  })

  test('Get Started navigates to login', async ({ page }) => {
    await page.goto('/')
    await page.getByText('Get Started', { exact: true }).first().click()
    await expect(page).toHaveURL('/login')
  })
})
