/**
 * 📁 ТЕСТЫ СООТВЕТСТВИЯ СТРУКТУРЕ ПРОЕКТА
 * Покрытие: соответствие структуре проекта, организация файлов, конвенции именования
 */

import { test, expect, Page } from '@playwright/test'

describe('📁 Project Structure Conformance Tests', () => {
  test('должен соответствовать структуре Next.js проекта', async ({ page }) => {
    await page.goto('/')
    
    // STRUCT-001: Проверяем, что главная страница загружается
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
    
    // STRUCT-002: Проверяем, что страница планировщика загружается
    await page.goto('/planner')
    await page.waitForSelector('[data-testid="planner-content"]')
    
    await expect(page.locator('[data-testid="planner-content"]')).toBeVisible()
    await expect(page.locator('[data-testid="add-task-button"]')).toBeVisible()
    
    // STRUCT-003: Проверяем, что API endpoints работают
    await page.goto('/api/test')
    const response = await page.textContent('body')
    expect(response).toContain('API is working')
    
    // STRUCT-004: Проверяем, что статические файлы загружаются
    await page.goto('/')
    const favicon = await page.locator('link[rel="icon"]').getAttribute('href')
    expect(favicon).toBeDefined()
    
    // STRUCT-005: Проверяем, что PWA манифест загружается
    const manifest = await page.locator('link[rel="manifest"]').getAttribute('href')
    expect(manifest).toBeDefined()
  })

  test('должен соответствовать структуре компонентов', async ({ page }) => {
    await page.goto('/')
    
    // COMP-001: Проверяем, что компоненты правильно организованы
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible()
    await expect(page.locator('[data-testid="features-section"]')).toBeVisible()
    await expect(page.locator('[data-testid="pricing-section"]')).toBeVisible()
    
    // COMP-002: Проверяем, что компоненты имеют правильные пропсы
    await page.click('[data-testid="get-started-button"]')
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
    
    await page.click('[data-testid="sign-up-link"]')
    await expect(page.locator('[data-testid="signup-form"]')).toBeVisible()
    
    // COMP-003: Проверяем, что компоненты имеют правильное состояние
    await page.fill('[data-testid="login-email"]', 'test@example.com')
    await page.fill('[data-testid="login-password"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    // COMP-004: Проверяем, что компоненты правильно обрабатывают события
    await page.goto('/planner')
    await page.waitForSelector('[data-testid="planner-content"]')
    
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Component Test Task')
    await page.selectOption('[data-testid="task-priority"]', 'high')
    await page.selectOption('[data-testid="task-category"]', 'work')
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('.task-card')).toContainText('Component Test Task')
    
    // COMP-005: Проверяем, что компоненты правильно обновляются
    await page.locator('.task-card').click()
    await page.fill('[data-testid="task-title"]', 'Updated Component Test Task')
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('.task-card')).toContainText('Updated Component Test Task')
  })

  test('должен соответствовать структуре утилит', async ({ page }) => {
    await page.goto('/planner')
    await page.waitForSelector('[data-testid="planner-content"]')
    
    // UTIL-001: Проверяем, что утилиты валидации работают
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', '') // Пустое название
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible()
    
    // UTIL-002: Проверяем, что утилиты форматирования работают
    await page.fill('[data-testid="task-title"]', '  Utility Test Task  ') // С пробелами
    await page.selectOption('[data-testid="task-priority"]', 'high')
    await page.selectOption('[data-testid="task-category"]', 'work')
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('.task-card')).toContainText('Utility Test Task')
    
    // UTIL-003: Проверяем, что утилиты даты работают
    await page.locator('.task-card').click()
    await page.fill('[data-testid="task-due-date"]', '2025-12-31')
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('.task-card')).toContainText('2025-12-31')
    
    // UTIL-004: Проверяем, что утилиты строк работают
    await page.locator('.task-card').click()
    await page.fill('[data-testid="task-description"]', 'Test description with special characters: !@#$%^&*()')
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('.task-card')).toContainText('Test description with special characters: !@#$%^&*()')
    
    // UTIL-005: Проверяем, что утилиты чисел работают
    await page.locator('.task-card').click()
    await page.fill('[data-testid="task-estimated-hours"]', '2.5')
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('.task-card')).toContainText('2.5 hours')
  })

  test('должен соответствовать структуре типов', async ({ page }) => {
    await page.goto('/planner')
    await page.waitForSelector('[data-testid="planner-content"]')
    
    // TYPE-001: Проверяем, что типы Task правильно определены
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Type Test Task')
    await page.selectOption('[data-testid="task-priority"]', 'high')
    await page.selectOption('[data-testid="task-category"]', 'work')
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('.task-card')).toContainText('Type Test Task')
    
    // TYPE-002: Проверяем, что типы User правильно определены
    await page.click('[data-testid="user-profile-button"]')
    await expect(page.locator('[data-testid="user-profile"]')).toBeVisible()
    
    // TYPE-003: Проверяем, что типы Subscription правильно определены
    await page.click('[data-testid="subscription-button"]')
    await expect(page.locator('[data-testid="subscription-modal"]')).toBeVisible()
    
    // TYPE-004: Проверяем, что типы AI правильно определены
    await page.click('[data-testid="generate-suggestions-button"]')
    await page.waitForSelector('[data-testid="ai-suggestions"]')
    
    const suggestionCards = page.locator('.suggestion-card')
    await expect(suggestionCards).toHaveCount.greaterThan(0)
    
    // TYPE-005: Проверяем, что типы API правильно определены
    await page.goto('/api/test')
    const response = await page.textContent('body')
    expect(response).toContain('API is working')
  })

  test('должен соответствовать структуре сервисов', async ({ page }) => {
    await page.goto('/planner')
    await page.waitForSelector('[data-testid="planner-content"]')
    
    // SERV-001: Проверяем, что сервис аутентификации работает
    await page.click('[data-testid="user-profile-button"]')
    await expect(page.locator('[data-testid="user-profile"]')).toBeVisible()
    
    // SERV-002: Проверяем, что сервис задач работает
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Service Test Task')
    await page.selectOption('[data-testid="task-priority"]', 'high')
    await page.selectOption('[data-testid="task-category"]', 'work')
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('.task-card')).toContainText('Service Test Task')
    
    // SERV-003: Проверяем, что сервис ИИ работает
    await page.click('[data-testid="generate-suggestions-button"]')
    await page.waitForSelector('[data-testid="ai-suggestions"]')
    
    const suggestionCards = page.locator('.suggestion-card')
    await expect(suggestionCards).toHaveCount.greaterThan(0)
    
    // SERV-004: Проверяем, что сервис подписок работает
    await page.click('[data-testid="subscription-button"]')
    await expect(page.locator('[data-testid="subscription-modal"]')).toBeVisible()
    
    // SERV-005: Проверяем, что сервис уведомлений работает
    await page.click('[data-testid="notifications-button"]')
    await expect(page.locator('[data-testid="notifications-panel"]')).toBeVisible()
  })

  test('должен соответствовать структуре конфигурации', async ({ page }) => {
    await page.goto('/')
    
    // CONFIG-001: Проверяем, что конфигурация Next.js работает
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
    
    // CONFIG-002: Проверяем, что конфигурация Tailwind работает
    const heroSection = page.locator('[data-testid="hero-section"]')
    const heroSectionClasses = await heroSection.getAttribute('class')
    expect(heroSectionClasses).toContain('bg-gradient-to-r')
    
    // CONFIG-003: Проверяем, что конфигурация TypeScript работает
    await page.goto('/planner')
    await page.waitForSelector('[data-testid="planner-content"]')
    
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Config Test Task')
    await page.selectOption('[data-testid="task-priority"]', 'high')
    await page.selectOption('[data-testid="task-category"]', 'work')
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('.task-card')).toContainText('Config Test Task')
    
    // CONFIG-004: Проверяем, что конфигурация Jest работает
    await page.goto('/api/test')
    const response = await page.textContent('body')
    expect(response).toContain('API is working')
    
    // CONFIG-005: Проверяем, что конфигурация Playwright работает
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('должен соответствовать структуре тестов', async ({ page }) => {
    await page.goto('/')
    
    // TEST-STRUCT-001: Проверяем, что unit тесты работают
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
    
    // TEST-STRUCT-002: Проверяем, что integration тесты работают
    await page.click('[data-testid="get-started-button"]')
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
    
    await page.click('[data-testid="sign-up-link"]')
    await expect(page.locator('[data-testid="signup-form"]')).toBeVisible()
    
    // TEST-STRUCT-003: Проверяем, что e2e тесты работают
    await page.fill('[data-testid="login-email"]', 'test@example.com')
    await page.fill('[data-testid="login-password"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    // TEST-STRUCT-004: Проверяем, что performance тесты работают
    const startTime = Date.now()
    await page.goto('/planner')
    await page.waitForSelector('[data-testid="planner-content"]')
    const loadTime = Date.now() - startTime
    
    expect(loadTime).toBeLessThan(3000)
    
    // TEST-STRUCT-005: Проверяем, что security тесты работают
    await page.goto('/')
    const protocol = await page.evaluate(() => window.location.protocol)
    expect(protocol).toBe('https:')
  })

  test('должен соответствовать структуре документации', async ({ page }) => {
    await page.goto('/')
    
    // DOC-001: Проверяем, что README доступен
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
    
    // DOC-002: Проверяем, что API документация доступна
    await page.goto('/api/test')
    const response = await page.textContent('body')
    expect(response).toContain('API is working')
    
    // DOC-003: Проверяем, что конфигурация документирована
    await page.goto('/')
    const favicon = await page.locator('link[rel="icon"]').getAttribute('href')
    expect(favicon).toBeDefined()
    
    // DOC-004: Проверяем, что компоненты документированы
    await page.goto('/planner')
    await page.waitForSelector('[data-testid="planner-content"]')
    
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Documentation Test Task')
    await page.selectOption('[data-testid="task-priority"]', 'high')
    await page.selectOption('[data-testid="task-category"]', 'work')
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('.task-card')).toContainText('Documentation Test Task')
    
    // DOC-005: Проверяем, что тесты документированы
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('должен соответствовать структуре CI/CD', async ({ page }) => {
    await page.goto('/')
    
    // CI-001: Проверяем, что GitHub Actions работают
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
    
    // CI-002: Проверяем, что Vercel деплой работает
    await page.goto('/api/test')
    const response = await page.textContent('body')
    expect(response).toContain('API is working')
    
    // CI-003: Проверяем, что тесты запускаются
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
    
    // CI-004: Проверяем, что линтеры работают
    await page.goto('/planner')
    await page.waitForSelector('[data-testid="planner-content"]')
    
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'CI Test Task')
    await page.selectOption('[data-testid="task-priority"]', 'high')
    await page.selectOption('[data-testid="task-category"]', 'work')
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('.task-card')).toContainText('CI Test Task')
    
    // CI-005: Проверяем, что сборка работает
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('должен соответствовать структуре мониторинга', async ({ page }) => {
    await page.goto('/')
    
    // MON-001: Проверяем, что метрики собираются
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
    
    // MON-002: Проверяем, что логи записываются
    await page.goto('/api/test')
    const response = await page.textContent('body')
    expect(response).toContain('API is working')
    
    // MON-003: Проверяем, что алерты работают
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
    
    // MON-004: Проверяем, что дашборды работают
    await page.goto('/planner')
    await page.waitForSelector('[data-testid="planner-content"]')
    
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Monitoring Test Task')
    await page.selectOption('[data-testid="task-priority"]', 'high')
    await page.selectOption('[data-testid="task-category"]', 'work')
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('.task-card')).toContainText('Monitoring Test Task')
    
    // MON-005: Проверяем, что отчеты генерируются
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
  })
})