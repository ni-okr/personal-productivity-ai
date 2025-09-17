import { testFramework, testLogger, testMocks, testUtils } from '../framework'

/**
 * 🧪 Мигрирован с помощью единого фреймворка тестирования
 * 
 * Автоматически мигрирован: 2025-09-16T21:33:45.031Z
 * Оригинальный файл сохранен как: tests/e2e/landing-page.spec.ts.backup
 * 
 * ВАЖНО: Все новые тесты должны использовать единый фреймворк!
 * См. документацию: tests/docs/TESTING_FRAMEWORK.md
 */

import { expect, test } from '@playwright/test'

test.describe('Personal Productivity AI - Лендинг страница', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/')
    })

    test.describe('📧 Email подписка', () => {

        test('✅ Успешная первая регистрация', async ({ page }) => {
            // Проверяем что страница загрузилась
            await expect(page).toHaveTitle(/Personal Productivity AI/)

            // Ищем форму подписки
            const emailInput = page.locator('input[type="email"]')
            const subscribeButton = page.locator('button:has-text("Подписаться")')

            // Заполняем email
            await emailInput.fill(`test-${Date.now()}@example.com`)

            // Нажимаем кнопку подписки
            await subscribeButton.click({ force: true })

            // Проверяем что появилось сообщение об успехе
            await expect(page.locator('text=Спасибо за подписку!')).toBeVisible()
        })

        test('❌ Валидация email', async ({ page }) => {
            // Ищем форму подписки
            const emailInput = page.locator('input[type="email"]')
            const subscribeButton = page.locator('button:has-text("Подписаться")')

            // Заполняем некорректный email
            await emailInput.fill('invalid-email')

            // Пытаемся отправить некорректный email
            await subscribeButton.click({ force: true })

            // Проверяем что появилось сообщение об ошибке
            await expect(page.locator('[data-testid="subscription-status"]')).toBeVisible({ timeout: 10000 })
            await expect(page.locator('text=Введите корректный email')).toBeVisible()
        })

        test('❌ Некорректный email', async ({ page }) => {
            // Ищем форму подписки
            const emailInput = page.locator('input[type="email"]')
            const subscribeButton = page.locator('button:has-text("Подписаться")')

            // Заполняем некорректный email
            await emailInput.fill('invalid-email')

            // Нажимаем кнопку подписки
            await subscribeButton.click({ force: true })

            // Проверяем что появилось сообщение об ошибке
            await expect(page.locator('[data-testid="subscription-status"]')).toBeVisible({ timeout: 10000 })
            await expect(page.locator('text=Введите корректный email')).toBeVisible()
        })
    })

    test.describe('📱 PWA установка', () => {

        test('✅ PWA кнопка установки', async ({ page }) => {
            // Проверяем что есть кнопка установки PWA
            const installButton = page.locator('button:has-text("Установить")')
            await expect(installButton).toBeVisible()
        })

        test('✅ PWA манифест', async ({ page }) => {
            // Проверяем что манифест загружается
            const manifestResponse = await page.request.get('/manifest.json')
            expect(manifestResponse.status()).toBe(200)

            const manifest = await manifestResponse.json()
            expect(manifest.name).toBe('Personal Productivity AI')
            expect(manifest.short_name).toBe('PPAI')
        })
    })

    test.describe('🎯 Основные элементы', () => {

        test('✅ Заголовок и описание', async ({ page }) => {
            // Проверяем заголовок
            await expect(page.locator('h1')).toContainText('Personal Productivity AI')

            // Проверяем описание
            await expect(page.locator('text=Умный планировщик задач')).toBeVisible()
        })

        test('✅ Тарифные планы', async ({ page }) => {
            // Проверяем Free план
            const freePlan = page.locator('[data-testid="plan-free"]')
            await expect(freePlan).toContainText('Free')
            await expect(freePlan).toContainText('0 ₽')
            await expect(freePlan).toContainText('50 задач')

            // Проверяем Premium план
            const premiumPlan = page.locator('[data-testid="plan-premium"]')
            await expect(premiumPlan).toContainText('Premium')
            await expect(premiumPlan).toContainText('999 ₽')
            await expect(premiumPlan).toContainText('500 задач')

            // Проверяем Pro план
            const proPlan = page.locator('[data-testid="plan-pro"]')
            await expect(proPlan).toContainText('Pro')
            await expect(proPlan).toContainText('1999 ₽')
            await expect(proPlan).toContainText('Неограниченно')
        })

        test('✅ Навигация', async ({ page }) => {
            // Проверяем что есть ссылки на другие страницы
            await expect(page.locator('[data-testid="planner-link"]')).toBeVisible()
            await expect(page.locator('[data-testid="roadmap-link"]')).toBeVisible()
        })
    })
})