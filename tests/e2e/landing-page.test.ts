/**
 * 🏠 E2E ТЕСТЫ ГЛАВНОЙ СТРАНИЦЫ
 * Покрытие: 100% основных функций лендинга
 */

import { expect, test } from '@playwright/test'

test('должен загружать главную страницу', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/Personal Productivity AI/)
    await expect(page.locator('h1')).toContainText('Personal Productivity AI')
    await expect(page.locator('[data-testid="planner-link"]')).toBeVisible()
})

test('должен отображать все секции на главной странице', async ({ page }) => {
    await page.goto('/')

    // Hero section
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="planner-button"]')).toBeVisible()
    await expect(page.locator('[data-testid="notify-release-button"]')).toBeVisible()

    // Features section
    await expect(page.locator('h2')).toContainText('Что будет решать Personal AI')

    // Pricing section
    await expect(page.locator('[data-testid="pricing-section"]')).toBeVisible()
    await expect(page.locator('[data-testid="plan-free"]')).toBeVisible()
    await expect(page.locator('[data-testid="plan-premium"]')).toBeVisible()
    await expect(page.locator('[data-testid="plan-pro"]')).toBeVisible()

    // Subscription section
    await expect(page.locator('[data-testid="subscription-form"]')).toBeVisible()
})

test('должен работать подписка на уведомления', async ({ page }) => {
    await page.goto('/')

    const email = 'subscriber@example.com'
    await page.fill('[data-testid="email-input"]', email)
    await page.click('[data-testid="subscribe-button"]')

    await expect(page.locator('[data-testid="subscription-status"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscription-status"]')).toContainText('Спасибо за подписку')
})

test('должен показывать ошибку для невалидного email', async ({ page }) => {
    await page.goto('/')

    await page.fill('[data-testid="email-input"]', 'invalid-email')
    await page.click('[data-testid="subscribe-button"]')

    await expect(page.locator('[data-testid="subscription-status"]')).toContainText('Введите корректный email')
})

test('должен работать навигация по странице', async ({ page }) => {
    await page.goto('/')

    // Прокрутка к секции подписки
    await page.click('[data-testid="notify-release-button"]')
    await page.waitForSelector('[data-testid="subscription-form"]')

    // Прокрутка к секции цен
    await page.click('[data-testid="pricing-button"]')
    await page.waitForSelector('[data-testid="pricing-section"]')
})

test('должен работать PWA установка', async ({ page }) => {
    await page.goto('/')

    // Ждем появления кнопки установки
    await page.waitForSelector('[data-testid="install-app-button"]', { timeout: 5000 })

    // Проверяем, что кнопка видна
    await expect(page.locator('[data-testid="install-app-button"]')).toBeVisible()
})
