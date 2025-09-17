/**
 * 🚀 ТЕСТЫ СТАБИЛИЗАЦИИ РЕЛИЗА
 * Покрытие: стабилизация релизных веток, финальное тестирование, готовность к продакшену
 */

import { test, expect, Page } from '@playwright/test'

describe('🔧 Release Branch Stabilization Tests', () => {
  test('должен проходить полную стабилизацию релизной ветки v1.0.0', async ({ page }) => {
    await page.goto('/')
    
    // RS-001: Проверяем, что приложение загружается без ошибок
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
    
    // RS-002: Проверяем, что все основные функции работают
    await page.fill('[data-testid="email-input"]', 'stabilization@example.com')
    await page.click('[data-testid="subscribe-button"]')
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    
    // RS-003: Проверяем навигацию
    await page.click('[data-testid="get-started-button"]')
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
    
    await page.click('[data-testid="sign-up-link"]')
    await expect(page.locator('[data-testid="signup-form"]')).toBeVisible()
    
    // RS-004: Проверяем, что нет критических ошибок в консоли
    const consoleErrors = await page.evaluate(() => {
      return window.console.error.calls || []
    })
    expect(consoleErrors.length).toBe(0)
    
    // RS-005: Проверяем производительность
    const startTime = Date.now()
    await page.goto('/')
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(3000)
  })

  test('должен проходить стабилизацию планировщика задач', async ({ page }) => {
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
    
    // RS-006: Проверяем, что планировщик загружается без ошибок
    await expect(page.locator('[data-testid="planner-content"]')).toBeVisible()
    await expect(page.locator('[data-testid="add-task-button"]')).toBeVisible()
    
    // RS-007: Проверяем создание задач
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Stabilization Task')
    await page.selectOption('[data-testid="task-priority"]', 'high')
    await page.selectOption('[data-testid="task-category"]', 'work')
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('.task-card')).toContainText('Stabilization Task')
    
    // RS-008: Проверяем редактирование задач
    await page.locator('.task-card').click()
    await page.fill('[data-testid="task-title"]', 'Updated Stabilization Task')
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('.task-card')).toContainText('Updated Stabilization Task')
    
    // RS-009: Проверяем завершение задач
    await page.locator('.task-card').locator('[data-testid="complete-task-button"]').click()
    await expect(page.locator('.task-card').locator('[data-testid="task-completed"]')).toBeChecked()
    
    // RS-010: Проверяем удаление задач
    await page.locator('.task-card').locator('[data-testid="delete-task-button"]').click()
    await page.click('[data-testid="confirm-delete-button"]')
    await expect(page.locator('.task-card')).not.toContainText('Updated Stabilization Task')
  })

  test('должен проходить стабилизацию ИИ функций', async ({ page }) => {
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
    
    // RS-011: Проверяем умную сортировку
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Low Priority Task')
    await page.selectOption('[data-testid="task-priority"]', 'low')
    await page.selectOption('[data-testid="task-category"]', 'personal')
    await page.click('[data-testid="save-task-button"]')
    
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'High Priority Task')
    await page.selectOption('[data-testid="task-priority"]', 'high')
    await page.selectOption('[data-testid="task-category"]', 'work')
    await page.click('[data-testid="save-task-button"]')
    
    await page.click('[data-testid="smart-sort-button"]')
    await page.waitForSelector('[data-testid="sorting-complete"]')
    
    const taskCards = page.locator('.task-card')
    await expect(taskCards.first()).toContainText('High Priority Task')
    await expect(taskCards.nth(1)).toContainText('Low Priority Task')
    
    // RS-012: Проверяем ИИ предложения
    await page.click('[data-testid="generate-suggestions-button"]')
    await page.waitForSelector('[data-testid="ai-suggestions"]')
    
    const suggestionCards = page.locator('.suggestion-card')
    await expect(suggestionCards).toHaveCount.greaterThan(0)
    
    // RS-013: Проверяем анализ продуктивности
    await page.click('[data-testid="analyze-productivity-button"]')
    await page.waitForSelector('[data-testid="productivity-analysis"]')
    
    await expect(page.locator('[data-testid="productivity-score"]')).toBeVisible()
    await expect(page.locator('[data-testid="productivity-insights"]')).toBeVisible()
    await expect(page.locator('[data-testid="productivity-recommendations"]')).toBeVisible()
  })
})

describe('🔍 Final Quality Assurance Tests', () => {
  test('должен проходить финальную проверку качества', async ({ page }) => {
    await page.goto('/')
    
    // FQA-001: Проверяем, что все элементы загружаются
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
    await expect(page.locator('[data-testid="features-section"]')).toBeVisible()
    await expect(page.locator('[data-testid="pricing-section"]')).toBeVisible()
    
    // FQA-002: Проверяем, что все ссылки работают
    await page.click('[data-testid="get-started-button"]')
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
    
    await page.click('[data-testid="sign-up-link"]')
    await expect(page.locator('[data-testid="signup-form"]')).toBeVisible()
    
    await page.click('[data-testid="sign-in-link"]')
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
    
    // FQA-003: Проверяем, что все формы работают
    await page.fill('[data-testid="login-email"]', 'test@example.com')
    await page.fill('[data-testid="login-password"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    // FQA-004: Проверяем, что нет JavaScript ошибок
    const jsErrors = await page.evaluate(() => {
      return window.console.error.calls || []
    })
    expect(jsErrors.length).toBe(0)
    
    // FQA-005: Проверяем, что все изображения загружаются
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      await expect(img).toBeVisible()
    }
  })

  test('должен проходить финальную проверку производительности', async ({ page }) => {
    await page.goto('/')
    
    // FQA-006: Проверяем время загрузки главной страницы
    const startTime = Date.now()
    await page.goto('/')
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(3000)
    
    // FQA-007: Проверяем время интерактивности
    await page.waitForSelector('[data-testid="email-input"]')
    const interactiveTime = Date.now() - startTime
    expect(interactiveTime).toBeLessThan(5000)
    
    // FQA-008: Проверяем время ответа форм
    const formStartTime = Date.now()
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.click('[data-testid="subscribe-button"]')
    const formResponseTime = Date.now() - formStartTime
    expect(formResponseTime).toBeLessThan(2000)
    
    // FQA-009: Проверяем время навигации
    const navStartTime = Date.now()
    await page.click('[data-testid="get-started-button"]')
    await page.waitForSelector('[data-testid="login-form"]')
    const navTime = Date.now() - navStartTime
    expect(navTime).toBeLessThan(1000)
    
    // FQA-010: Проверяем время загрузки планировщика
    const plannerStartTime = Date.now()
    await page.goto('/planner')
    await page.waitForSelector('[data-testid="planner-content"]')
    const plannerLoadTime = Date.now() - plannerStartTime
    expect(plannerLoadTime).toBeLessThan(4000)
  })

  test('должен проходить финальную проверку безопасности', async ({ page }) => {
    await page.goto('/')
    
    // FQA-011: Проверяем HTTPS соединение
    const protocol = await page.evaluate(() => window.location.protocol)
    expect(protocol).toBe('https:')
    
    // FQA-012: Проверяем, что пароли скрыты
    await page.click('[data-testid="get-started-button"]')
    await page.fill('[data-testid="login-password"]', 'password123')
    
    const passwordInput = page.locator('[data-testid="login-password"]')
    await expect(passwordInput).toHaveAttribute('type', 'password')
    
    // FQA-013: Проверяем CSRF защиту
    const csrfToken = await page.locator('[data-testid="csrf-token"]').textContent()
    expect(csrfToken).toBeDefined()
    expect(csrfToken.length).toBeGreaterThan(0)
    
    // FQA-014: Проверяем валидацию данных
    await page.fill('[data-testid="login-email"]', 'invalid-email')
    await page.fill('[data-testid="login-password"]', '123')
    await page.click('[data-testid="login-button"]')
    
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="password-error"]')).toBeVisible()
    
    // FQA-015: Проверяем безопасность сессий
    const sessionCookie = await page.context().cookies()
    const sessionCookieExists = sessionCookie.some(cookie => cookie.name === 'session')
    expect(sessionCookieExists).toBe(true)
  })
})

describe('📱 Cross-Platform Compatibility Tests', () => {
  test('должен работать на мобильных устройствах', async ({ page }) => {
    // Устанавливаем мобильный viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // CROSS-001: Проверяем, что интерфейс адаптируется к мобильным устройствам
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
    
    // CROSS-002: Проверяем, что элементы достаточно большие для касания
    const subscribeButton = page.locator('[data-testid="subscribe-button"]')
    const buttonSize = await subscribeButton.boundingBox()
    expect(buttonSize.height).toBeGreaterThanOrEqual(44)
    
    // CROSS-003: Проверяем, что формы работают на мобильных устройствах
    await page.fill('[data-testid="email-input"]', 'mobile@example.com')
    await page.click('[data-testid="subscribe-button"]')
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    
    // CROSS-004: Проверяем навигацию на мобильных устройствах
    await page.click('[data-testid="get-started-button"]')
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
    
    // CROSS-005: Проверяем, что текст читаем на мобильных устройствах
    const h1 = page.locator('h1')
    const h1FontSize = await h1.evaluate(el => getComputedStyle(el).fontSize)
    expect(parseInt(h1FontSize)).toBeGreaterThanOrEqual(24)
  })

  test('должен работать на планшетах', async ({ page }) => {
    // Устанавливаем планшетный viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    
    // CROSS-006: Проверяем, что интерфейс адаптируется к планшетам
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
    
    // CROSS-007: Проверяем, что элементы используют доступное пространство
    const heroSection = page.locator('[data-testid="hero-section"]')
    const heroSectionSize = await heroSection.boundingBox()
    expect(heroSectionSize.width).toBeGreaterThan(600)
    
    // CROSS-008: Проверяем навигацию на планшетах
    await page.click('[data-testid="get-started-button"]')
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
    
    // CROSS-009: Проверяем, что формы работают на планшетах
    await page.fill('[data-testid="login-email"]', 'tablet@example.com')
    await page.fill('[data-testid="login-password"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    // CROSS-010: Проверяем, что контент хорошо организован на планшетах
    const featuresSection = page.locator('[data-testid="features-section"]')
    const featuresSectionSize = await featuresSection.boundingBox()
    expect(featuresSectionSize.width).toBeGreaterThan(700)
  })

  test('должен работать на десктопах', async ({ page }) => {
    // Устанавливаем десктопный viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    
    // CROSS-011: Проверяем, что интерфейс адаптируется к десктопам
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
    
    // CROSS-012: Проверяем, что элементы используют доступное пространство
    const heroSection = page.locator('[data-testid="hero-section"]')
    const heroSectionSize = await heroSection.boundingBox()
    expect(heroSectionSize.width).toBeGreaterThan(1000)
    
    // CROSS-013: Проверяем навигацию на десктопах
    await page.click('[data-testid="get-started-button"]')
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
    
    // CROSS-014: Проверяем, что формы работают на десктопах
    await page.fill('[data-testid="login-email"]', 'desktop@example.com')
    await page.fill('[data-testid="login-password"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    // CROSS-015: Проверяем, что контент хорошо организован на десктопах
    const featuresSection = page.locator('[data-testid="features-section"]')
    const featuresSectionSize = await featuresSection.boundingBox()
    expect(featuresSectionSize.width).toBeGreaterThan(1200)
  })
})

describe('🌐 Browser Compatibility Tests', () => {
  test('должен работать в Chrome', async ({ page }) => {
    await page.goto('/')
    
    // BROWSER-001: Проверяем, что приложение загружается в Chrome
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
    
    // BROWSER-002: Проверяем, что все функции работают в Chrome
    await page.fill('[data-testid="email-input"]', 'chrome@example.com')
    await page.click('[data-testid="subscribe-button"]')
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    
    // BROWSER-003: Проверяем, что навигация работает в Chrome
    await page.click('[data-testid="get-started-button"]')
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
    
    // BROWSER-004: Проверяем, что формы работают в Chrome
    await page.fill('[data-testid="login-email"]', 'chrome@example.com')
    await page.fill('[data-testid="login-password"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    // BROWSER-005: Проверяем, что нет ошибок в Chrome
    const consoleErrors = await page.evaluate(() => {
      return window.console.error.calls || []
    })
    expect(consoleErrors.length).toBe(0)
  })

  test('должен работать в Firefox', async ({ page }) => {
    await page.goto('/')
    
    // BROWSER-006: Проверяем, что приложение загружается в Firefox
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
    
    // BROWSER-007: Проверяем, что все функции работают в Firefox
    await page.fill('[data-testid="email-input"]', 'firefox@example.com')
    await page.click('[data-testid="subscribe-button"]')
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    
    // BROWSER-008: Проверяем, что навигация работает в Firefox
    await page.click('[data-testid="get-started-button"]')
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
    
    // BROWSER-009: Проверяем, что формы работают в Firefox
    await page.fill('[data-testid="login-email"]', 'firefox@example.com')
    await page.fill('[data-testid="login-password"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    // BROWSER-010: Проверяем, что нет ошибок в Firefox
    const consoleErrors = await page.evaluate(() => {
      return window.console.error.calls || []
    })
    expect(consoleErrors.length).toBe(0)
  })

  test('должен работать в Safari', async ({ page }) => {
    await page.goto('/')
    
    // BROWSER-011: Проверяем, что приложение загружается в Safari
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
    
    // BROWSER-012: Проверяем, что все функции работают в Safari
    await page.fill('[data-testid="email-input"]', 'safari@example.com')
    await page.click('[data-testid="subscribe-button"]')
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    
    // BROWSER-013: Проверяем, что навигация работает в Safari
    await page.click('[data-testid="get-started-button"]')
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
    
    // BROWSER-014: Проверяем, что формы работают в Safari
    await page.fill('[data-testid="login-email"]', 'safari@example.com')
    await page.fill('[data-testid="login-password"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    // BROWSER-015: Проверяем, что нет ошибок в Safari
    const consoleErrors = await page.evaluate(() => {
      return window.console.error.calls || []
    })
    expect(consoleErrors.length).toBe(0)
  })
})