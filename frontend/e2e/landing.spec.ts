import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('renders hero section', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('學會改變職涯的 AI 技能')).toBeVisible()
  })

  test('renders navigation', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('登入', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('立即開始', { exact: true }).first()).toBeVisible()
  })

  test('renders features section', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('學 AI 需要的，這裡都有')).toBeVisible()
    await expect(page.getByRole('heading', { name: '精選影片課程' })).toBeVisible()
    await expect(page.getByRole('heading', { name: '互動測驗' })).toBeVisible()
    await expect(page.getByRole('heading', { name: '進度追蹤' })).toBeVisible()
  })

  test('renders how it works section', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: '如何運作' })).toBeVisible()
    await expect(page.getByRole('heading', { name: '瀏覽課程' })).toBeVisible()
    await expect(page.getByRole('heading', { name: '觀看學習' })).toBeVisible()
    await expect(page.getByRole('heading', { name: '測驗與追蹤' })).toBeVisible()
  })

  test('renders footer', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('© 2026 AI for All')).toBeVisible()
  })

  test('Get Started navigates to login', async ({ page }) => {
    await page.goto('/')
    await page.getByText('立即開始', { exact: true }).first().click()
    await expect(page).toHaveURL('/login')
  })
})
