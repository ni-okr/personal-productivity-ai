/**
 * 🛤️ ТЕСТЫ ПОЛЬЗОВАТЕЛЬСКИХ ПУТЕЙ
 * Покрытие: user journeys, navigation paths, user flows
 */

import { test, expect, Page } from '@playwright/test'

describe('🏠 Homepage Navigation Paths', () => {
  test('должен проходить путь от главной страницы к планировщику', async ({ page }) => {
    await page.goto('/')
    
    // Шаг 1: Пользователь видит главную страницу
    await expect(page.locator('h1')).toContainText('Personal AI')
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible()
    await expect(page.locator('[data-testid="features-section"]')).toBeVisible()
    await expect(page.locator('[data-testid="pricing-section"]')).toBeVisible()
    
    // Шаг 2: Пользователь прокручивает страницу
    await page.locator('[data-testid="features-section"]').scrollIntoViewIfNeeded()
    await expect(page.locator('[data-testid="feature-card"]')).toHaveCount.greaterThan(0)
    
    await page.locator('[data-testid="pricing-section"]').scrollIntoViewIfNeeded()
    await expect(page.locator('[data-testid="plan-card"]')).toHaveCount.greaterThan(0)
    
    // Шаг 3: Пользователь нажимает на кнопку "Get Started"
    await page.click('[data-testid="get-started-button"]')
    
    // Шаг 4: Пользователь перенаправляется на страницу входа
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
    await expect(page.locator('[data-testid="login-email"]')).toBeVisible()
    await expect(page.locator('[data-testid="login-password"]')).toBeVisible()
    
    // Шаг 5: Пользователь переходит к регистрации
    await page.click('[data-testid="sign-up-link"]')
    await expect(page.locator('[data-testid="signup-form"]')).toBeVisible()
    
    // Шаг 6: Пользователь возвращается к входу
    await page.click('[data-testid="sign-in-link"]')
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
  })

  test('должен проходить путь подписки на рассылку', async ({ page }) => {
    await page.goto('/')
    
    // Шаг 1: Пользователь видит форму подписки
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
    
    // Шаг 2: Пользователь вводит email
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    
    // Шаг 3: Пользователь нажимает кнопку подписки
    await page.click('[data-testid="subscribe-button"]')
    
    // Шаг 4: Пользователь видит сообщение об успехе
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Successfully subscribed')
    
    // Шаг 5: Пользователь может подписаться снова с другим email
    await page.fill('[data-testid="email-input"]', 'another@example.com')
    await page.click('[data-testid="subscribe-button"]')
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
  })

  test('должен проходить путь к тарифным планам', async ({ page }) => {
    await page.goto('/')
    
    // Шаг 1: Пользователь прокручивает к разделу тарифов
    await page.locator('[data-testid="pricing-section"]').scrollIntoViewIfNeeded()
    await expect(page.locator('[data-testid="pricing-section"]')).toBeVisible()
    
    // Шаг 2: Пользователь видит все тарифные планы
    const planCards = page.locator('[data-testid="plan-card"]')
    await expect(planCards).toHaveCount(4)
    
    // Шаг 3: Пользователь наводит курсор на план
    const freePlan = page.locator('[data-testid="plan-free"]')
    await freePlan.hover()
    await expect(freePlan).toHaveClass(/hover/)
    
    // Шаг 4: Пользователь кликает на план
    await freePlan.click()
    await expect(page.locator('[data-testid="plan-details"]')).toBeVisible()
    
    // Шаг 5: Пользователь закрывает детали плана
    await page.click('[data-testid="close-plan-details"]')
    await expect(page.locator('[data-testid="plan-details"]')).not.toBeVisible()
    
    // Шаг 6: Пользователь выбирает премиум план
    const premiumPlan = page.locator('[data-testid="plan-premium"]')
    await premiumPlan.click()
    await expect(page.locator('[data-testid="plan-details"]')).toBeVisible()
    await expect(page.locator('[data-testid="plan-details"]')).toContainText('Premium')
  })
})

describe('🔐 Authentication Paths', () => {
  test('должен проходить путь регистрации нового пользователя', async ({ page }) => {
    await page.goto('/')
    
    // Шаг 1: Пользователь нажимает "Get Started"
    await page.click('[data-testid="get-started-button"]')
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
    
    // Шаг 2: Пользователь переходит к регистрации
    await page.click('[data-testid="sign-up-link"]')
    await expect(page.locator('[data-testid="signup-form"]')).toBeVisible()
    
    // Шаг 3: Пользователь заполняет форму регистрации
    await page.fill('[data-testid="signup-email"]', 'newuser@example.com')
    await page.fill('[data-testid="signup-password"]', 'SecurePassword123!')
    await page.fill('[data-testid="signup-name"]', 'New User')
    await page.check('[data-testid="terms-checkbox"]')
    
    // Шаг 4: Пользователь нажимает кнопку регистрации
    await page.click('[data-testid="signup-button"]')
    
    // Шаг 5: Пользователь видит подтверждение регистрации
    await expect(page.locator('[data-testid="signup-success"]')).toBeVisible()
    await expect(page.locator('[data-testid="signup-success"]')).toContainText('Account created successfully')
    
    // Шаг 6: Пользователь переходит к входу
    await page.click('[data-testid="go-to-login-button"]')
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
  })

  test('должен проходить путь входа в систему', async ({ page }) => {
    await page.goto('/')
    
    // Шаг 1: Пользователь нажимает "Get Started"
    await page.click('[data-testid="get-started-button"]')
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
    
    // Шаг 2: Пользователь вводит данные для входа
    await page.fill('[data-testid="login-email"]', 'user@example.com')
    await page.fill('[data-testid="login-password"]', 'password123')
    await page.check('[data-testid="remember-me-checkbox"]')
    
    // Шаг 3: Пользователь нажимает кнопку входа
    await page.click('[data-testid="login-button"]')
    
    // Шаг 4: Пользователь перенаправляется в планировщик
    await expect(page.locator('[data-testid="planner-content"]')).toBeVisible()
    await expect(page.locator('[data-testid="welcome-message"]')).toContainText('Welcome back!')
  })

  test('должен проходить путь восстановления пароля', async ({ page }) => {
    await page.goto('/')
    
    // Шаг 1: Пользователь переходит к входу
    await page.click('[data-testid="get-started-button"]')
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
    
    // Шаг 2: Пользователь нажимает "Forgot Password"
    await page.click('[data-testid="forgot-password-link"]')
    await expect(page.locator('[data-testid="forgot-password-form"]')).toBeVisible()
    
    // Шаг 3: Пользователь вводит email
    await page.fill('[data-testid="forgot-password-email"]', 'user@example.com')
    await page.click('[data-testid="reset-password-button"]')
    
    // Шаг 4: Пользователь видит подтверждение
    await expect(page.locator('[data-testid="reset-password-success"]')).toBeVisible()
    await expect(page.locator('[data-testid="reset-password-success"]')).toContainText('Password reset email sent')
    
    // Шаг 5: Пользователь возвращается к входу
    await page.click('[data-testid="back-to-login-button"]')
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
  })
})

describe('📋 Task Management Paths', () => {
  test('должен проходить путь создания задачи', async ({ page }) => {
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
    
    // Шаг 1: Пользователь видит пустой планировщик
    await expect(page.locator('[data-testid="planner-content"]')).toBeVisible()
    await expect(page.locator('[data-testid="add-task-button"]')).toBeVisible()
    
    // Шаг 2: Пользователь нажимает кнопку добавления задачи
    await page.click('[data-testid="add-task-button"]')
    await expect(page.locator('[data-testid="task-form"]')).toBeVisible()
    
    // Шаг 3: Пользователь заполняет форму задачи
    await page.fill('[data-testid="task-title"]', 'New Task')
    await page.fill('[data-testid="task-description"]', 'This is a new task')
    await page.selectOption('[data-testid="task-priority"]', 'high')
    await page.selectOption('[data-testid="task-category"]', 'work')
    await page.fill('[data-testid="task-due-date"]', '2024-12-31')
    
    // Шаг 4: Пользователь сохраняет задачу
    await page.click('[data-testid="save-task-button"]')
    
    // Шаг 5: Пользователь видит созданную задачу
    await expect(page.locator('.task-card')).toContainText('New Task')
    await expect(page.locator('.task-card')).toContainText('This is a new task')
    await expect(page.locator('.task-card')).toContainText('high')
    await expect(page.locator('.task-card')).toContainText('work')
  })

  test('должен проходить путь редактирования задачи', async ({ page }) => {
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
    
    // Шаг 1: Пользователь создает задачу
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Original Task')
    await page.selectOption('[data-testid="task-priority"]', 'medium')
    await page.selectOption('[data-testid="task-category"]', 'personal')
    await page.click('[data-testid="save-task-button"]')
    
    // Шаг 2: Пользователь видит созданную задачу
    await expect(page.locator('.task-card')).toContainText('Original Task')
    
    // Шаг 3: Пользователь нажимает на задачу для редактирования
    await page.locator('.task-card').click()
    await expect(page.locator('[data-testid="task-edit-form"]')).toBeVisible()
    
    // Шаг 4: Пользователь изменяет данные задачи
    await page.fill('[data-testid="task-title"]', 'Updated Task')
    await page.fill('[data-testid="task-description"]', 'This is an updated task')
    await page.selectOption('[data-testid="task-priority"]', 'high')
    await page.selectOption('[data-testid="task-category"]', 'work')
    
    // Шаг 5: Пользователь сохраняет изменения
    await page.click('[data-testid="save-task-button"]')
    
    // Шаг 6: Пользователь видит обновленную задачу
    await expect(page.locator('.task-card')).toContainText('Updated Task')
    await expect(page.locator('.task-card')).toContainText('This is an updated task')
    await expect(page.locator('.task-card')).toContainText('high')
    await expect(page.locator('.task-card')).toContainText('work')
  })

  test('должен проходить путь завершения задачи', async ({ page }) => {
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
    
    // Шаг 1: Пользователь создает задачу
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Task to Complete')
    await page.selectOption('[data-testid="task-priority"]', 'high')
    await page.selectOption('[data-testid="task-category"]', 'work')
    await page.click('[data-testid="save-task-button"]')
    
    // Шаг 2: Пользователь видит задачу как незавершенную
    const taskCard = page.locator('.task-card')
    await expect(taskCard).toContainText('Task to Complete')
    await expect(taskCard.locator('[data-testid="task-completed"]')).not.toBeChecked()
    
    // Шаг 3: Пользователь нажимает кнопку завершения
    await taskCard.locator('[data-testid="complete-task-button"]').click()
    
    // Шаг 4: Пользователь видит задачу как завершенную
    await expect(taskCard.locator('[data-testid="task-completed"]')).toBeChecked()
    await expect(taskCard).toHaveClass(/completed/)
    
    // Шаг 5: Пользователь видит обновленную статистику
    await expect(page.locator('[data-testid="completed-count"]')).toContainText('1')
    await expect(page.locator('[data-testid="pending-count"]')).toContainText('0')
  })

  test('должен проходить путь удаления задачи', async ({ page }) => {
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
    
    // Шаг 1: Пользователь создает задачу
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Task to Delete')
    await page.selectOption('[data-testid="task-priority"]', 'medium')
    await page.selectOption('[data-testid="task-category"]', 'personal')
    await page.click('[data-testid="save-task-button"]')
    
    // Шаг 2: Пользователь видит созданную задачу
    await expect(page.locator('.task-card')).toContainText('Task to Delete')
    
    // Шаг 3: Пользователь нажимает кнопку удаления
    await page.locator('.task-card').locator('[data-testid="delete-task-button"]').click()
    
    // Шаг 4: Пользователь видит подтверждение удаления
    await expect(page.locator('[data-testid="delete-confirmation"]')).toBeVisible()
    await expect(page.locator('[data-testid="delete-confirmation"]')).toContainText('Are you sure you want to delete this task?')
    
    // Шаг 5: Пользователь подтверждает удаление
    await page.click('[data-testid="confirm-delete-button"]')
    
    // Шаг 6: Пользователь видит, что задача удалена
    await expect(page.locator('.task-card')).not.toContainText('Task to Delete')
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible()
  })
})

describe('🤖 AI Features Paths', () => {
  test('должен проходить путь использования умной сортировки', async ({ page }) => {
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
    
    // Шаг 1: Пользователь создает несколько задач
    const tasks = [
      { title: 'Low Priority Task', priority: 'low', category: 'personal' },
      { title: 'High Priority Task', priority: 'high', category: 'work' },
      { title: 'Medium Priority Task', priority: 'medium', category: 'health' }
    ]
    
    for (const task of tasks) {
      await page.click('[data-testid="add-task-button"]')
      await page.fill('[data-testid="task-title"]', task.title)
      await page.selectOption('[data-testid="task-priority"]', task.priority)
      await page.selectOption('[data-testid="task-category"]', task.category)
      await page.click('[data-testid="save-task-button"]')
    }
    
    // Шаг 2: Пользователь видит задачи в исходном порядке
    const taskCards = page.locator('.task-card')
    await expect(taskCards).toHaveCount(3)
    
    // Шаг 3: Пользователь нажимает кнопку умной сортировки
    await page.click('[data-testid="smart-sort-button"]')
    
    // Шаг 4: Пользователь видит индикатор сортировки
    await expect(page.locator('[data-testid="sorting-indicator"]')).toBeVisible()
    await expect(page.locator('[data-testid="sorting-indicator"]')).toContainText('Sorting tasks...')
    
    // Шаг 5: Пользователь видит отсортированные задачи
    await page.waitForSelector('[data-testid="sorting-complete"]')
    await expect(page.locator('[data-testid="sorting-complete"]')).toContainText('Tasks sorted by priority')
    
    // Шаг 6: Пользователь видит задачи в правильном порядке
    await expect(taskCards.first()).toContainText('High Priority Task')
    await expect(taskCards.nth(1)).toContainText('Medium Priority Task')
    await expect(taskCards.nth(2)).toContainText('Low Priority Task')
  })

  test('должен проходить путь получения ИИ предложений', async ({ page }) => {
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
    
    // Шаг 1: Пользователь создает несколько задач
    const tasks = [
      { title: 'Work Task 1', priority: 'high', category: 'work' },
      { title: 'Personal Task 1', priority: 'medium', category: 'personal' },
      { title: 'Health Task 1', priority: 'low', category: 'health' }
    ]
    
    for (const task of tasks) {
      await page.click('[data-testid="add-task-button"]')
      await page.fill('[data-testid="task-title"]', task.title)
      await page.selectOption('[data-testid="task-priority"]', task.priority)
      await page.selectOption('[data-testid="task-category"]', task.category)
      await page.click('[data-testid="save-task-button"]')
    }
    
    // Шаг 2: Пользователь нажимает кнопку генерации предложений
    await page.click('[data-testid="generate-suggestions-button"]')
    
    // Шаг 3: Пользователь видит индикатор загрузки
    await expect(page.locator('[data-testid="suggestions-loading"]')).toBeVisible()
    await expect(page.locator('[data-testid="suggestions-loading"]')).toContainText('Generating AI suggestions...')
    
    // Шаг 4: Пользователь видит сгенерированные предложения
    await page.waitForSelector('[data-testid="ai-suggestions"]')
    await expect(page.locator('[data-testid="ai-suggestions"]')).toBeVisible()
    
    const suggestionCards = page.locator('.suggestion-card')
    await expect(suggestionCards).toHaveCount.greaterThan(0)
    
    // Шаг 5: Пользователь просматривает предложения
    const firstSuggestion = suggestionCards.first()
    await expect(firstSuggestion).toContainText('suggestion')
    await expect(firstSuggestion.locator('[data-testid="suggestion-title"]')).toBeVisible()
    await expect(firstSuggestion.locator('[data-testid="suggestion-description"]')).toBeVisible()
    await expect(firstSuggestion.locator('[data-testid="suggestion-confidence"]')).toBeVisible()
    
    // Шаг 6: Пользователь применяет предложение
    await firstSuggestion.locator('[data-testid="apply-suggestion-button"]').click()
    
    // Шаг 7: Пользователь видит подтверждение применения
    await expect(page.locator('[data-testid="suggestion-applied"]')).toBeVisible()
    await expect(page.locator('[data-testid="suggestion-applied"]')).toContainText('Suggestion applied successfully')
  })

  test('должен проходить путь анализа продуктивности', async ({ page }) => {
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
    
    // Шаг 1: Пользователь создает несколько задач
    const tasks = [
      { title: 'Completed Task 1', priority: 'high', category: 'work', completed: true },
      { title: 'Completed Task 2', priority: 'medium', category: 'personal', completed: true },
      { title: 'Pending Task 1', priority: 'low', category: 'health', completed: false },
      { title: 'Pending Task 2', priority: 'high', category: 'work', completed: false }
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
    
    // Шаг 2: Пользователь нажимает кнопку анализа продуктивности
    await page.click('[data-testid="analyze-productivity-button"]')
    
    // Шаг 3: Пользователь видит индикатор анализа
    await expect(page.locator('[data-testid="analysis-loading"]')).toBeVisible()
    await expect(page.locator('[data-testid="analysis-loading"]')).toContainText('Analyzing productivity...')
    
    // Шаг 4: Пользователь видит результаты анализа
    await page.waitForSelector('[data-testid="productivity-analysis"]')
    await expect(page.locator('[data-testid="productivity-analysis"]')).toBeVisible()
    
    // Шаг 5: Пользователь видит общий балл продуктивности
    const productivityScore = page.locator('[data-testid="productivity-score"]')
    await expect(productivityScore).toBeVisible()
    await expect(productivityScore).toContainText('50%') // 2 из 4 задач завершены
    
    // Шаг 6: Пользователь видит инсайты
    const insights = page.locator('[data-testid="productivity-insights"]')
    await expect(insights).toBeVisible()
    
    const insightItems = page.locator('[data-testid="insight-item"]')
    await expect(insightItems).toHaveCount.greaterThan(0)
    
    // Шаг 7: Пользователь видит рекомендации
    const recommendations = page.locator('[data-testid="productivity-recommendations"]')
    await expect(recommendations).toBeVisible()
    
    const recommendationItems = page.locator('[data-testid="recommendation-item"]')
    await expect(recommendationItems).toHaveCount.greaterThan(0)
  })
})

describe('⚙️ Settings Navigation Paths', () => {
  test('должен проходить путь к настройкам профиля', async ({ page }) => {
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
    
    // Шаг 1: Пользователь нажимает кнопку настроек
    await page.click('[data-testid="settings-button"]')
    await expect(page.locator('[data-testid="settings-modal"]')).toBeVisible()
    
    // Шаг 2: Пользователь переходит к настройкам профиля
    await page.click('[data-testid="profile-tab"]')
    await expect(page.locator('[data-testid="profile-settings"]')).toBeVisible()
    
    // Шаг 3: Пользователь видит текущие данные профиля
    await expect(page.locator('[data-testid="user-name"]')).toHaveValue('Test User')
    await expect(page.locator('[data-testid="user-email"]')).toHaveValue('user@example.com')
    
    // Шаг 4: Пользователь изменяет данные профиля
    await page.fill('[data-testid="user-name"]', 'Updated User Name')
    await page.fill('[data-testid="user-email"]', 'updated@example.com')
    
    // Шаг 5: Пользователь сохраняет изменения
    await page.click('[data-testid="save-profile-button"]')
    
    // Шаг 6: Пользователь видит подтверждение сохранения
    await expect(page.locator('[data-testid="profile-saved"]')).toBeVisible()
    await expect(page.locator('[data-testid="profile-saved"]')).toContainText('Profile updated successfully')
  })

  test('должен проходить путь к настройкам ИИ', async ({ page }) => {
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
    
    // Шаг 1: Пользователь открывает настройки
    await page.click('[data-testid="settings-button"]')
    await expect(page.locator('[data-testid="settings-modal"]')).toBeVisible()
    
    // Шаг 2: Пользователь переходит к настройкам ИИ
    await page.click('[data-testid="ai-preferences-tab"]')
    await expect(page.locator('[data-testid="ai-preferences-settings"]')).toBeVisible()
    
    // Шаг 3: Пользователь видит доступные ИИ модели
    const aiModelSelect = page.locator('[data-testid="ai-model-select"]')
    await expect(aiModelSelect).toBeVisible()
    
    const aiModelOptions = page.locator('[data-testid="ai-model-option"]')
    await expect(aiModelOptions).toHaveCount.greaterThan(1)
    
    // Шаг 4: Пользователь выбирает ИИ модель
    await page.selectOption('[data-testid="ai-model-select"]', 'gpt-4o-mini')
    
    // Шаг 5: Пользователь настраивает параметры ИИ
    await page.fill('[data-testid="ai-temperature"]', '0.7')
    await page.fill('[data-testid="ai-max-tokens"]', '2000')
    await page.check('[data-testid="ai-suggestions-enabled"]')
    await page.check('[data-testid="ai-analysis-enabled"]')
    
    // Шаг 6: Пользователь сохраняет настройки ИИ
    await page.click('[data-testid="save-ai-preferences-button"]')
    
    // Шаг 7: Пользователь видит подтверждение сохранения
    await expect(page.locator('[data-testid="ai-preferences-saved"]')).toBeVisible()
    await expect(page.locator('[data-testid="ai-preferences-saved"]')).toContainText('AI preferences updated successfully')
  })
})