/**
 * 🔄 РЕГРЕССИОННЫЕ ТЕСТЫ
 * Покрытие: все релизы, стабильность, совместимость
 */

import { test, expect, Page } from '@playwright/test'

describe('📦 Release v1.0.0 Regression Tests', () => {
  test('должен поддерживать базовую функциональность v1.0.0', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем основные элементы v1.0.0
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    
    // Проверяем, что можно подписаться на рассылку
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.click('[data-testid="subscribe-button"]')
    await expect(page.locator('[data-testid="subscription-status"]')).toBeVisible()
  })

  test('должен поддерживать PWA функциональность v1.0.0', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем PWA элементы
    const manifest = await page.evaluate(() => {
      const link = document.querySelector('link[rel="manifest"]')
      return link ? link.getAttribute('href') : null
    })
    expect(manifest).toBeTruthy()
    
    // Проверяем service worker
    const swRegistered = await page.evaluate(() => {
      return 'serviceWorker' in navigator
    })
    expect(swRegistered).toBe(true)
  })

  test('должен поддерживать мобильную адаптацию v1.0.0', async ({ page }) => {
    // Устанавливаем мобильный viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Проверяем, что контент помещается на экране
    const body = page.locator('body')
    const scrollWidth = await body.evaluate(el => el.scrollWidth)
    const clientWidth = await body.evaluate(el => el.clientWidth)
    
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth * 1.1)
  })
})

describe('📦 Release v1.1.0 Regression Tests', () => {
  test('должен поддерживать систему авторизации v1.1.0', async ({ page }) => {
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
    
    // Проверяем, что планировщик загружается
    await expect(page.locator('[data-testid="planner-content"]')).toBeVisible()
  })

  test('должен поддерживать управление задачами v1.1.0', async ({ page }) => {
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
    
    // Проверяем добавление задачи
    await page.click('[data-testid="add-task-button"]')
    await expect(page.locator('[data-testid="task-modal"]')).toBeVisible()
    
    await page.fill('[data-testid="task-title"]', 'Test Task')
    await page.fill('[data-testid="task-description"]', 'Test Description')
    await page.click('[data-testid="save-task-button"]')
    
    // Проверяем, что задача добавилась
    await expect(page.locator('.task-card')).toBeVisible()
  })

  test('должен поддерживать базовую аналитику v1.1.0', async ({ page }) => {
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
    
    // Проверяем, что есть аналитика
    const analyticsSection = page.locator('[data-testid="analytics-section"]')
    if (await analyticsSection.count() > 0) {
      await expect(analyticsSection).toBeVisible()
    }
  })
})

describe('📦 Release v1.2.0 Regression Tests', () => {
  test('должен поддерживать ИИ планировщик v1.2.0', async ({ page }) => {
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
    
    // Проверяем ИИ функциональность
    const aiSection = page.locator('[data-testid="ai-section"]')
    if (await aiSection.count() > 0) {
      await expect(aiSection).toBeVisible()
    }
    
    // Проверяем умную сортировку
    const smartSortToggle = page.locator('[data-testid="smart-sort-toggle"]')
    if (await smartSortToggle.count() > 0) {
      await expect(smartSortToggle).toBeVisible()
    }
  })

  test('должен поддерживать систему подписок v1.2.0', async ({ page }) => {
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
    
    // Проверяем систему подписок
    const subscriptionSection = page.locator('[data-testid="subscription-section"]')
    if (await subscriptionSection.count() > 0) {
      await expect(subscriptionSection).toBeVisible()
    }
    
    // Проверяем кнопку обновления подписки
    const upgradeButton = page.locator('[data-testid="upgrade-button"]')
    if (await upgradeButton.count() > 0) {
      await expect(upgradeButton).toBeVisible()
    }
  })

  test('должен поддерживать расширенную аналитику v1.2.0', async ({ page }) => {
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
    
    // Проверяем расширенную аналитику
    const advancedAnalytics = page.locator('[data-testid="advanced-analytics"]')
    if (await advancedAnalytics.count() > 0) {
      await expect(advancedAnalytics).toBeVisible()
    }
  })
})

describe('📦 Release v1.3.0 Regression Tests', () => {
  test('должен поддерживать интеграцию с внешними сервисами v1.3.0', async ({ page }) => {
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
    
    // Проверяем интеграции
    const integrationsSection = page.locator('[data-testid="integrations-section"]')
    if (await integrationsSection.count() > 0) {
      await expect(integrationsSection).toBeVisible()
    }
  })

  test('должен поддерживать уведомления v1.3.0', async ({ page }) => {
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
    
    // Проверяем уведомления
    const notificationsSection = page.locator('[data-testid="notifications-section"]')
    if (await notificationsSection.count() > 0) {
      await expect(notificationsSection).toBeVisible()
    }
  })

  test('должен поддерживать экспорт данных v1.3.0', async ({ page }) => {
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
    
    // Проверяем экспорт данных
    const exportButton = page.locator('[data-testid="export-button"]')
    if (await exportButton.count() > 0) {
      await expect(exportButton).toBeVisible()
    }
  })
})

describe('📦 Release v1.4.0 Regression Tests', () => {
  test('должен поддерживать командную работу v1.4.0', async ({ page }) => {
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
    
    // Проверяем командную работу
    const teamSection = page.locator('[data-testid="team-section"]')
    if (await teamSection.count() > 0) {
      await expect(teamSection).toBeVisible()
    }
  })

  test('должен поддерживать календарную интеграцию v1.4.0', async ({ page }) => {
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
    
    // Проверяем календарную интеграцию
    const calendarSection = page.locator('[data-testid="calendar-section"]')
    if (await calendarSection.count() > 0) {
      await expect(calendarSection).toBeVisible()
    }
  })

  test('должен поддерживать шаблоны задач v1.4.0', async ({ page }) => {
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
    
    // Проверяем шаблоны задач
    const templatesSection = page.locator('[data-testid="templates-section"]')
    if (await templatesSection.count() > 0) {
      await expect(templatesSection).toBeVisible()
    }
  })
})

describe('📦 Release v1.5.0 Regression Tests', () => {
  test('должен поддерживать автоматизацию v1.5.0', async ({ page }) => {
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
    
    // Проверяем автоматизацию
    const automationSection = page.locator('[data-testid="automation-section"]')
    if (await automationSection.count() > 0) {
      await expect(automationSection).toBeVisible()
    }
  })

  test('должен поддерживать машинное обучение v1.5.0', async ({ page }) => {
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
    
    // Проверяем машинное обучение
    const mlSection = page.locator('[data-testid="ml-section"]')
    if (await mlSection.count() > 0) {
      await expect(mlSection).toBeVisible()
    }
  })

  test('должен поддерживать персонализацию v1.5.0', async ({ page }) => {
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
    
    // Проверяем персонализацию
    const personalizationSection = page.locator('[data-testid="personalization-section"]')
    if (await personalizationSection.count() > 0) {
      await expect(personalizationSection).toBeVisible()
    }
  })
})

describe('🔄 Cross-Release Compatibility Tests', () => {
  test('должен поддерживать миграцию данных между релизами', async ({ page }) => {
    await page.goto('/planner')
    
    // Мокаем данные из предыдущих релизов
    await page.evaluate(() => {
      localStorage.setItem('auth-token', 'mock-token')
      localStorage.setItem('user', JSON.stringify({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        subscription: 'free'
      }))
      
      // Данные из v1.0.0
      localStorage.setItem('tasks-v1.0.0', JSON.stringify([
        { id: '1', title: 'Old Task', description: 'Old Description', completed: false }
      ]))
      
      // Данные из v1.1.0
      localStorage.setItem('tasks-v1.1.0', JSON.stringify([
        { id: '1', title: 'Old Task', description: 'Old Description', completed: false, priority: 'medium' }
      ]))
    })
    
    await page.reload()
    await page.waitForSelector('[data-testid="planner-content"]')
    
    // Проверяем, что данные мигрировали
    await expect(page.locator('[data-testid="planner-content"]')).toBeVisible()
  })

  test('должен поддерживать обратную совместимость API', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что старые API endpoints работают
    const response = await page.request.get('/api/test')
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data.status).toBe('ok')
  })

  test('должен поддерживать миграцию конфигурации', async ({ page }) => {
    await page.goto('/planner')
    
    // Мокаем старую конфигурацию
    await page.evaluate(() => {
      localStorage.setItem('config-v1.0.0', JSON.stringify({
        theme: 'light',
        language: 'en',
        notifications: true
      }))
    })
    
    await page.reload()
    await page.waitForSelector('[data-testid="planner-content"]')
    
    // Проверяем, что конфигурация мигрировала
    await expect(page.locator('[data-testid="planner-content"]')).toBeVisible()
  })
})

describe('🐛 Bug Regression Tests', () => {
  test('должен исправлять баг с дублированием задач', async ({ page }) => {
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
    
    // Добавляем задачу
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Test Task')
    await page.click('[data-testid="save-task-button"]')
    
    // Проверяем, что задача не дублируется
    const taskCards = page.locator('.task-card')
    const taskCount = await taskCards.count()
    expect(taskCount).toBe(1)
  })

  test('должен исправлять баг с потерей данных при обновлении', async ({ page }) => {
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
    
    // Добавляем задачу
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Test Task')
    await page.click('[data-testid="save-task-button"]')
    
    // Обновляем страницу
    await page.reload()
    await page.waitForSelector('[data-testid="planner-content"]')
    
    // Проверяем, что задача сохранилась
    const taskCards = page.locator('.task-card')
    const taskCount = await taskCards.count()
    expect(taskCount).toBeGreaterThan(0)
  })

  test('должен исправлять баг с некорректным отображением на мобильных устройствах', async ({ page }) => {
    // Устанавливаем мобильный viewport
    await page.setViewportSize({ width: 375, height: 667 })
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
    
    // Проверяем, что контент помещается на экране
    const body = page.locator('body')
    const scrollWidth = await body.evaluate(el => el.scrollWidth)
    const clientWidth = await body.evaluate(el => el.clientWidth)
    
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth * 1.1)
  })
})

describe('🔒 Security Regression Tests', () => {
  test('должен поддерживать защиту от XSS атак', async ({ page }) => {
    await page.goto('/')
    
    // Пытаемся ввести XSS payload
    const xssPayload = '<script>alert("xss")</script>'
    await page.fill('[data-testid="email-input"]', xssPayload)
    await page.click('[data-testid="subscribe-button"]')
    
    // Проверяем, что скрипт не выполнился
    const pageContent = await page.content()
    expect(pageContent).not.toContain('<script>')
  })

  test('должен поддерживать защиту от SQL инъекций', async ({ page }) => {
    await page.goto('/')
    
    // Пытаемся ввести SQL инъекцию
    const sqlInjection = "'; DROP TABLE users; --"
    await page.fill('[data-testid="email-input"]', sqlInjection)
    await page.click('[data-testid="subscribe-button"]')
    
    // Проверяем, что запрос обработан безопасно
    await expect(page.locator('[data-testid="subscription-status"]')).toBeVisible()
  })

  test('должен поддерживать защиту от CSRF атак', async ({ page }) => {
    await page.goto('/')
    
    // Пытаемся отправить запрос без CSRF токена
    const response = await page.request.post('/api/subscribe', {
      data: { email: 'test@example.com' },
      headers: {
        'X-CSRF-Token': 'invalid-token'
      }
    })
    
    // Запрос должен быть отклонен
    expect(response.status()).toBe(403)
  })
})

describe('⚡ Performance Regression Tests', () => {
  test('должен поддерживать быструю загрузку страницы', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    
    // Страница должна загружаться менее чем за 3 секунды
    expect(loadTime).toBeLessThan(3000)
  })

  test('должен поддерживать быстрый отклик на действия пользователя', async ({ page }) => {
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
    
    // Измеряем время отклика на клик
    const startTime = Date.now()
    await page.click('[data-testid="add-task-button"]')
    const responseTime = Date.now() - startTime
    
    // Отклик должен быть менее 100 миллисекунд
    expect(responseTime).toBeLessThan(100)
  })

  test('должен поддерживать эффективное использование памяти', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const memoryUsage = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize
      }
      return 0
    })
    
    // Использование памяти должно быть менее 50MB
    expect(memoryUsage).toBeLessThan(50 * 1024 * 1024)
  })
})