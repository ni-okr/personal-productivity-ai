/**
 * 👤 ТЕСТЫ ПОЛЬЗОВАТЕЛЬСКИХ СЦЕНАРИЕВ
 * Покрытие: реальные пользовательские сценарии, user journeys, workflows
 */

import { test, expect, Page } from '@playwright/test'

describe('🚀 New User Onboarding Scenarios', () => {
  test('должен проходить полный сценарий регистрации нового пользователя', async ({ page }) => {
    await page.goto('/')
    
    // Шаг 1: Пользователь видит главную страницу
    await expect(page.locator('h1')).toContainText('Personal AI')
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
    
    // Шаг 2: Пользователь подписывается на рассылку
    await page.fill('[data-testid="email-input"]', 'newuser@example.com')
    await page.click('[data-testid="subscribe-button"]')
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    
    // Шаг 3: Пользователь переходит к регистрации
    await page.click('[data-testid="sign-up-link"]')
    await expect(page.locator('[data-testid="signup-form"]')).toBeVisible()
    
    // Шаг 4: Пользователь заполняет форму регистрации
    await page.fill('[data-testid="signup-email"]', 'newuser@example.com')
    await page.fill('[data-testid="signup-password"]', 'SecurePassword123!')
    await page.fill('[data-testid="signup-name"]', 'New User')
    await page.click('[data-testid="signup-button"]')
    
    // Шаг 5: Пользователь подтверждает email
    await expect(page.locator('[data-testid="email-confirmation"]')).toBeVisible()
    
    // Шаг 6: Пользователь входит в систему
    await page.fill('[data-testid="login-email"]', 'newuser@example.com')
    await page.fill('[data-testid="login-password"]', 'SecurePassword123!')
    await page.click('[data-testid="login-button"]')
    
    // Шаг 7: Пользователь попадает в планировщик
    await expect(page.locator('[data-testid="planner-content"]')).toBeVisible()
    await expect(page.locator('[data-testid="welcome-message"]')).toContainText('Welcome, New User!')
  })

  test('должен проходить сценарий первого использования планировщика', async ({ page }) => {
    await page.goto('/planner')
    
    // Мокаем авторизацию нового пользователя
    await page.evaluate(() => {
      localStorage.setItem('auth-token', 'mock-token')
      localStorage.setItem('user', JSON.stringify({
        id: 'new-user-1',
        email: 'newuser@example.com',
        name: 'New User',
        subscription: 'free'
      }))
    })
    
    await page.reload()
    await page.waitForSelector('[data-testid="planner-content"]')
    
    // Шаг 1: Пользователь видит пустой планировщик
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible()
    await expect(page.locator('[data-testid="empty-state"]')).toContainText('No tasks yet')
    
    // Шаг 2: Пользователь создает первую задачу
    await page.click('[data-testid="add-task-button"]')
    await expect(page.locator('[data-testid="task-form"]')).toBeVisible()
    
    await page.fill('[data-testid="task-title"]', 'My First Task')
    await page.fill('[data-testid="task-description"]', 'This is my first task in the planner')
    await page.selectOption('[data-testid="task-priority"]', 'high')
    await page.selectOption('[data-testid="task-category"]', 'work')
    await page.fill('[data-testid="task-due-date"]', '2024-12-31')
    await page.click('[data-testid="save-task-button"]')
    
    // Шаг 3: Пользователь видит созданную задачу
    await expect(page.locator('.task-card')).toContainText('My First Task')
    await expect(page.locator('.task-card')).toContainText('This is my first task in the planner')
    
    // Шаг 4: Пользователь создает еще несколько задач
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Second Task')
    await page.selectOption('[data-testid="task-priority"]', 'medium')
    await page.selectOption('[data-testid="task-category"]', 'personal')
    await page.click('[data-testid="save-task-button"]')
    
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Third Task')
    await page.selectOption('[data-testid="task-priority"]', 'low')
    await page.selectOption('[data-testid="task-category"]', 'health')
    await page.click('[data-testid="save-task-button"]')
    
    // Шаг 5: Пользователь видит список задач
    const taskCards = page.locator('.task-card')
    await expect(taskCards).toHaveCount(3)
    
    // Шаг 6: Пользователь завершает задачу
    await taskCards.first().locator('[data-testid="complete-task-button"]').click()
    await expect(taskCards.first().locator('[data-testid="task-completed"]')).toBeChecked()
    
    // Шаг 7: Пользователь видит прогресс
    await expect(page.locator('[data-testid="progress-indicator"]')).toBeVisible()
    await expect(page.locator('[data-testid="completed-count"]')).toContainText('1')
    await expect(page.locator('[data-testid="pending-count"]')).toContainText('2')
  })

  test('должен проходить сценарий изучения ИИ функций', async ({ page }) => {
    await page.goto('/planner')
    
    // Мокаем авторизацию
    await page.evaluate(() => {
      localStorage.setItem('auth-token', 'mock-token')
      localStorage.setItem('user', JSON.stringify({
        id: 'user-1',
        email: 'user@example.com',
        name: 'Test User',
        subscription: 'free'
      }))
    })
    
    await page.reload()
    await page.waitForSelector('[data-testid="planner-content"]')
    
    // Шаг 1: Пользователь видит ИИ функции
    await expect(page.locator('[data-testid="ai-features"]')).toBeVisible()
    await expect(page.locator('[data-testid="smart-sort-button"]')).toBeVisible()
    await expect(page.locator('[data-testid="ai-suggestions"]')).toBeVisible()
    
    // Шаг 2: Пользователь создает несколько задач для тестирования ИИ
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Important Work Task')
    await page.selectOption('[data-testid="task-priority"]', 'high')
    await page.selectOption('[data-testid="task-category"]', 'work')
    await page.fill('[data-testid="task-due-date"]', '2024-12-25')
    await page.click('[data-testid="save-task-button"]')
    
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Personal Task')
    await page.selectOption('[data-testid="task-priority"]', 'medium')
    await page.selectOption('[data-testid="task-category"]', 'personal')
    await page.fill('[data-testid="task-due-date"]', '2024-12-30')
    await page.click('[data-testid="save-task-button"]')
    
    // Шаг 3: Пользователь использует умную сортировку
    await page.click('[data-testid="smart-sort-button"]')
    await expect(page.locator('[data-testid="sorting-indicator"]')).toBeVisible()
    
    // Проверяем, что задачи отсортированы по приоритету
    const taskCards = page.locator('.task-card')
    const firstTask = taskCards.first()
    const secondTask = taskCards.nth(1)
    
    await expect(firstTask).toContainText('Important Work Task')
    await expect(secondTask).toContainText('Personal Task')
    
    // Шаг 4: Пользователь запрашивает ИИ предложения
    await page.click('[data-testid="generate-suggestions-button"]')
    await expect(page.locator('[data-testid="suggestions-loading"]')).toBeVisible()
    
    // Ждем загрузки предложений
    await page.waitForSelector('[data-testid="ai-suggestions"]')
    await expect(page.locator('.suggestion-card')).toHaveCount.greaterThan(0)
    
    // Шаг 5: Пользователь применяет предложение
    const firstSuggestion = page.locator('.suggestion-card').first()
    await firstSuggestion.locator('[data-testid="apply-suggestion-button"]').click()
    
    await expect(page.locator('[data-testid="suggestion-applied"]')).toBeVisible()
    
    // Шаг 6: Пользователь запускает анализ продуктивности
    await page.click('[data-testid="analyze-productivity-button"]')
    await expect(page.locator('[data-testid="productivity-analysis"]')).toBeVisible()
    
    const productivityScore = page.locator('[data-testid="productivity-score"]')
    await expect(productivityScore).toBeVisible()
    
    const insights = page.locator('[data-testid="productivity-insights"]')
    await expect(insights).toBeVisible()
  })
})

describe('💼 Daily Workflow Scenarios', () => {
  test('должен проходить сценарий ежедневного планирования', async ({ page }) => {
    await page.goto('/planner')
    
    // Мокаем авторизацию
    await page.evaluate(() => {
      localStorage.setItem('auth-token', 'mock-token')
      localStorage.setItem('user', JSON.stringify({
        id: 'user-1',
        email: 'user@example.com',
        name: 'Test User',
        subscription: 'free'
      }))
    })
    
    await page.reload()
    await page.waitForSelector('[data-testid="planner-content"]')
    
    // Шаг 1: Пользователь начинает день с просмотра задач
    await expect(page.locator('[data-testid="daily-overview"]')).toBeVisible()
    await expect(page.locator('[data-testid="today-tasks"]')).toBeVisible()
    
    // Шаг 2: Пользователь создает план на день
    await page.click('[data-testid="create-daily-plan-button"]')
    await expect(page.locator('[data-testid="daily-plan-modal"]')).toBeVisible()
    
    // Шаг 3: Пользователь добавляет задачи в план
    await page.fill('[data-testid="plan-task-1"]', 'Morning standup')
    await page.fill('[data-testid="plan-time-1"]', '09:00')
    await page.fill('[data-testid="plan-duration-1"]', '30')
    
    await page.fill('[data-testid="plan-task-2"]', 'Code review')
    await page.fill('[data-testid="plan-time-2"]', '10:00')
    await page.fill('[data-testid="plan-duration-2"]', '60')
    
    await page.fill('[data-testid="plan-task-3"]', 'Lunch break')
    await page.fill('[data-testid="plan-time-3"]', '12:00')
    await page.fill('[data-testid="plan-duration-3"]', '60')
    
    await page.click('[data-testid="save-daily-plan-button"]')
    
    // Шаг 4: Пользователь видит созданный план
    await expect(page.locator('[data-testid="daily-schedule"]')).toBeVisible()
    await expect(page.locator('[data-testid="schedule-item"]')).toHaveCount(3)
    
    // Шаг 5: Пользователь начинает выполнение задач
    await page.locator('[data-testid="schedule-item"]').first().click()
    await page.click('[data-testid="start-task-button"]')
    
    await expect(page.locator('[data-testid="task-timer"]')).toBeVisible()
    await expect(page.locator('[data-testid="task-status"]')).toContainText('In Progress')
    
    // Шаг 6: Пользователь завершает задачу
    await page.click('[data-testid="complete-task-button"]')
    await expect(page.locator('[data-testid="task-status"]')).toContainText('Completed')
    
    // Шаг 7: Пользователь переходит к следующей задаче
    await page.locator('[data-testid="schedule-item"]').nth(1).click()
    await page.click('[data-testid="start-task-button"]')
    
    await expect(page.locator('[data-testid="task-timer"]')).toBeVisible()
    await expect(page.locator('[data-testid="task-status"]')).toContainText('In Progress')
  })

  test('должен проходить сценарий управления приоритетами', async ({ page }) => {
    await page.goto('/planner')
    
    // Мокаем авторизацию
    await page.evaluate(() => {
      localStorage.setItem('auth-token', 'mock-token')
      localStorage.setItem('user', JSON.stringify({
        id: 'user-1',
        email: 'user@example.com',
        name: 'Test User',
        subscription: 'free'
      }))
    })
    
    await page.reload()
    await page.waitForSelector('[data-testid="planner-content"]')
    
    // Шаг 1: Пользователь создает задачи с разными приоритетами
    const tasks = [
      { title: 'Urgent Bug Fix', priority: 'high', category: 'work' },
      { title: 'Team Meeting', priority: 'medium', category: 'work' },
      { title: 'Grocery Shopping', priority: 'low', category: 'personal' },
      { title: 'Code Review', priority: 'high', category: 'work' },
      { title: 'Exercise', priority: 'medium', category: 'health' }
    ]
    
    for (const task of tasks) {
      await page.click('[data-testid="add-task-button"]')
      await page.fill('[data-testid="task-title"]', task.title)
      await page.selectOption('[data-testid="task-priority"]', task.priority)
      await page.selectOption('[data-testid="task-category"]', task.category)
      await page.click('[data-testid="save-task-button"]')
    }
    
    // Шаг 2: Пользователь видит задачи, отсортированные по приоритету
    const taskCards = page.locator('.task-card')
    await expect(taskCards).toHaveCount(5)
    
    // Проверяем порядок задач (высокий приоритет должен быть первым)
    await expect(taskCards.first()).toContainText('Urgent Bug Fix')
    await expect(taskCards.nth(1)).toContainText('Code Review')
    
    // Шаг 3: Пользователь фильтрует задачи по приоритету
    await page.selectOption('[data-testid="priority-filter"]', 'high')
    
    const highPriorityTasks = page.locator('.task-card')
    await expect(highPriorityTasks).toHaveCount(2)
    await expect(highPriorityTasks.first()).toContainText('Urgent Bug Fix')
    await expect(highPriorityTasks.nth(1)).toContainText('Code Review')
    
    // Шаг 4: Пользователь изменяет приоритет задачи
    await page.selectOption('[data-testid="priority-filter"]', 'all')
    
    const mediumPriorityTask = taskCards.nth(2)
    await mediumPriorityTask.click()
    await page.selectOption('[data-testid="task-priority"]', 'high')
    await page.click('[data-testid="save-task-button"]')
    
    // Шаг 5: Пользователь видит обновленный порядок
    await page.click('[data-testid="smart-sort-button"]')
    
    const updatedTaskCards = page.locator('.task-card')
    await expect(updatedTaskCards.first()).toContainText('Urgent Bug Fix')
    await expect(updatedTaskCards.nth(1)).toContainText('Code Review')
    await expect(updatedTaskCards.nth(2)).toContainText('Team Meeting')
  })

  test('должен проходить сценарий работы с категориями', async ({ page }) => {
    await page.goto('/planner')
    
    // Мокаем авторизацию
    await page.evaluate(() => {
      localStorage.setItem('auth-token', 'mock-token')
      localStorage.setItem('user', JSON.stringify({
        id: 'user-1',
        email: 'user@example.com',
        name: 'Test User',
        subscription: 'free'
      }))
    })
    
    await page.reload()
    await page.waitForSelector('[data-testid="planner-content"]')
    
    // Шаг 1: Пользователь создает задачи в разных категориях
    const tasksByCategory = {
      work: [
        { title: 'Project Planning', priority: 'high' },
        { title: 'Code Review', priority: 'medium' },
        { title: 'Documentation', priority: 'low' }
      ],
      personal: [
        { title: 'Grocery Shopping', priority: 'medium' },
        { title: 'Call Family', priority: 'low' }
      ],
      health: [
        { title: 'Morning Workout', priority: 'high' },
        { title: 'Doctor Appointment', priority: 'medium' }
      ],
      education: [
        { title: 'Read Technical Book', priority: 'low' },
        { title: 'Online Course', priority: 'medium' }
      ]
    }
    
    for (const [category, tasks] of Object.entries(tasksByCategory)) {
      for (const task of tasks) {
        await page.click('[data-testid="add-task-button"]')
        await page.fill('[data-testid="task-title"]', task.title)
        await page.selectOption('[data-testid="task-priority"]', task.priority)
        await page.selectOption('[data-testid="task-category"]', category)
        await page.click('[data-testid="save-task-button"]')
      }
    }
    
    // Шаг 2: Пользователь фильтрует задачи по категориям
    for (const category of Object.keys(tasksByCategory)) {
      await page.selectOption('[data-testid="category-filter"]', category)
      
      const categoryTasks = page.locator('.task-card')
      await expect(categoryTasks).toHaveCount(tasksByCategory[category].length)
      
      for (const task of tasksByCategory[category]) {
        await expect(categoryTasks).toContainText(task.title)
      }
    }
    
    // Шаг 3: Пользователь сбрасывает фильтр
    await page.selectOption('[data-testid="category-filter"]', 'all')
    
    const allTasks = page.locator('.task-card')
    await expect(allTasks).toHaveCount(10)
    
    // Шаг 4: Пользователь группирует задачи по категориям
    await page.click('[data-testid="group-by-category-button"]')
    
    const categoryGroups = page.locator('[data-testid="category-group"]')
    await expect(categoryGroups).toHaveCount(4)
    
    // Проверяем, что каждая группа содержит правильные задачи
    for (const category of Object.keys(tasksByCategory)) {
      const categoryGroup = page.locator(`[data-testid="category-group-${category}"]`)
      await expect(categoryGroup).toBeVisible()
      
      const groupTasks = categoryGroup.locator('.task-card')
      await expect(groupTasks).toHaveCount(tasksByCategory[category].length)
    }
  })
})

describe('🔄 Advanced User Scenarios', () => {
  test('должен проходить сценарий работы с подписками', async ({ page }) => {
    await page.goto('/')
    
    // Шаг 1: Пользователь видит тарифные планы
    await expect(page.locator('[data-testid="pricing-section"]')).toBeVisible()
    
    const planCards = page.locator('[data-testid="plan-card"]')
    await expect(planCards).toHaveCount(4) // free, premium, pro, enterprise
    
    // Шаг 2: Пользователь выбирает премиум план
    const premiumPlan = page.locator('[data-testid="plan-premium"]')
    await expect(premiumPlan).toBeVisible()
    await expect(premiumPlan).toContainText('Premium')
    await expect(premiumPlan).toContainText('$9.99')
    
    await premiumPlan.locator('[data-testid="select-plan-button"]').click()
    
    // Шаг 3: Пользователь заполняет форму оплаты
    await expect(page.locator('[data-testid="payment-form"]')).toBeVisible()
    
    await page.fill('[data-testid="card-number"]', '4242424242424242')
    await page.fill('[data-testid="card-expiry"]', '12/25')
    await page.fill('[data-testid="card-cvc"]', '123')
    await page.fill('[data-testid="card-name"]', 'Test User')
    
    await page.click('[data-testid="subscribe-button"]')
    
    // Шаг 4: Пользователь видит подтверждение подписки
    await expect(page.locator('[data-testid="subscription-success"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscription-success"]')).toContainText('Welcome to Premium!')
    
    // Шаг 5: Пользователь переходит в планировщик с премиум функциями
    await page.click('[data-testid="go-to-planner-button"]')
    await page.waitForSelector('[data-testid="planner-content"]')
    
    // Проверяем, что премиум функции доступны
    await expect(page.locator('[data-testid="premium-features"]')).toBeVisible()
    await expect(page.locator('[data-testid="advanced-ai"]')).toBeVisible()
    await expect(page.locator('[data-testid="unlimited-tasks"]')).toBeVisible()
    
    // Шаг 6: Пользователь использует премиум функции
    await page.click('[data-testid="advanced-ai-button"]')
    await expect(page.locator('[data-testid="ai-models-selection"]')).toBeVisible()
    
    const aiModels = page.locator('[data-testid="ai-model-option"]')
    await expect(aiModels).toHaveCount.greaterThan(1)
    
    // Шаг 7: Пользователь управляет подпиской
    await page.click('[data-testid="subscription-settings-button"]')
    await expect(page.locator('[data-testid="subscription-management"]')).toBeVisible()
    
    await expect(page.locator('[data-testid="current-plan"]')).toContainText('Premium')
    await expect(page.locator('[data-testid="next-billing-date"]')).toBeVisible()
    await expect(page.locator('[data-testid="billing-amount"]')).toContainText('$9.99')
  })

  test('должен проходить сценарий работы с аналитикой', async ({ page }) => {
    await page.goto('/planner')
    
    // Мокаем авторизацию
    await page.evaluate(() => {
      localStorage.setItem('auth-token', 'mock-token')
      localStorage.setItem('user', JSON.stringify({
        id: 'user-1',
        email: 'user@example.com',
        name: 'Test User',
        subscription: 'premium'
      }))
    })
    
    await page.reload()
    await page.waitForSelector('[data-testid="planner-content"]')
    
    // Шаг 1: Пользователь создает задачи для анализа
    const tasks = [
      { title: 'Task 1', priority: 'high', category: 'work', completed: true },
      { title: 'Task 2', priority: 'medium', category: 'personal', completed: true },
      { title: 'Task 3', priority: 'low', category: 'health', completed: false },
      { title: 'Task 4', priority: 'high', category: 'work', completed: true },
      { title: 'Task 5', priority: 'medium', category: 'education', completed: false }
    ]
    
    for (const task of tasks) {
      await page.click('[data-testid="add-task-button"]')
      await page.fill('[data-testid="task-title"]', task.title)
      await page.selectOption('[data-testid="task-priority"]', task.priority)
      await page.selectOption('[data-testid="task-category"]', task.category)
      
      if (task.completed) {
        await page.check('[data-testid="task-completed"]')
      }
      
      await page.click('[data-testid="save-task-button"]')
    }
    
    // Шаг 2: Пользователь переходит к аналитике
    await page.click('[data-testid="analytics-tab"]')
    await expect(page.locator('[data-testid="analytics-dashboard"]')).toBeVisible()
    
    // Шаг 3: Пользователь видит общую статистику
    await expect(page.locator('[data-testid="total-tasks"]')).toContainText('5')
    await expect(page.locator('[data-testid="completed-tasks"]')).toContainText('3')
    await expect(page.locator('[data-testid="completion-rate"]')).toContainText('60%')
    
    // Шаг 4: Пользователь анализирует продуктивность по категориям
    await expect(page.locator('[data-testid="category-breakdown"]')).toBeVisible()
    
    const workTasks = page.locator('[data-testid="category-work"]')
    await expect(workTasks).toContainText('2')
    
    const personalTasks = page.locator('[data-testid="category-personal"]')
    await expect(personalTasks).toContainText('1')
    
    const healthTasks = page.locator('[data-testid="category-health"]')
    await expect(healthTasks).toContainText('1')
    
    const educationTasks = page.locator('[data-testid="category-education"]')
    await expect(educationTasks).toContainText('1')
    
    // Шаг 5: Пользователь анализирует продуктивность по приоритетам
    await expect(page.locator('[data-testid="priority-breakdown"]')).toBeVisible()
    
    const highPriorityTasks = page.locator('[data-testid="priority-high"]')
    await expect(highPriorityTasks).toContainText('2')
    
    const mediumPriorityTasks = page.locator('[data-testid="priority-medium"]')
    await expect(mediumPriorityTasks).toContainText('2')
    
    const lowPriorityTasks = page.locator('[data-testid="priority-low"]')
    await expect(lowPriorityTasks).toContainText('1')
    
    // Шаг 6: Пользователь видит тренды продуктивности
    await expect(page.locator('[data-testid="productivity-trends"]')).toBeVisible()
    
    const trendChart = page.locator('[data-testid="trend-chart"]')
    await expect(trendChart).toBeVisible()
    
    // Шаг 7: Пользователь экспортирует данные
    await page.click('[data-testid="export-data-button"]')
    await expect(page.locator('[data-testid="export-options"]')).toBeVisible()
    
    await page.click('[data-testid="export-csv-button"]')
    await expect(page.locator('[data-testid="export-success"]')).toBeVisible()
  })

  test('должен проходить сценарий работы с настройками', async ({ page }) => {
    await page.goto('/planner')
    
    // Мокаем авторизацию
    await page.evaluate(() => {
      localStorage.setItem('auth-token', 'mock-token')
      localStorage.setItem('user', JSON.stringify({
        id: 'user-1',
        email: 'user@example.com',
        name: 'Test User',
        subscription: 'free'
      }))
    })
    
    await page.reload()
    await page.waitForSelector('[data-testid="planner-content"]')
    
    // Шаг 1: Пользователь переходит к настройкам
    await page.click('[data-testid="settings-button"]')
    await expect(page.locator('[data-testid="settings-modal"]')).toBeVisible()
    
    // Шаг 2: Пользователь настраивает профиль
    await page.click('[data-testid="profile-tab"]')
    await expect(page.locator('[data-testid="profile-settings"]')).toBeVisible()
    
    await page.fill('[data-testid="user-name"]', 'Updated User Name')
    await page.fill('[data-testid="user-email"]', 'updated@example.com')
    await page.click('[data-testid="save-profile-button"]')
    
    await expect(page.locator('[data-testid="profile-saved"]')).toBeVisible()
    
    // Шаг 3: Пользователь настраивает предпочтения
    await page.click('[data-testid="preferences-tab"]')
    await expect(page.locator('[data-testid="preferences-settings"]')).toBeVisible()
    
    await page.selectOption('[data-testid="theme-select"]', 'dark')
    await page.selectOption('[data-testid="language-select"]', 'ru')
    await page.check('[data-testid="notifications-enabled"]')
    await page.check('[data-testid="auto-save-enabled"]')
    
    await page.click('[data-testid="save-preferences-button"]')
    
    await expect(page.locator('[data-testid="preferences-saved"]')).toBeVisible()
    
    // Шаг 4: Пользователь настраивает ИИ предпочтения
    await page.click('[data-testid="ai-preferences-tab"]')
    await expect(page.locator('[data-testid="ai-preferences-settings"]')).toBeVisible()
    
    await page.selectOption('[data-testid="ai-model-select"]', 'gpt-4o-mini')
    await page.fill('[data-testid="ai-temperature"]', '0.7')
    await page.fill('[data-testid="ai-max-tokens"]', '2000')
    await page.check('[data-testid="ai-suggestions-enabled"]')
    await page.check('[data-testid="ai-analysis-enabled"]')
    
    await page.click('[data-testid="save-ai-preferences-button"]')
    
    await expect(page.locator('[data-testid="ai-preferences-saved"]')).toBeVisible()
    
    // Шаг 5: Пользователь настраивает уведомления
    await page.click('[data-testid="notifications-tab"]')
    await expect(page.locator('[data-testid="notifications-settings"]')).toBeVisible()
    
    await page.check('[data-testid="email-notifications"]')
    await page.check('[data-testid="push-notifications"]')
    await page.check('[data-testid="task-reminders"]')
    await page.check('[data-testid="deadline-alerts"]')
    
    await page.fill('[data-testid="reminder-time"]', '09:00')
    await page.selectOption('[data-testid="reminder-frequency"]', 'daily')
    
    await page.click('[data-testid="save-notifications-button"]')
    
    await expect(page.locator('[data-testid="notifications-saved"]')).toBeVisible()
    
    // Шаг 6: Пользователь настраивает безопасность
    await page.click('[data-testid="security-tab"]')
    await expect(page.locator('[data-testid="security-settings"]')).toBeVisible()
    
    await page.fill('[data-testid="current-password"]', 'currentpassword')
    await page.fill('[data-testid="new-password"]', 'newpassword123!')
    await page.fill('[data-testid="confirm-password"]', 'newpassword123!')
    
    await page.click('[data-testid="change-password-button"]')
    
    await expect(page.locator('[data-testid="password-changed"]')).toBeVisible()
    
    // Шаг 7: Пользователь сохраняет все настройки
    await page.click('[data-testid="save-all-settings-button"]')
    
    await expect(page.locator('[data-testid="all-settings-saved"]')).toBeVisible()
  })
})