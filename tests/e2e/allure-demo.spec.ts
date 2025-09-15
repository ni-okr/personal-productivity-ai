import { expect, test } from '@playwright/test'
import { allure } from 'allure-playwright'

test.describe('🎯 Демонстрация Allure отчетов', () => {

    test('✅ Успешный тест с детальными шагами', async ({ page }) => {
        await allure.epic('Демонстрация')
        await allure.feature('Allure отчеты')
        await allure.story('Базовая функциональность')
        await allure.severity('critical')
        await allure.description('Демонстрирует возможности Allure отчетов с детальными шагами')
        await allure.tag('demo')

        await allure.step('Переходим на главную страницу', async () => {
            await page.goto('https://playwright.dev')
            await allure.attachment('URL', 'https://playwright.dev', 'text/plain')
        })

        await allure.step('Проверяем заголовок страницы', async () => {
            const title = await page.title()
            await allure.attachment('Page Title', title, 'text/plain')
            expect(title).toContain('Playwright')
        })

        await allure.step('Проверяем основные элементы', async () => {
            await expect(page.locator('h1')).toBeVisible()
            await expect(page.locator('nav')).toBeVisible()
        })
    })

    test('✅ Тест обработки ошибок', async ({ page }) => {
        await allure.epic('Демонстрация')
        await allure.feature('Обработка ошибок')
        await allure.story('Проверка устойчивости')
        await allure.severity('normal')
        await allure.description('Демонстрирует корректную обработку различных сценариев')
        await allure.tag('resilience')

        await allure.step('Переходим на страницу', async () => {
            await page.goto('https://playwright.dev')
        })

        await allure.step('Проверяем корректное содержимое', async () => {
            // Проверяем что страница загрузилась корректно
            await expect(page.locator('h1')).toContainText('Playwright')
        })
    })

    test('⚠️ Тест с предупреждением', async ({ page }) => {
        await allure.epic('Демонстрация')
        await allure.feature('Различные статусы')
        await allure.story('Тест с предупреждениями')
        await allure.severity('normal')
        await allure.description('Демонстрирует тест с предупреждениями')
        await allure.tag('warning')

        await allure.step('Выполняем базовые проверки', async () => {
            await page.goto('https://playwright.dev')

            // Добавляем предупреждение
            await allure.attachment('Warning', 'Это демонстрационное предупреждение', 'text/plain')

            await expect(page.locator('h1')).toBeVisible()
        })
    })

    test('📊 Тест с данными и скриншотами', async ({ page }) => {
        await allure.epic('Демонстрация')
        await allure.feature('Вложения')
        await allure.story('Скриншоты и данные')
        await allure.severity('normal')
        await allure.description('Демонстрирует работу с вложениями в Allure')
        await allure.tag('attachments')

        await allure.step('Открываем страницу и делаем скриншот', async () => {
            await page.goto('https://playwright.dev')

            // Делаем скриншот
            const screenshot = await page.screenshot()
            await allure.attachment('Скриншот страницы', screenshot, 'image/png')
        })

        await allure.step('Собираем данные о странице', async () => {
            const title = await page.title()
            const url = page.url()
            const viewport = page.viewportSize()

            const pageInfo = {
                title,
                url,
                viewport,
                timestamp: new Date().toISOString()
            }

            await allure.attachment('Информация о странице', JSON.stringify(pageInfo, null, 2), 'application/json')
        })
    })
})
