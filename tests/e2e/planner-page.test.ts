/**
 * 🧠 E2E ТЕСТЫ ПЛАНИРОВЩИКА
 * Покрытие: 100% основных функций планировщика
 */

import { expect, test } from '@playwright/test'

// Test data
const TEST_USER = {
    email: 'test@example.com',
    password: 'SecurePass123!',
    name: 'Test User'
}

const TEST_TASK = {
    title: 'E2E Test Task',
    description: 'This is a test task for E2E testing',
    priority: 'high',
    estimatedMinutes: 60
}

// Helper functions
async function loginUser(page: any) {
    await page.goto('/planner')
    await page.click('[data-testid="login-button"]')
    await page.fill('input[type="email"]', TEST_USER.email)
    await page.fill('input[type="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')
    await page.waitForSelector('[data-testid="planner-content"]')
}

async function createTask(page: any, taskData: typeof TEST_TASK) {
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', taskData.title)
    await page.fill('textarea', taskData.description)
    await page.selectOption('select', taskData.priority)
    await page.fill('input[type="number"]', taskData.estimatedMinutes.toString())
    await page.click('[data-testid="save-task-button"]')
    await page.waitForSelector('.task-card')
}

async function completeTask(page: any, taskTitle: string) {
    const taskCard = page.locator('.task-card').filter({ hasText: taskTitle })
    await taskCard.locator('button[aria-label*="Toggle task"]').click()
    await page.waitForSelector('.task-card.completed')
}

test('должен показывать форму входа для неавторизованного пользователя', async ({ page }) => {
    await page.goto('/planner')

    await expect(page.locator('h1')).toContainText('ИИ-Планировщик')
    await expect(page.locator('button')).toContainText('Войти в систему')
})

test('должен работать полный цикл создания и управления задачами', async ({ page }) => {
    // Мокаем авторизацию
    await page.goto('/planner')

    // Симулируем успешный вход
    await page.evaluate(() => {
        localStorage.setItem('auth-token', 'mock-token')
        localStorage.setItem('user', JSON.stringify({
            id: 'user-1',
            email: 'test@example.com',
            name: 'Test User',
            subscription: 'free'
        }))
    })

    await page.reload()

    // Проверяем, что планировщик загрузился
    await expect(page.locator('[data-testid="planner-content"]')).toBeVisible()

    // Создаем задачу
    await createTask(page, TEST_TASK)

    // Проверяем, что задача появилась
    await expect(page.locator('.task-card')).toContainText(TEST_TASK.title)

    // Завершаем задачу
    await completeTask(page, TEST_TASK.title)

    // Проверяем, что задача переместилась в секцию "Выполнено сегодня"
    await expect(page.locator('.task-card.completed')).toContainText(TEST_TASK.title)
})

test('должен работать валидация формы создания задачи', async ({ page }) => {
    await page.goto('/planner')

    // Мокаем авторизацию
    await page.evaluate(() => {
        localStorage.setItem('auth-token', 'mock-token')
        localStorage.setItem('user', JSON.stringify({
            id: 'user-1',
            email: 'test@example.com',
            name: 'Test User',
            subscription: 'free'
        }))
    })

    await page.reload()
    await page.waitForSelector('[data-testid="planner-content"]')

    // Открываем форму создания задачи
    await page.click('[data-testid="add-task-button"]')

    // Пытаемся сохранить пустую форму
    await page.click('[data-testid="save-task-button"]')

    // Проверяем, что появились ошибки валидации
    await expect(page.locator('.error-message')).toContainText('Название задачи обязательно')
})

test('должен работать фильтрация задач по статусу', async ({ page }) => {
    await page.goto('/planner')

    // Мокаем авторизацию
    await page.evaluate(() => {
        localStorage.setItem('auth-token', 'mock-token')
        localStorage.setItem('user', JSON.stringify({
            id: 'user-1',
            email: 'test@example.com',
            name: 'Test User',
            subscription: 'free'
        }))
    })

    await page.reload()
    await page.waitForSelector('[data-testid="planner-content"]')

    // Создаем несколько задач
    await createTask(page, { ...TEST_TASK, title: 'Task 1' })
    await createTask(page, { ...TEST_TASK, title: 'Task 2' })

    // Завершаем одну задачу
    await completeTask(page, 'Task 1')

    // Проверяем, что задачи распределились по секциям
    await expect(page.locator('[data-testid="urgent-tasks"] .task-card')).toHaveCount(1)
    await expect(page.locator('[data-testid="completed-tasks"] .task-card')).toHaveCount(1)
})

test('должен работать ИИ анализ продуктивности', async ({ page }) => {
    await page.goto('/planner')

    // Мокаем авторизацию
    await page.evaluate(() => {
        localStorage.setItem('auth-token', 'mock-token')
        localStorage.setItem('user', JSON.stringify({
            id: 'user-1',
            email: 'test@example.com',
            name: 'Test User',
            subscription: 'free'
        }))
    })

    await page.reload()
    await page.waitForSelector('[data-testid="planner-content"]')

    // Создаем и завершаем несколько задач
    await createTask(page, { ...TEST_TASK, title: 'Task 1', priority: 'urgent' })
    await createTask(page, { ...TEST_TASK, title: 'Task 2', priority: 'high' })

    await completeTask(page, 'Task 1')
    await completeTask(page, 'Task 2')

    // Проверяем, что ИИ анализ появился
    await expect(page.locator('[data-testid="ai-analysis"]')).toBeVisible()
    await expect(page.locator('[data-testid="productivity-score"]')).toBeVisible()
    await expect(page.locator('[data-testid="ai-insights"]')).toBeVisible()
    await expect(page.locator('[data-testid="ai-recommendations"]')).toBeVisible()
})

test('должен работать умная сортировка задач', async ({ page }) => {
    await page.goto('/planner')

    // Мокаем авторизацию
    await page.evaluate(() => {
        localStorage.setItem('auth-token', 'mock-token')
        localStorage.setItem('user', JSON.stringify({
            id: 'user-1',
            email: 'test@example.com',
            name: 'Test User',
            subscription: 'free'
        }))
    })

    await page.reload()
    await page.waitForSelector('[data-testid="planner-content"]')

    // Создаем задачи с разными приоритетами
    await createTask(page, { ...TEST_TASK, title: 'Low Priority Task', priority: 'low' })
    await createTask(page, { ...TEST_TASK, title: 'High Priority Task', priority: 'high' })
    await createTask(page, { ...TEST_TASK, title: 'Urgent Task', priority: 'urgent' })

    // Включаем умную сортировку
    await page.check('input[type="checkbox"]')

    // Проверяем, что задачи отсортированы по приоритету
    const taskCards = page.locator('[data-testid="urgent-tasks"] .task-card')
    await expect(taskCards.nth(0)).toContainText('Urgent Task')
    await expect(taskCards.nth(1)).toContainText('High Priority Task')
})
