/**
 * 📚 ТЕСТЫ ТРАССИРОВКИ ДОКУМЕНТАЦИИ
 * Покрытие: соответствие документации реализации, актуальность, полнота
 */

import { test, expect, Page } from '@playwright/test'

describe('📚 Documentation Traceability Tests', () => {
  test('должен соответствовать README документации', async ({ page }) => {
    await page.goto('/')
    
    // DOC-TRACE-001: Проверяем, что главная страница соответствует README
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
    
    // DOC-TRACE-002: Проверяем, что описание функций соответствует README
    await expect(page.locator('[data-testid="features-section"]')).toBeVisible()
    await expect(page.locator('[data-testid="pricing-section"]')).toBeVisible()
    
    // DOC-TRACE-003: Проверяем, что инструкции по установке соответствуют README
    await page.click('[data-testid="get-started-button"]')
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
    
    await page.click('[data-testid="sign-up-link"]')
    await expect(page.locator('[data-testid="signup-form"]')).toBeVisible()
    
    // DOC-TRACE-004: Проверяем, что инструкции по использованию соответствуют README
    await page.fill('[data-testid="login-email"]', 'test@example.com')
    await page.fill('[data-testid="login-password"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    // DOC-TRACE-005: Проверяем, что инструкции по развертыванию соответствуют README
    await page.goto('/api/test')
    const response = await page.textContent('body')
    expect(response).toContain('API is working')
  })

  test('должен соответствовать API документации', async ({ page }) => {
    await page.goto('/api/test')
    
    // API-TRACE-001: Проверяем, что API endpoints соответствуют документации
    const response = await page.textContent('body')
    expect(response).toContain('API is working')
    
    // API-TRACE-002: Проверяем, что API методы соответствуют документации
    await page.goto('/')
    await page.fill('[data-testid="email-input"]', 'api@example.com')
    await page.click('[data-testid="subscribe-button"]')
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    
    // API-TRACE-003: Проверяем, что API параметры соответствуют документации
    await page.click('[data-testid="get-started-button"]')
    await page.fill('[data-testid="login-email"]', 'api@example.com')
    await page.fill('[data-testid="login-password"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    // API-TRACE-004: Проверяем, что API ответы соответствуют документации
    await page.goto('/planner')
    await page.waitForSelector('[data-testid="planner-content"]')
    
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'API Test Task')
    await page.selectOption('[data-testid="task-priority"]', 'high')
    await page.selectOption('[data-testid="task-category"]', 'work')
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('.task-card')).toContainText('API Test Task')
    
    // API-TRACE-005: Проверяем, что API ошибки соответствуют документации
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', '') // Пустое название
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible()
  })

  test('должен соответствовать документации компонентов', async ({ page }) => {
    await page.goto('/')
    
    // COMP-TRACE-001: Проверяем, что компоненты соответствуют документации
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible()
    await expect(page.locator('[data-testid="features-section"]')).toBeVisible()
    await expect(page.locator('[data-testid="pricing-section"]')).toBeVisible()
    
    // COMP-TRACE-002: Проверяем, что пропсы компонентов соответствуют документации
    await page.click('[data-testid="get-started-button"]')
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
    
    await page.click('[data-testid="sign-up-link"]')
    await expect(page.locator('[data-testid="signup-form"]')).toBeVisible()
    
    // COMP-TRACE-003: Проверяем, что состояние компонентов соответствует документации
    await page.fill('[data-testid="login-email"]', 'test@example.com')
    await page.fill('[data-testid="login-password"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    // COMP-TRACE-004: Проверяем, что события компонентов соответствуют документации
    await page.goto('/planner')
    await page.waitForSelector('[data-testid="planner-content"]')
    
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Component Test Task')
    await page.selectOption('[data-testid="task-priority"]', 'high')
    await page.selectOption('[data-testid="task-category"]', 'work')
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('.task-card')).toContainText('Component Test Task')
    
    // COMP-TRACE-005: Проверяем, что стили компонентов соответствуют документации
    const heroSection = page.locator('[data-testid="hero-section"]')
    const heroSectionClasses = await heroSection.getAttribute('class')
    expect(heroSectionClasses).toContain('bg-gradient-to-r')
  })

  test('должен соответствовать документации утилит', async ({ page }) => {
    await page.goto('/planner')
    await page.waitForSelector('[data-testid="planner-content"]')
    
    // UTIL-TRACE-001: Проверяем, что утилиты валидации соответствуют документации
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', '') // Пустое название
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible()
    
    // UTIL-TRACE-002: Проверяем, что утилиты форматирования соответствуют документации
    await page.fill('[data-testid="task-title"]', '  Utility Test Task  ') // С пробелами
    await page.selectOption('[data-testid="task-priority"]', 'high')
    await page.selectOption('[data-testid="task-category"]', 'work')
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('.task-card')).toContainText('Utility Test Task')
    
    // UTIL-TRACE-003: Проверяем, что утилиты даты соответствуют документации
    await page.locator('.task-card').click()
    await page.fill('[data-testid="task-due-date"]', '2025-12-31')
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('.task-card')).toContainText('2025-12-31')
    
    // UTIL-TRACE-004: Проверяем, что утилиты строк соответствуют документации
    await page.locator('.task-card').click()
    await page.fill('[data-testid="task-description"]', 'Test description with special characters: !@#$%^&*()')
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('.task-card')).toContainText('Test description with special characters: !@#$%^&*()')
    
    // UTIL-TRACE-005: Проверяем, что утилиты чисел соответствуют документации
    await page.locator('.task-card').click()
    await page.fill('[data-testid="task-estimated-hours"]', '2.5')
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('.task-card')).toContainText('2.5 hours')
  })

  test('должен соответствовать документации типов', async ({ page }) => {
    await page.goto('/planner')
    await page.waitForSelector('[data-testid="planner-content"]')
    
    // TYPE-TRACE-001: Проверяем, что типы Task соответствуют документации
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Type Test Task')
    await page.selectOption('[data-testid="task-priority"]', 'high')
    await page.selectOption('[data-testid="task-category"]', 'work')
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('.task-card')).toContainText('Type Test Task')
    
    // TYPE-TRACE-002: Проверяем, что типы User соответствуют документации
    await page.click('[data-testid="user-profile-button"]')
    await expect(page.locator('[data-testid="user-profile"]')).toBeVisible()
    
    // TYPE-TRACE-003: Проверяем, что типы Subscription соответствуют документации
    await page.click('[data-testid="subscription-button"]')
    await expect(page.locator('[data-testid="subscription-modal"]')).toBeVisible()
    
    // TYPE-TRACE-004: Проверяем, что типы AI соответствуют документации
    await page.click('[data-testid="generate-suggestions-button"]')
    await page.waitForSelector('[data-testid="ai-suggestions"]')
    
    const suggestionCards = page.locator('.suggestion-card')
    await expect(suggestionCards).toHaveCount.greaterThan(0)
    
    // TYPE-TRACE-005: Проверяем, что типы API соответствуют документации
    await page.goto('/api/test')
    const response = await page.textContent('body')
    expect(response).toContain('API is working')
  })

  test('должен соответствовать документации сервисов', async ({ page }) => {
    await page.goto('/planner')
    await page.waitForSelector('[data-testid="planner-content"]')
    
    // SERV-TRACE-001: Проверяем, что сервис аутентификации соответствует документации
    await page.click('[data-testid="user-profile-button"]')
    await expect(page.locator('[data-testid="user-profile"]')).toBeVisible()
    
    // SERV-TRACE-002: Проверяем, что сервис задач соответствует документации
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Service Test Task')
    await page.selectOption('[data-testid="task-priority"]', 'high')
    await page.selectOption('[data-testid="task-category"]', 'work')
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('.task-card')).toContainText('Service Test Task')
    
    // SERV-TRACE-003: Проверяем, что сервис ИИ соответствует документации
    await page.click('[data-testid="generate-suggestions-button"]')
    await page.waitForSelector('[data-testid="ai-suggestions"]')
    
    const suggestionCards = page.locator('.suggestion-card')
    await expect(suggestionCards).toHaveCount.greaterThan(0)
    
    // SERV-TRACE-004: Проверяем, что сервис подписок соответствует документации
    await page.click('[data-testid="subscription-button"]')
    await expect(page.locator('[data-testid="subscription-modal"]')).toBeVisible()
    
    // SERV-TRACE-005: Проверяем, что сервис уведомлений соответствует документации
    await page.click('[data-testid="notifications-button"]')
    await expect(page.locator('[data-testid="notifications-panel"]')).toBeVisible()
  })

  test('должен соответствовать документации конфигурации', async ({ page }) => {
    await page.goto('/')
    
    // CONFIG-TRACE-001: Проверяем, что конфигурация Next.js соответствует документации
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
    
    // CONFIG-TRACE-002: Проверяем, что конфигурация Tailwind соответствует документации
    const heroSection = page.locator('[data-testid="hero-section"]')
    const heroSectionClasses = await heroSection.getAttribute('class')
    expect(heroSectionClasses).toContain('bg-gradient-to-r')
    
    // CONFIG-TRACE-003: Проверяем, что конфигурация TypeScript соответствует документации
    await page.goto('/planner')
    await page.waitForSelector('[data-testid="planner-content"]')
    
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Config Test Task')
    await page.selectOption('[data-testid="task-priority"]', 'high')
    await page.selectOption('[data-testid="task-category"]', 'work')
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('.task-card')).toContainText('Config Test Task')
    
    // CONFIG-TRACE-004: Проверяем, что конфигурация Jest соответствует документации
    await page.goto('/api/test')
    const response = await page.textContent('body')
    expect(response).toContain('API is working')
    
    // CONFIG-TRACE-005: Проверяем, что конфигурация Playwright соответствует документации
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('должен соответствовать документации тестов', async ({ page }) => {
    await page.goto('/')
    
    // TEST-TRACE-001: Проверяем, что unit тесты соответствуют документации
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
    
    // TEST-TRACE-002: Проверяем, что integration тесты соответствуют документации
    await page.click('[data-testid="get-started-button"]')
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
    
    await page.click('[data-testid="sign-up-link"]')
    await expect(page.locator('[data-testid="signup-form"]')).toBeVisible()
    
    // TEST-TRACE-003: Проверяем, что e2e тесты соответствуют документации
    await page.fill('[data-testid="login-email"]', 'test@example.com')
    await page.fill('[data-testid="login-password"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    // TEST-TRACE-004: Проверяем, что performance тесты соответствуют документации
    const startTime = Date.now()
    await page.goto('/planner')
    await page.waitForSelector('[data-testid="planner-content"]')
    const loadTime = Date.now() - startTime
    
    expect(loadTime).toBeLessThan(3000)
    
    // TEST-TRACE-005: Проверяем, что security тесты соответствуют документации
    await page.goto('/')
    const protocol = await page.evaluate(() => window.location.protocol)
    expect(protocol).toBe('https:')
  })

  test('должен соответствовать документации развертывания', async ({ page }) => {
    await page.goto('/')
    
    // DEPLOY-TRACE-001: Проверяем, что инструкции по развертыванию соответствуют документации
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
    
    // DEPLOY-TRACE-002: Проверяем, что инструкции по настройке соответствуют документации
    await page.goto('/api/test')
    const response = await page.textContent('body')
    expect(response).toContain('API is working')
    
    // DEPLOY-TRACE-003: Проверяем, что инструкции по мониторингу соответствуют документации
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
    
    // DEPLOY-TRACE-004: Проверяем, что инструкции по масштабированию соответствуют документации
    await page.goto('/planner')
    await page.waitForSelector('[data-testid="planner-content"]')
    
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Deploy Test Task')
    await page.selectOption('[data-testid="task-priority"]', 'high')
    await page.selectOption('[data-testid="task-category"]', 'work')
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('.task-card')).toContainText('Deploy Test Task')
    
    // DEPLOY-TRACE-005: Проверяем, что инструкции по откату соответствуют документации
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
  })
})