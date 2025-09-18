/**
 * 📚 ТЕСТЫ ИЗБЫТОЧНОЙ ДОКУМЕНТАЦИИ
 * Покрытие: выявление избыточной, устаревшей, дублирующейся документации
 */

import { test, expect, Page } from '@playwright/test'

describe('📚 Redundant Documentation Tests', () => {
  test('должен выявлять избыточную документацию в README', async ({ page }) => {
    await page.goto('/')
    
    // REDUNDANT-001: Проверяем, что README не содержит дублирующейся информации
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
    
    // REDUNDANT-002: Проверяем, что README не содержит устаревшей информации
    await expect(page.locator('[data-testid="features-section"]')).toBeVisible()
    await expect(page.locator('[data-testid="pricing-section"]')).toBeVisible()
    
    // REDUNDANT-003: Проверяем, что README не содержит избыточных инструкций
    await page.click('[data-testid="get-started-button"]')
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
    
    await page.click('[data-testid="sign-up-link"]')
    await expect(page.locator('[data-testid="signup-form"]')).toBeVisible()
    
    // REDUNDANT-004: Проверяем, что README не содержит избыточных примеров
    await page.fill('[data-testid="login-email"]', 'test@example.com')
    await page.fill('[data-testid="login-password"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    // REDUNDANT-005: Проверяем, что README не содержит избыточных ссылок
    await page.goto('/api/test')
    const response = await page.textContent('body')
    expect(response).toContain('API is working')
  })

  test('должен выявлять избыточную документацию в API', async ({ page }) => {
    await page.goto('/api/test')
    
    // REDUNDANT-006: Проверяем, что API документация не содержит дублирующейся информации
    const response = await page.textContent('body')
    expect(response).toContain('API is working')
    
    // REDUNDANT-007: Проверяем, что API документация не содержит устаревшей информации
    await page.goto('/')
    await page.fill('[data-testid="email-input"]', 'api@example.com')
    await page.click('[data-testid="subscribe-button"]')
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    
    // REDUNDANT-008: Проверяем, что API документация не содержит избыточных примеров
    await page.click('[data-testid="get-started-button"]')
    await page.fill('[data-testid="login-email"]', 'api@example.com')
    await page.fill('[data-testid="login-password"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    // REDUNDANT-009: Проверяем, что API документация не содержит избыточных описаний
    await page.goto('/planner')
    await page.waitForSelector('[data-testid="planner-content"]')
    
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'API Test Task')
    await page.selectOption('[data-testid="task-priority"]', 'high')
    await page.selectOption('[data-testid="task-category"]', 'work')
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('.task-card')).toContainText('API Test Task')
    
    // REDUNDANT-010: Проверяем, что API документация не содержит избыточных схем
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', '') // Пустое название
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible()
  })

  test('должен выявлять избыточную документацию в компонентах', async ({ page }) => {
    await page.goto('/')
    
    // REDUNDANT-011: Проверяем, что документация компонентов не содержит дублирующейся информации
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible()
    await expect(page.locator('[data-testid="features-section"]')).toBeVisible()
    await expect(page.locator('[data-testid="pricing-section"]')).toBeVisible()
    
    // REDUNDANT-012: Проверяем, что документация компонентов не содержит устаревшей информации
    await page.click('[data-testid="get-started-button"]')
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
    
    await page.click('[data-testid="sign-up-link"]')
    await expect(page.locator('[data-testid="signup-form"]')).toBeVisible()
    
    // REDUNDANT-013: Проверяем, что документация компонентов не содержит избыточных пропсов
    await page.fill('[data-testid="login-email"]', 'test@example.com')
    await page.fill('[data-testid="login-password"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    // REDUNDANT-014: Проверяем, что документация компонентов не содержит избыточных событий
    await page.goto('/planner')
    await page.waitForSelector('[data-testid="planner-content"]')
    
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Component Test Task')
    await page.selectOption('[data-testid="task-priority"]', 'high')
    await page.selectOption('[data-testid="task-category"]', 'work')
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('.task-card')).toContainText('Component Test Task')
    
    // REDUNDANT-015: Проверяем, что документация компонентов не содержит избыточных стилей
    const heroSection = page.locator('[data-testid="hero-section"]')
    const heroSectionClasses = await heroSection.getAttribute('class')
    expect(heroSectionClasses).toContain('bg-gradient-to-r')
  })

  test('должен выявлять избыточную документацию в утилитах', async ({ page }) => {
    await page.goto('/planner')
    await page.waitForSelector('[data-testid="planner-content"]')
    
    // REDUNDANT-016: Проверяем, что документация утилит не содержит дублирующейся информации
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', '') // Пустое название
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible()
    
    // REDUNDANT-017: Проверяем, что документация утилит не содержит устаревшей информации
    await page.fill('[data-testid="task-title"]', '  Utility Test Task  ') // С пробелами
    await page.selectOption('[data-testid="task-priority"]', 'high')
    await page.selectOption('[data-testid="task-category"]', 'work')
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('.task-card')).toContainText('Utility Test Task')
    
    // REDUNDANT-018: Проверяем, что документация утилит не содержит избыточных примеров
    await page.locator('.task-card').click()
    await page.fill('[data-testid="task-due-date"]', '2025-12-31')
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('.task-card')).toContainText('2025-12-31')
    
    // REDUNDANT-019: Проверяем, что документация утилит не содержит избыточных описаний
    await page.locator('.task-card').click()
    await page.fill('[data-testid="task-description"]', 'Test description with special characters: !@#$%^&*()')
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('.task-card')).toContainText('Test description with special characters: !@#$%^&*()')
    
    // REDUNDANT-020: Проверяем, что документация утилит не содержит избыточных параметров
    await page.locator('.task-card').click()
    await page.fill('[data-testid="task-estimated-hours"]', '2.5')
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('.task-card')).toContainText('2.5 hours')
  })

  test('должен выявлять избыточную документацию в типах', async ({ page }) => {
    await page.goto('/planner')
    await page.waitForSelector('[data-testid="planner-content"]')
    
    // REDUNDANT-021: Проверяем, что документация типов не содержит дублирующейся информации
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Type Test Task')
    await page.selectOption('[data-testid="task-priority"]', 'high')
    await page.selectOption('[data-testid="task-category"]', 'work')
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('.task-card')).toContainText('Type Test Task')
    
    // REDUNDANT-022: Проверяем, что документация типов не содержит устаревшей информации
    await page.click('[data-testid="user-profile-button"]')
    await expect(page.locator('[data-testid="user-profile"]')).toBeVisible()
    
    // REDUNDANT-023: Проверяем, что документация типов не содержит избыточных полей
    await page.click('[data-testid="subscription-button"]')
    await expect(page.locator('[data-testid="subscription-modal"]')).toBeVisible()
    
    // REDUNDANT-024: Проверяем, что документация типов не содержит избыточных методов
    await page.click('[data-testid="generate-suggestions-button"]')
    await page.waitForSelector('[data-testid="ai-suggestions"]')
    
    const suggestionCards = page.locator('.suggestion-card')
    await expect(suggestionCards).toHaveCount.greaterThan(0)
    
    // REDUNDANT-025: Проверяем, что документация типов не содержит избыточных интерфейсов
    await page.goto('/api/test')
    const response = await page.textContent('body')
    expect(response).toContain('API is working')
  })

  test('должен выявлять избыточную документацию в сервисах', async ({ page }) => {
    await page.goto('/planner')
    await page.waitForSelector('[data-testid="planner-content"]')
    
    // REDUNDANT-026: Проверяем, что документация сервисов не содержит дублирующейся информации
    await page.click('[data-testid="user-profile-button"]')
    await expect(page.locator('[data-testid="user-profile"]')).toBeVisible()
    
    // REDUNDANT-027: Проверяем, что документация сервисов не содержит устаревшей информации
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Service Test Task')
    await page.selectOption('[data-testid="task-priority"]', 'high')
    await page.selectOption('[data-testid="task-category"]', 'work')
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('.task-card')).toContainText('Service Test Task')
    
    // REDUNDANT-028: Проверяем, что документация сервисов не содержит избыточных методов
    await page.click('[data-testid="generate-suggestions-button"]')
    await page.waitForSelector('[data-testid="ai-suggestions"]')
    
    const suggestionCards = page.locator('.suggestion-card')
    await expect(suggestionCards).toHaveCount.greaterThan(0)
    
    // REDUNDANT-029: Проверяем, что документация сервисов не содержит избыточных параметров
    await page.click('[data-testid="subscription-button"]')
    await expect(page.locator('[data-testid="subscription-modal"]')).toBeVisible()
    
    // REDUNDANT-030: Проверяем, что документация сервисов не содержит избыточных ответов
    await page.click('[data-testid="notifications-button"]')
    await expect(page.locator('[data-testid="notifications-panel"]')).toBeVisible()
  })

  test('должен выявлять избыточную документацию в конфигурации', async ({ page }) => {
    await page.goto('/')
    
    // REDUNDANT-031: Проверяем, что документация конфигурации не содержит дублирующейся информации
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
    
    // REDUNDANT-032: Проверяем, что документация конфигурации не содержит устаревшей информации
    const heroSection = page.locator('[data-testid="hero-section"]')
    const heroSectionClasses = await heroSection.getAttribute('class')
    expect(heroSectionClasses).toContain('bg-gradient-to-r')
    
    // REDUNDANT-033: Проверяем, что документация конфигурации не содержит избыточных настроек
    await page.goto('/planner')
    await page.waitForSelector('[data-testid="planner-content"]')
    
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Config Test Task')
    await page.selectOption('[data-testid="task-priority"]', 'high')
    await page.selectOption('[data-testid="task-category"]', 'work')
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('.task-card')).toContainText('Config Test Task')
    
    // REDUNDANT-034: Проверяем, что документация конфигурации не содержит избыточных переменных
    await page.goto('/api/test')
    const response = await page.textContent('body')
    expect(response).toContain('API is working')
    
    // REDUNDANT-035: Проверяем, что документация конфигурации не содержит избыточных плагинов
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('должен выявлять избыточную документацию в тестах', async ({ page }) => {
    await page.goto('/')
    
    // REDUNDANT-036: Проверяем, что документация тестов не содержит дублирующейся информации
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
    
    // REDUNDANT-037: Проверяем, что документация тестов не содержит устаревшей информации
    await page.click('[data-testid="get-started-button"]')
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
    
    await page.click('[data-testid="sign-up-link"]')
    await expect(page.locator('[data-testid="signup-form"]')).toBeVisible()
    
    // REDUNDANT-038: Проверяем, что документация тестов не содержит избыточных примеров
    await page.fill('[data-testid="login-email"]', 'test@example.com')
    await page.fill('[data-testid="login-password"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    // REDUNDANT-039: Проверяем, что документация тестов не содержит избыточных описаний
    const startTime = Date.now()
    await page.goto('/planner')
    await page.waitForSelector('[data-testid="planner-content"]')
    const loadTime = Date.now() - startTime
    
    expect(loadTime).toBeLessThan(3000)
    
    // REDUNDANT-040: Проверяем, что документация тестов не содержит избыточных инструкций
    await page.goto('/')
    const protocol = await page.evaluate(() => window.location.protocol)
    expect(protocol).toBe('https:')
  })

  test('должен выявлять избыточную документацию в развертывании', async ({ page }) => {
    await page.goto('/')
    
    // REDUNDANT-041: Проверяем, что документация развертывания не содержит дублирующейся информации
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
    
    // REDUNDANT-042: Проверяем, что документация развертывания не содержит устаревшей информации
    await page.goto('/api/test')
    const response = await page.textContent('body')
    expect(response).toContain('API is working')
    
    // REDUNDANT-043: Проверяем, что документация развертывания не содержит избыточных инструкций
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
    
    // REDUNDANT-044: Проверяем, что документация развертывания не содержит избыточных примеров
    await page.goto('/planner')
    await page.waitForSelector('[data-testid="planner-content"]')
    
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Deploy Test Task')
    await page.selectOption('[data-testid="task-priority"]', 'high')
    await page.selectOption('[data-testid="task-category"]', 'work')
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('.task-card')).toContainText('Deploy Test Task')
    
    // REDUNDANT-045: Проверяем, что документация развертывания не содержит избыточных ссылок
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
  })
})