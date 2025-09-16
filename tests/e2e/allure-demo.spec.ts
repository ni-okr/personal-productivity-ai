import { expect, test } from '@playwright/test'

test.describe('🎯 Демонстрация Allure отчетов', () => {

    test('✅ Успешный тест с детальными шагами', async ({ page }) => {
        // Переходим на главную страницу
        await page.goto('https://playwright.dev')

        // Проверяем заголовок страницы
        const title = await page.title()
        expect(title).toContain('Playwright')

        // Проверяем основные элементы
        await expect(page.locator('h1')).toBeVisible()
        await expect(page.locator('nav')).toBeVisible()
    })

    test('✅ Тест обработки ошибок', async ({ page }) => {
        // Переходим на страницу
        await page.goto('https://playwright.dev')

        // Проверяем корректное содержимое
        await expect(page.locator('h1')).toContainText('Playwright')
    })

    test('⚠️ Тест с предупреждением', async ({ page }) => {
        // Выполняем базовые проверки
        await page.goto('https://playwright.dev')

        await expect(page.locator('h1')).toBeVisible()
    })

    test('📊 Тест с данными и скриншотами', async ({ page }) => {
        // Открываем страницу и делаем скриншот
        await page.goto('https://playwright.dev')

        // Делаем скриншот
        const screenshot = await page.screenshot()

        // Собираем данные о странице
        const title = await page.title()
        const url = page.url()
        const viewport = page.viewportSize()

        const pageInfo = {
            title,
            url,
            viewport,
            timestamp: new Date().toISOString()
        }

        // Проверяем что данные корректны
        expect(title).toBeTruthy()
        expect(url).toContain('playwright.dev')
        expect(viewport).toBeTruthy()
    })
})
