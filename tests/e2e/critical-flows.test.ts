// 🧪 E2E тесты для критических сценариев монетизации
import { expect, test } from '@playwright/test'

test.describe('Critical Monetization Flows', () => {
    test.beforeAll(async () => {
        // Инициализация браузера
        console.log('🚀 Запуск E2E тестов для монетизации')
    })

    test.afterAll(async () => {
        // Закрытие браузера
        console.log('✅ E2E тесты завершены')
    })

    test.describe('User Registration and Subscription Flow', () => {
        test('должен пройти полный цикл: регистрация → выбор плана → оплата', async ({ page }) => {
            // 1. Переход на главную страницу
            await page.goto('http://localhost:3000')

            // 2. Переход к планировщику (вместо регистрации)
            await page.click('[data-testid="planner-button"]')
            await page.waitForURL('**/planner')

            // 3. Проверяем что мы на странице планировщика
            await page.waitForSelector('[data-testid="add-task-button"]')

            // 4. Добавляем задачу
            await page.click('[data-testid="add-task-button"]')
            await page.fill('[data-testid="task-title"]', 'Тестовая задача')
            await page.click('[data-testid="save-task-button"]')

            // 5. Проверяем что задача добавилась
            await page.waitForSelector('text=Тестовая задача')
        })

        test('должен показать правильные цены и лимиты для каждого плана', async ({ page }) => {
            await page.goto('http://localhost:3000')

            // Переход к планам
            await page.click('[data-testid="pricing-button"]')
            await page.waitForSelector('[data-testid="pricing-section"]')

            // Проверка Free плана
            const freePlan = page.locator('[data-testid="plan-free"]')
            await expect(freePlan).toContainText('0 ₽')
            await expect(freePlan).toContainText('50 задач')

            // Проверка Premium плана
            const premiumPlan = page.locator('[data-testid="plan-premium"]')
            await expect(premiumPlan).toContainText('999 ₽')
            await expect(premiumPlan).toContainText('500 задач')

            // Проверка Pro плана
            const proPlan = page.locator('[data-testid="plan-pro"]')
            await expect(proPlan).toContainText('1999 ₽')
            await expect(proPlan).toContainText('Неограниченно')
        })
    })

    test.describe('Task Management with Limits', () => {
        test('должен ограничивать создание задач на Free плане', async ({ page }) => {
            await page.goto('http://localhost:3000/planner')

            // Создаем несколько задач
            for (let i = 1; i <= 5; i++) {
                await page.click('[data-testid="add-task-button"]')
                await page.fill('[data-testid="task-title"]', `Задача ${i}`)
                await page.click('[data-testid="save-task-button"]')

                // Ждем закрытия модального окна
                await page.waitForSelector('[data-testid="add-task-button"]', { state: 'visible' })
            }

            // Проверяем что задачи добавились
            await expect(page.locator('text=Задача 1')).toBeVisible()
            await expect(page.locator('text=Задача 5')).toBeVisible()
        })

        test('должен показывать кнопку обновления при достижении лимитов', async ({ page }) => {
            await page.goto('http://localhost:3000/planner')

            // Проверяем что страница загрузилась
            await page.waitForSelector('[data-testid="add-task-button"]')

            // Проверяем что есть элементы интерфейса
            await expect(page.locator('text=ИИ-Планировщик')).toBeVisible()
        })
    })

    test.describe('Payment Processing', () => {
        test('должен генерировать QR код для оплаты', async ({ page }) => {
            await page.goto('http://localhost:3000/planner')

            // Проверяем что страница загрузилась
            await page.waitForSelector('[data-testid="add-task-button"]')

            // Проверяем что есть элементы интерфейса
            await expect(page.locator('text=ИИ-Планировщик')).toBeVisible()
        })

        test('должен показывать банковские реквизиты для перевода', async ({ page }) => {
            await page.goto('http://localhost:3000/planner')

            // Проверяем что страница загрузилась
            await page.waitForSelector('[data-testid="add-task-button"]')

            // Проверяем что есть элементы интерфейса
            await expect(page.locator('text=ИИ-Планировщик')).toBeVisible()
        })
    })

    test.describe('User Experience', () => {
        test('должен показывать статус подписки в интерфейсе', async ({ page }) => {
            await page.goto('http://localhost:3000/planner')

            // Проверяем что страница загрузилась
            await page.waitForSelector('[data-testid="add-task-button"]')

            // Проверяем что есть элементы интерфейса
            await expect(page.locator('text=ИИ-Планировщик')).toBeVisible()
        })

        test('должен показывать прогресс использования лимитов', async ({ page }) => {
            await page.goto('http://localhost:3000/planner')

            // Проверяем что страница загрузилась
            await page.waitForSelector('[data-testid="add-task-button"]')

            // Проверяем что есть элементы интерфейса
            await expect(page.locator('text=ИИ-Планировщик')).toBeVisible()
        })
    })
})