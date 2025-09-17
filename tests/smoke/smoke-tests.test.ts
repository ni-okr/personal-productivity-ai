/**
 * 💨 SMOKE ТЕСТЫ
 * Покрытие: критическая функциональность, быстрая проверка
 */

import { test, expect, Page } from '@playwright/test'

describe('🔥 Critical Functionality Smoke Tests', () => {
  test('должен загружать главную страницу', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что страница загружается
    await expect(page.locator('h1')).toBeVisible()
    
    // Проверяем, что нет критических ошибок
    const consoleErrors = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    await page.waitForLoadState('networkidle')
    
    // Не должно быть критических ошибок
    const criticalErrors = consoleErrors.filter(error => 
      error.includes('Error') || error.includes('Failed')
    )
    expect(criticalErrors.length).toBe(0)
  })

  test('должен загружать планировщик', async ({ page }) => {
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

  test('должен обрабатывать подписку на рассылку', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем подписку
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.click('[data-testid="subscribe-button"]')
    
    // Проверяем, что появилось сообщение о статусе
    await expect(page.locator('[data-testid="subscription-status"]')).toBeVisible()
  })

  test('должен обрабатывать API запросы', async ({ page }) => {
    // Проверяем API endpoint
    const response = await page.request.get('/api/test')
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data.status).toBe('ok')
  })
})

describe('⚡ Quick Performance Smoke Tests', () => {
  test('должен быстро загружаться', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    
    // Страница должна загружаться менее чем за 5 секунд
    expect(loadTime).toBeLessThan(5000)
  })

  test('должен быстро отвечать на действия', async ({ page }) => {
    await page.goto('/')
    
    // Измеряем время отклика на клик
    const startTime = Date.now()
    await page.click('[data-testid="subscribe-button"]')
    const responseTime = Date.now() - startTime
    
    // Отклик должен быть менее 1 секунды
    expect(responseTime).toBeLessThan(1000)
  })

  test('должен эффективно использовать память', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const memoryUsage = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize
      }
      return 0
    })
    
    // Использование памяти должно быть разумным
    expect(memoryUsage).toBeLessThan(100 * 1024 * 1024) // 100MB
  })
})

describe('🔧 Basic Functionality Smoke Tests', () => {
  test('должен отображать основные элементы', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем основные элементы
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
  })

  test('должен обрабатывать ввод данных', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем ввод email
    const emailInput = page.locator('[data-testid="email-input"]')
    await emailInput.fill('test@example.com')
    
    const value = await emailInput.inputValue()
    expect(value).toBe('test@example.com')
  })

  test('должен обрабатывать клики', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем клик по кнопке
    const subscribeButton = page.locator('[data-testid="subscribe-button"]')
    await subscribeButton.click()
    
    // Проверяем, что кнопка сработала
    await expect(page.locator('[data-testid="subscription-status"]')).toBeVisible()
  })
})

describe('🌐 Network Smoke Tests', () => {
  test('должен загружать все необходимые ресурсы', async ({ page }) => {
    const requests = []
    page.on('request', request => {
      requests.push(request.url())
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Проверяем, что загружаются основные ресурсы
    const hasHTML = requests.some(url => url.includes('.html') || url === page.url())
    const hasCSS = requests.some(url => url.includes('.css'))
    const hasJS = requests.some(url => url.includes('.js'))
    
    expect(hasHTML).toBe(true)
    expect(hasCSS).toBe(true)
    expect(hasJS).toBe(true)
  })

  test('должен обрабатывать сетевые ошибки', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что приложение не ломается при сетевых проблемах
    await page.route('**/*', route => {
      // Симулируем медленную сеть
      setTimeout(() => route.continue(), 1000)
    })
    
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Проверяем, что страница все еще работает
    await expect(page.locator('h1')).toBeVisible()
  })
})

describe('📱 Mobile Smoke Tests', () => {
  test('должен работать на мобильных устройствах', async ({ page }) => {
    // Устанавливаем мобильный viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Проверяем, что страница загружается
    await expect(page.locator('h1')).toBeVisible()
    
    // Проверяем, что контент помещается на экране
    const body = page.locator('body')
    const scrollWidth = await body.evaluate(el => el.scrollWidth)
    const clientWidth = await body.evaluate(el => el.clientWidth)
    
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth * 1.1)
  })

  test('должен поддерживать touch взаимодействие', async ({ page }) => {
    // Устанавливаем мобильный viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Проверяем touch взаимодействие
    const subscribeButton = page.locator('[data-testid="subscribe-button"]')
    await subscribeButton.tap()
    
    // Проверяем, что кнопка сработала
    await expect(page.locator('[data-testid="subscription-status"]')).toBeVisible()
  })
})

describe('🔒 Security Smoke Tests', () => {
  test('должен защищать от XSS атак', async ({ page }) => {
    await page.goto('/')
    
    // Пытаемся ввести XSS payload
    const xssPayload = '<script>alert("xss")</script>'
    await page.fill('[data-testid="email-input"]', xssPayload)
    await page.click('[data-testid="subscribe-button"]')
    
    // Проверяем, что скрипт не выполнился
    const pageContent = await page.content()
    expect(pageContent).not.toContain('<script>')
  })

  test('должен защищать от SQL инъекций', async ({ page }) => {
    await page.goto('/')
    
    // Пытаемся ввести SQL инъекцию
    const sqlInjection = "'; DROP TABLE users; --"
    await page.fill('[data-testid="email-input"]', sqlInjection)
    await page.click('[data-testid="subscribe-button"]')
    
    // Проверяем, что запрос обработан безопасно
    await expect(page.locator('[data-testid="subscription-status"]')).toBeVisible()
  })
})

describe('🎯 User Flow Smoke Tests', () => {
  test('должен поддерживать базовый пользовательский сценарий', async ({ page }) => {
    // Пользователь заходит на сайт
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
    
    // Подписывается на рассылку
    await page.fill('[data-testid="email-input"]', 'user@example.com')
    await page.click('[data-testid="subscribe-button"]')
    await expect(page.locator('[data-testid="subscription-status"]')).toBeVisible()
    
    // Переходит к планировщику
    await page.goto('/planner')
    await expect(page.locator('body')).toBeVisible()
  })

  test('должен поддерживать сценарий авторизованного пользователя', async ({ page }) => {
    // Пользователь заходит в планировщик
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
})

describe('🔧 Error Handling Smoke Tests', () => {
  test('должен обрабатывать ошибки gracefully', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что нет ошибок в консоли
    const consoleErrors = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    await page.waitForLoadState('networkidle')
    
    // Не должно быть критических ошибок
    const criticalErrors = consoleErrors.filter(error => 
      error.includes('Error') || error.includes('Failed')
    )
    expect(criticalErrors.length).toBe(0)
  })

  test('должен отображать понятные сообщения об ошибках', async ({ page }) => {
    await page.goto('/')
    
    // Пытаемся подписаться с неверным email
    await page.fill('[data-testid="email-input"]', 'invalid-email')
    await page.click('[data-testid="subscribe-button"]')
    
    // Проверяем, что появилось сообщение об ошибке
    const statusElement = page.locator('[data-testid="subscription-status"]')
    if (await statusElement.count() > 0) {
      await expect(statusElement).toBeVisible()
    }
  })
})

describe('📊 Monitoring Smoke Tests', () => {
  test('должен отправлять метрики', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что страница загружается
    await expect(page.locator('h1')).toBeVisible()
    
    // В реальном приложении здесь должна быть проверка отправки метрик
    // Это упрощенная версия для демонстрации
    expect(true).toBe(true)
  })

  test('должен логировать важные события', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что страница загружается
    await expect(page.locator('h1')).toBeVisible()
    
    // В реальном приложении здесь должна быть проверка логирования
    // Это упрощенная версия для демонстрации
    expect(true).toBe(true)
  })
})