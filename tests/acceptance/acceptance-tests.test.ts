/**
 * ✅ ТЕСТЫ ПРИЕМОЧНОГО ТЕСТИРОВАНИЯ
 * Покрытие: user acceptance criteria, business requirements, stakeholder validation
 */

import { test, expect, Page } from '@playwright/test'

describe('🎯 User Acceptance Criteria Tests', () => {
  test('должен соответствовать критериям приемки для регистрации пользователя', async ({ page }) => {
    await page.goto('/')
    
    // UAC-001: Пользователь должен иметь возможность зарегистрироваться с валидными данными
    await page.click('[data-testid="get-started-button"]')
    await page.click('[data-testid="sign-up-link"]')
    
    // Проверяем наличие всех обязательных полей
    await expect(page.locator('[data-testid="signup-email"]')).toBeVisible()
    await expect(page.locator('[data-testid="signup-password"]')).toBeVisible()
    await expect(page.locator('[data-testid="signup-name"]')).toBeVisible()
    await expect(page.locator('[data-testid="terms-checkbox"]')).toBeVisible()
    
    // UAC-002: Пользователь должен получить подтверждение успешной регистрации
    await page.fill('[data-testid="signup-email"]', 'acceptance@example.com')
    await page.fill('[data-testid="signup-password"]', 'AcceptanceTest123!')
    await page.fill('[data-testid="signup-name"]', 'Acceptance User')
    await page.check('[data-testid="terms-checkbox"]')
    await page.click('[data-testid="signup-button"]')
    
    await expect(page.locator('[data-testid="signup-success"]')).toBeVisible()
    await expect(page.locator('[data-testid="signup-success"]')).toContainText('Account created successfully')
    
    // UAC-003: Пользователь должен быть перенаправлен на страницу входа после регистрации
    await page.click('[data-testid="go-to-login-button"]')
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
  })

  test('должен соответствовать критериям приемки для входа в систему', async ({ page }) => {
    await page.goto('/')
    
    // UAC-004: Пользователь должен иметь возможность войти в систему с валидными данными
    await page.click('[data-testid="get-started-button"]')
    
    await page.fill('[data-testid="login-email"]', 'user@example.com')
    await page.fill('[data-testid="login-password"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    // UAC-005: Пользователь должен быть перенаправлен в планировщик после успешного входа
    await expect(page.locator('[data-testid="planner-content"]')).toBeVisible()
    await expect(page.locator('[data-testid="welcome-message"]')).toContainText('Welcome back!')
    
    // UAC-006: Пользователь должен видеть свои данные в интерфейсе
    await expect(page.locator('[data-testid="user-name"]')).toContainText('Test User')
    await expect(page.locator('[data-testid="user-email"]')).toContainText('user@example.com')
  })

  test('должен соответствовать критериям приемки для управления задачами', async ({ page }) => {
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
    
    // UAC-007: Пользователь должен иметь возможность создавать задачи
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Acceptance Test Task')
    await page.fill('[data-testid="task-description"]', 'This task meets acceptance criteria')
    await page.selectOption('[data-testid="task-priority"]', 'high')
    await page.selectOption('[data-testid="task-category"]', 'work')
    await page.fill('[data-testid="task-due-date"]', '2024-12-31')
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('.task-card')).toContainText('Acceptance Test Task')
    await expect(page.locator('.task-card')).toContainText('This task meets acceptance criteria')
    
    // UAC-008: Пользователь должен иметь возможность редактировать задачи
    await page.locator('.task-card').click()
    await page.fill('[data-testid="task-title"]', 'Updated Acceptance Task')
    await page.fill('[data-testid="task-description"]', 'This task has been updated')
    await page.click('[data-testid="save-task-button"]')
    
    await expect(page.locator('.task-card')).toContainText('Updated Acceptance Task')
    await expect(page.locator('.task-card')).toContainText('This task has been updated')
    
    // UAC-009: Пользователь должен иметь возможность завершать задачи
    await page.locator('.task-card').locator('[data-testid="complete-task-button"]').click()
    await expect(page.locator('.task-card').locator('[data-testid="task-completed"]')).toBeChecked()
    
    // UAC-010: Пользователь должен иметь возможность удалять задачи
    await page.locator('.task-card').locator('[data-testid="delete-task-button"]').click()
    await page.click('[data-testid="confirm-delete-button"]')
    await expect(page.locator('.task-card')).not.toContainText('Updated Acceptance Task')
  })

  test('должен соответствовать критериям приемки для ИИ функций', async ({ page }) => {
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
    
    // UAC-011: Пользователь должен иметь доступ к умной сортировке
    await expect(page.locator('[data-testid="smart-sort-button"]')).toBeVisible()
    
    // Создаем задачи для тестирования сортировки
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
    
    // UAC-012: Умная сортировка должна работать корректно
    await page.click('[data-testid="smart-sort-button"]')
    await page.waitForSelector('[data-testid="sorting-complete"]')
    
    const taskCards = page.locator('.task-card')
    await expect(taskCards.first()).toContainText('High Priority Task')
    await expect(taskCards.nth(1)).toContainText('Low Priority Task')
    
    // UAC-013: Пользователь должен иметь доступ к ИИ предложениям
    await expect(page.locator('[data-testid="generate-suggestions-button"]')).toBeVisible()
    
    await page.click('[data-testid="generate-suggestions-button"]')
    await page.waitForSelector('[data-testid="ai-suggestions"]')
    
    const suggestionCards = page.locator('.suggestion-card')
    await expect(suggestionCards).toHaveCount.greaterThan(0)
    
    // UAC-014: Пользователь должен иметь доступ к анализу продуктивности
    await expect(page.locator('[data-testid="analyze-productivity-button"]')).toBeVisible()
    
    await page.click('[data-testid="analyze-productivity-button"]')
    await page.waitForSelector('[data-testid="productivity-analysis"]')
    
    await expect(page.locator('[data-testid="productivity-score"]')).toBeVisible()
    await expect(page.locator('[data-testid="productivity-insights"]')).toBeVisible()
    await expect(page.locator('[data-testid="productivity-recommendations"]')).toBeVisible()
  })
})

describe('💼 Business Requirements Tests', () => {
  test('должен соответствовать бизнес-требованиям для бесплатного плана', async ({ page }) => {
    await page.goto('/planner')
    
    // Мокаем авторизацию с бесплатным планом
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
    
    // BR-001: Бесплатный план должен иметь ограничения на количество задач
    await expect(page.locator('[data-testid="task-limit"]')).toBeVisible()
    await expect(page.locator('[data-testid="task-limit"]')).toContainText('50')
    
    // BR-002: Бесплатный план должен иметь ограничения на ИИ запросы
    await expect(page.locator('[data-testid="ai-limit"]')).toBeVisible()
    await expect(page.locator('[data-testid="ai-limit"]')).toContainText('100')
    
    // BR-003: Бесплатный план должен показывать предложения обновления
    await expect(page.locator('[data-testid="upgrade-prompt"]')).toBeVisible()
    await expect(page.locator('[data-testid="upgrade-prompt"]')).toContainText('Upgrade to Premium')
    
    // BR-004: Бесплатный план должен иметь базовые функции
    await expect(page.locator('[data-testid="basic-features"]')).toBeVisible()
    await expect(page.locator('[data-testid="basic-features"]')).toContainText('Basic task management')
    await expect(page.locator('[data-testid="basic-features"]')).toContainText('Basic AI suggestions')
  })

  test('должен соответствовать бизнес-требованиям для премиум плана', async ({ page }) => {
    await page.goto('/planner')
    
    // Мокаем авторизацию с премиум планом
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
    
    // BR-005: Премиум план должен снимать ограничения на задачи
    await expect(page.locator('[data-testid="task-limit"]')).toContainText('Unlimited')
    
    // BR-006: Премиум план должен снимать ограничения на ИИ запросы
    await expect(page.locator('[data-testid="ai-limit"]')).toContainText('Unlimited')
    
    // BR-007: Премиум план должен иметь расширенные функции
    await expect(page.locator('[data-testid="premium-features"]')).toBeVisible()
    await expect(page.locator('[data-testid="premium-features"]')).toContainText('Advanced AI')
    await expect(page.locator('[data-testid="premium-features"]')).toContainText('Priority Support')
    
    // BR-008: Премиум план должен показывать статус подписки
    await expect(page.locator('[data-testid="subscription-status"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscription-status"]')).toContainText('Premium')
  })

  test('должен соответствовать бизнес-требованиям для монетизации', async ({ page }) => {
    await page.goto('/')
    
    // BR-009: Главная страница должна показывать тарифные планы
    await expect(page.locator('[data-testid="pricing-section"]')).toBeVisible()
    
    const planCards = page.locator('[data-testid="plan-card"]')
    await expect(planCards).toHaveCount(4) // free, premium, pro, enterprise
    
    // BR-010: Тарифные планы должны иметь четкие цены
    const freePlan = page.locator('[data-testid="plan-free"]')
    await expect(freePlan).toContainText('Free')
    await expect(freePlan).toContainText('$0')
    
    const premiumPlan = page.locator('[data-testid="plan-premium"]')
    await expect(premiumPlan).toContainText('Premium')
    await expect(premiumPlan).toContainText('$9.99')
    
    const proPlan = page.locator('[data-testid="plan-pro"]')
    await expect(proPlan).toContainText('Pro')
    await expect(proPlan).toContainText('$19.99')
    
    const enterprisePlan = page.locator('[data-testid="plan-enterprise"]')
    await expect(enterprisePlan).toContainText('Enterprise')
    await expect(enterprisePlan).toContainText('$49.99')
    
    // BR-011: Тарифные планы должны иметь кнопки подписки
    await expect(premiumPlan.locator('[data-testid="select-plan-button"]')).toBeVisible()
    await expect(proPlan.locator('[data-testid="select-plan-button"]')).toBeVisible()
    await expect(enterprisePlan.locator('[data-testid="select-plan-button"]')).toBeVisible()
  })
})

describe('🎨 User Experience Requirements Tests', () => {
  test('должен соответствовать требованиям пользовательского опыта', async ({ page }) => {
    await page.goto('/')
    
    // UX-001: Главная страница должна загружаться быстро
    const startTime = Date.now()
    await page.goto('/')
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(3000)
    
    // UX-002: Интерфейс должен быть отзывчивым
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
    
    // UX-003: Навигация должна быть интуитивной
    await page.click('[data-testid="get-started-button"]')
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
    
    await page.click('[data-testid="sign-up-link"]')
    await expect(page.locator('[data-testid="signup-form"]')).toBeVisible()
    
    await page.click('[data-testid="sign-in-link"]')
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
    
    // UX-004: Формы должны иметь валидацию
    await page.fill('[data-testid="login-email"]', 'invalid-email')
    await page.fill('[data-testid="login-password"]', '123')
    await page.click('[data-testid="login-button"]')
    
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="password-error"]')).toBeVisible()
    
    // UX-005: Сообщения об ошибках должны быть понятными
    await expect(page.locator('[data-testid="email-error"]')).toContainText('Please enter a valid email address')
    await expect(page.locator('[data-testid="password-error"]')).toContainText('Password must be at least 8 characters')
  })

  test('должен соответствовать требованиям доступности', async ({ page }) => {
    await page.goto('/')
    
    // A11Y-001: Элементы должны иметь правильные ARIA атрибуты
    const emailInput = page.locator('[data-testid="email-input"]')
    await expect(emailInput).toHaveAttribute('type', 'email')
    await expect(emailInput).toHaveAttribute('required')
    
    const subscribeButton = page.locator('[data-testid="subscribe-button"]')
    await expect(subscribeButton).toHaveAttribute('type', 'submit')
    
    // A11Y-002: Заголовки должны иметь правильную иерархию
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
    
    const h2 = page.locator('h2')
    await expect(h2).toHaveCount.greaterThan(0)
    
    // A11Y-003: Формы должны иметь метки
    const emailLabel = page.locator('label[for="email"]')
    await expect(emailLabel).toBeVisible()
    
    // A11Y-004: Кнопки должны иметь описательный текст
    await expect(subscribeButton).toContainText('Subscribe')
    
    // A11Y-005: Цвета должны иметь достаточный контраст
    const emailInputColor = await emailInput.evaluate(el => getComputedStyle(el).color)
    const emailInputBgColor = await emailInput.evaluate(el => getComputedStyle(el).backgroundColor)
    
    // Проверяем, что цвета определены (не прозрачные)
    expect(emailInputColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(emailInputBgColor).not.toBe('rgba(0, 0, 0, 0)')
  })

  test('должен соответствовать требованиям производительности', async ({ page }) => {
    await page.goto('/')
    
    // PERF-001: Страница должна загружаться быстро
    const startTime = Date.now()
    await page.goto('/')
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(3000)
    
    // PERF-002: Страница должна быть интерактивной быстро
    await page.waitForSelector('[data-testid="email-input"]')
    const interactiveTime = Date.now() - startTime
    expect(interactiveTime).toBeLessThan(5000)
    
    // PERF-003: Формы должны отвечать быстро
    const formStartTime = Date.now()
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.click('[data-testid="subscribe-button"]')
    const formResponseTime = Date.now() - formStartTime
    expect(formResponseTime).toBeLessThan(2000)
    
    // PERF-004: Навигация должна быть быстрой
    const navStartTime = Date.now()
    await page.click('[data-testid="get-started-button"]')
    await page.waitForSelector('[data-testid="login-form"]')
    const navTime = Date.now() - navStartTime
    expect(navTime).toBeLessThan(1000)
  })
})

describe('🔒 Security Requirements Tests', () => {
  test('должен соответствовать требованиям безопасности', async ({ page }) => {
    await page.goto('/')
    
    // SEC-001: Соединение должно быть защищено HTTPS
    const protocol = await page.evaluate(() => window.location.protocol)
    expect(protocol).toBe('https:')
    
    // SEC-002: Пароли должны быть скрыты
    await page.click('[data-testid="get-started-button"]')
    await page.fill('[data-testid="login-password"]', 'password123')
    
    const passwordInput = page.locator('[data-testid="login-password"]')
    await expect(passwordInput).toHaveAttribute('type', 'password')
    
    // SEC-003: Формы должны иметь защиту от CSRF
    const csrfToken = await page.locator('[data-testid="csrf-token"]').textContent()
    expect(csrfToken).toBeDefined()
    expect(csrfToken.length).toBeGreaterThan(0)
    
    // SEC-004: Данные должны быть валидированы на клиенте и сервере
    await page.fill('[data-testid="login-email"]', 'invalid-email')
    await page.fill('[data-testid="login-password"]', '123')
    await page.click('[data-testid="login-button"]')
    
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="password-error"]')).toBeVisible()
    
    // SEC-005: Сессии должны быть безопасными
    const sessionCookie = await page.context().cookies()
    const sessionCookieExists = sessionCookie.some(cookie => cookie.name === 'session')
    expect(sessionCookieExists).toBe(true)
  })

  test('должен соответствовать требованиям приватности', async ({ page }) => {
    await page.goto('/')
    
    // PRIV-001: Пользователь должен видеть политику конфиденциальности
    await expect(page.locator('[data-testid="privacy-policy-link"]')).toBeVisible()
    
    await page.click('[data-testid="privacy-policy-link"]')
    await expect(page.locator('[data-testid="privacy-policy"]')).toBeVisible()
    
    // PRIV-002: Пользователь должен видеть условия использования
    await expect(page.locator('[data-testid="terms-of-service-link"]')).toBeVisible()
    
    await page.click('[data-testid="terms-of-service-link"]')
    await expect(page.locator('[data-testid="terms-of-service"]')).toBeVisible()
    
    // PRIV-003: Пользователь должен иметь возможность управлять данными
    await page.click('[data-testid="data-management-link"]')
    await expect(page.locator('[data-testid="data-management"]')).toBeVisible()
    
    // PRIV-004: Пользователь должен иметь возможность удалить аккаунт
    await page.click('[data-testid="delete-account-link"]')
    await expect(page.locator('[data-testid="delete-account-confirmation"]')).toBeVisible()
  })
})

describe('📱 Mobile Requirements Tests', () => {
  test('должен соответствовать требованиям мобильных устройств', async ({ page }) => {
    // Устанавливаем мобильный viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // MOBILE-001: Интерфейс должен адаптироваться к мобильным устройствам
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
    
    // MOBILE-002: Элементы должны быть достаточно большими для касания
    const subscribeButton = page.locator('[data-testid="subscribe-button"]')
    const buttonSize = await subscribeButton.boundingBox()
    expect(buttonSize.height).toBeGreaterThanOrEqual(44) // Минимальный размер для касания
    
    // MOBILE-003: Формы должны быть удобными для мобильных устройств
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.click('[data-testid="subscribe-button"]')
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    
    // MOBILE-004: Навигация должна работать на мобильных устройствах
    await page.click('[data-testid="get-started-button"]')
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
    
    // MOBILE-005: Текст должен быть читаемым на мобильных устройствах
    const h1 = page.locator('h1')
    const h1FontSize = await h1.evaluate(el => getComputedStyle(el).fontSize)
    expect(parseInt(h1FontSize)).toBeGreaterThanOrEqual(24) // Минимальный размер шрифта
  })

  test('должен соответствовать требованиям планшетов', async ({ page }) => {
    // Устанавливаем планшетный viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    
    // TABLET-001: Интерфейс должен адаптироваться к планшетам
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
    
    // TABLET-002: Элементы должны использовать доступное пространство
    const heroSection = page.locator('[data-testid="hero-section"]')
    const heroSectionSize = await heroSection.boundingBox()
    expect(heroSectionSize.width).toBeGreaterThan(600) // Достаточная ширина для планшета
    
    // TABLET-003: Навигация должна быть удобной для планшетов
    await page.click('[data-testid="get-started-button"]')
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
    
    // TABLET-004: Формы должны быть удобными для планшетов
    await page.fill('[data-testid="login-email"]', 'test@example.com')
    await page.fill('[data-testid="login-password"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    // TABLET-005: Контент должен быть хорошо организован на планшетах
    const featuresSection = page.locator('[data-testid="features-section"]')
    const featuresSectionSize = await featuresSection.boundingBox()
    expect(featuresSectionSize.width).toBeGreaterThan(700) // Достаточная ширина для планшета
  })
})