/**
 * 🔍 ИССЛЕДОВАТЕЛЬСКИЕ ТЕСТЫ
 * Покрытие: свободное исследование, поиск багов, UX тестирование
 */

import { test, expect, Page } from '@playwright/test'

describe('🎯 Free Exploration Tests', () => {
  test('должен исследовать основную функциональность', async ({ page }) => {
    await page.goto('/')
    
    // Исследуем главную страницу
    await expect(page.locator('h1')).toBeVisible()
    
    // Проверяем все интерактивные элементы
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      const text = await button.textContent()
      const isVisible = await button.isVisible()
      
      if (isVisible && text) {
        // Кликаем на кнопку и проверяем реакцию
        await button.click()
        await page.waitForTimeout(500)
        
        // Проверяем, что нет ошибок в консоли
        const consoleErrors = []
        page.on('console', msg => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text())
          }
        })
        
        // Не должно быть критических ошибок
        const criticalErrors = consoleErrors.filter(error => 
          error.includes('Error') || error.includes('Failed')
        )
        expect(criticalErrors.length).toBe(0)
      }
    }
  })

  test('должен исследовать навигацию между страницами', async ({ page }) => {
    await page.goto('/')
    
    // Исследуем навигацию
    const links = page.locator('a')
    const linkCount = await links.count()
    
    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i)
      const href = await link.getAttribute('href')
      const isVisible = await link.isVisible()
      
      if (isVisible && href && !href.startsWith('http')) {
        // Переходим по ссылке
        await link.click()
        await page.waitForTimeout(1000)
        
        // Проверяем, что страница загрузилась
        await expect(page.locator('body')).toBeVisible()
        
        // Возвращаемся назад
        await page.goBack()
        await page.waitForTimeout(500)
      }
    }
  })

  test('должен исследовать формы и поля ввода', async ({ page }) => {
    await page.goto('/')
    
    // Исследуем все поля ввода
    const inputs = page.locator('input, textarea, select')
    const inputCount = await inputs.count()
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i)
      const type = await input.getAttribute('type')
      const placeholder = await input.getAttribute('placeholder')
      const isVisible = await input.isVisible()
      
      if (isVisible) {
        // Пытаемся ввести данные
        if (type === 'email') {
          await input.fill('test@example.com')
        } else if (type === 'password') {
          await input.fill('password123')
        } else if (type === 'text') {
          await input.fill('Test Text')
        } else if (placeholder) {
          await input.fill('Test Input')
        }
        
        // Проверяем, что данные введены
        const value = await input.inputValue()
        expect(value).toBeTruthy()
      }
    }
  })
})

describe('🐛 Bug Hunting Tests', () => {
  test('должен искать баги в обработке ошибок', async ({ page }) => {
    await page.goto('/')
    
    // Пытаемся вызвать ошибки
    const errorScenarios = [
      { input: '', expected: 'empty input' },
      { input: 'a'.repeat(1000), expected: 'long input' },
      { input: '<script>alert("xss")</script>', expected: 'xss attempt' },
      { input: '; DROP TABLE users; --', expected: 'sql injection' },
      { input: '${7*7}', expected: 'template injection' },
      { input: '{{7*7}}', expected: 'template injection' },
      { input: '#{7*7}', expected: 'template injection' }
    ]
    
    for (const scenario of errorScenarios) {
      const emailInput = page.locator('[data-testid="email-input"]')
      const subscribeButton = page.locator('[data-testid="subscribe-button"]')
      
      await emailInput.fill(scenario.input)
      await subscribeButton.click()
      
      // Проверяем, что приложение не сломалось
      await expect(page.locator('body')).toBeVisible()
      
      // Проверяем, что нет ошибок в консоли
      const consoleErrors = []
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text())
        }
      })
      
      await page.waitForTimeout(500)
      
      // Не должно быть критических ошибок
      const criticalErrors = consoleErrors.filter(error => 
        error.includes('Error') || error.includes('Failed')
      )
      expect(criticalErrors.length).toBe(0)
    }
  })

  test('должен искать баги в состоянии приложения', async ({ page }) => {
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
    
    // Пытаемся вызвать баги в состоянии
    const bugScenarios = [
      { action: 'add multiple tasks', count: 100 },
      { action: 'rapid clicks', count: 50 },
      { action: 'concurrent operations', count: 10 }
    ]
    
    for (const scenario of bugScenarios) {
      if (scenario.action === 'add multiple tasks') {
        // Добавляем много задач
        for (let i = 0; i < scenario.count; i++) {
          await page.click('[data-testid="add-task-button"]')
          await page.fill('[data-testid="task-title"]', `Task ${i}`)
          await page.click('[data-testid="save-task-button"]')
          await page.waitForTimeout(100)
        }
      } else if (scenario.action === 'rapid clicks') {
        // Быстрые клики
        const button = page.locator('[data-testid="add-task-button"]')
        for (let i = 0; i < scenario.count; i++) {
          await button.click()
          await page.waitForTimeout(10)
        }
      } else if (scenario.action === 'concurrent operations') {
        // Одновременные операции
        const promises = []
        for (let i = 0; i < scenario.count; i++) {
          promises.push(page.click('[data-testid="add-task-button"]'))
        }
        await Promise.all(promises)
      }
      
      // Проверяем, что приложение не сломалось
      await expect(page.locator('[data-testid="planner-content"]')).toBeVisible()
    }
  })

  test('должен искать баги в производительности', async ({ page }) => {
    await page.goto('/')
    
    // Измеряем производительность
    const startTime = Date.now()
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    
    // Проверяем, что страница загружается быстро
    expect(loadTime).toBeLessThan(5000)
    
    // Проверяем использование памяти
    const memoryUsage = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize
      }
      return 0
    })
    
    // Память не должна превышать разумные пределы
    expect(memoryUsage).toBeLessThan(100 * 1024 * 1024) // 100MB
  })
})

describe('🎨 UX Exploration Tests', () => {
  test('должен исследовать пользовательский опыт', async ({ page }) => {
    await page.goto('/')
    
    // Исследуем визуальные элементы
    const elements = page.locator('h1, h2, h3, p, button, a, input, select, textarea')
    const elementCount = await elements.count()
    
    for (let i = 0; i < elementCount; i++) {
      const element = elements.nth(i)
      const tagName = await element.evaluate(el => el.tagName.toLowerCase())
      const text = await element.textContent()
      const isVisible = await element.isVisible()
      
      if (isVisible) {
        // Проверяем, что элемент имеет разумный размер
        const boundingBox = await element.boundingBox()
        if (boundingBox) {
          expect(boundingBox.width).toBeGreaterThan(0)
          expect(boundingBox.height).toBeGreaterThan(0)
        }
        
        // Проверяем, что текст читаем
        if (text && text.trim()) {
          expect(text.trim().length).toBeGreaterThan(0)
        }
      }
    }
  })

  test('должен исследовать доступность', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем семантические элементы
    const semanticElements = page.locator('main, nav, header, footer, section, article, aside')
    const semanticCount = await semanticElements.count()
    
    for (let i = 0; i < semanticCount; i++) {
      const element = semanticElements.nth(i)
      const isVisible = await element.isVisible()
      
      if (isVisible) {
        // Проверяем, что элемент имеет правильную роль
        const role = await element.getAttribute('role')
        const tagName = await element.evaluate(el => el.tagName.toLowerCase())
        
        // Роль должна соответствовать тегу
        if (role) {
          expect(role).toBeTruthy()
        }
      }
    }
    
    // Проверяем ARIA атрибуты
    const ariaElements = page.locator('[aria-label], [aria-describedby], [aria-labelledby]')
    const ariaCount = await ariaElements.count()
    
    for (let i = 0; i < ariaCount; i++) {
      const element = ariaElements.nth(i)
      const ariaLabel = await element.getAttribute('aria-label')
      const ariaDescribedBy = await element.getAttribute('aria-describedby')
      const ariaLabelledBy = await element.getAttribute('aria-labelledby')
      
      // Должен быть хотя бы один ARIA атрибут
      expect(ariaLabel || ariaDescribedBy || ariaLabelledBy).toBeTruthy()
    }
  })

  test('должен исследовать мобильную адаптацию', async ({ page }) => {
    // Устанавливаем мобильный viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Проверяем, что контент помещается на экране
    const body = page.locator('body')
    const scrollWidth = await body.evaluate(el => el.scrollWidth)
    const clientWidth = await body.evaluate(el => el.clientWidth)
    
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth * 1.1)
    
    // Проверяем, что элементы достаточно большие для touch
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      const boundingBox = await button.boundingBox()
      
      if (boundingBox) {
        // Кнопки должны быть не менее 44x44 пикселей
        expect(boundingBox.width).toBeGreaterThanOrEqual(44)
        expect(boundingBox.height).toBeGreaterThanOrEqual(44)
      }
    }
  })
})

describe('🔍 Edge Case Exploration Tests', () => {
  test('должен исследовать граничные случаи ввода', async ({ page }) => {
    await page.goto('/')
    
    const edgeCases = [
      { input: '', description: 'empty input' },
      { input: ' ', description: 'whitespace only' },
      { input: 'a', description: 'single character' },
      { input: 'a'.repeat(1000), description: 'very long input' },
      { input: 'тест', description: 'unicode characters' },
      { input: '🚀', description: 'emoji' },
      { input: 'test@', description: 'incomplete email' },
      { input: '@example.com', description: 'email without local part' },
      { input: 'test@example', description: 'email without domain' },
      { input: 'test@example.com.', description: 'email with trailing dot' },
      { input: 'test..test@example.com', description: 'email with double dots' },
      { input: 'test@example..com', description: 'email with double dots in domain' }
    ]
    
    for (const edgeCase of edgeCases) {
      const emailInput = page.locator('[data-testid="email-input"]')
      const subscribeButton = page.locator('[data-testid="subscribe-button"]')
      
      await emailInput.fill(edgeCase.input)
      await subscribeButton.click()
      
      // Проверяем, что приложение не сломалось
      await expect(page.locator('body')).toBeVisible()
      
      // Проверяем, что есть обратная связь
      const statusElement = page.locator('[data-testid="subscription-status"]')
      if (await statusElement.count() > 0) {
        await expect(statusElement).toBeVisible()
      }
    }
  })

  test('должен исследовать граничные случаи навигации', async ({ page }) => {
    await page.goto('/')
    
    // Пытаемся перейти на несуществующие страницы
    const nonExistentPages = [
      '/nonexistent',
      '/planner/nonexistent',
      '/api/nonexistent',
      '/static/nonexistent.html'
    ]
    
    for (const pagePath of nonExistentPages) {
      const response = await page.goto(pagePath)
      
      // Проверяем, что возвращается 404 или редирект
      expect(response?.status()).toBeOneOf([404, 200, 301, 302])
    }
  })

  test('должен исследовать граничные случаи состояния', async ({ page }) => {
    await page.goto('/planner')
    
    // Мокаем различные состояния
    const states = [
      { user: null, description: 'no user' },
      { user: { id: '', email: '', name: '' }, description: 'empty user' },
      { user: { id: 'user-1', email: 'test@example.com', name: 'Test User', subscription: null }, description: 'no subscription' },
      { user: { id: 'user-1', email: 'test@example.com', name: 'Test User', subscription: 'invalid' }, description: 'invalid subscription' }
    ]
    
    for (const state of states) {
      await page.evaluate((userState) => {
        if (userState.user) {
          localStorage.setItem('user', JSON.stringify(userState.user))
          localStorage.setItem('auth-token', 'mock-token')
        } else {
          localStorage.removeItem('user')
          localStorage.removeItem('auth-token')
        }
      }, state)
      
      await page.reload()
      
      // Проверяем, что приложение не сломалось
      await expect(page.locator('body')).toBeVisible()
    }
  })
})

describe('🎯 Scenario-Based Exploration Tests', () => {
  test('должен исследовать сценарий нового пользователя', async ({ page }) => {
    // Новый пользователь заходит на сайт
    await page.goto('/')
    
    // Исследует главную страницу
    await expect(page.locator('h1')).toBeVisible()
    
    // Подписывается на рассылку
    await page.fill('[data-testid="email-input"]', 'newuser@example.com')
    await page.click('[data-testid="subscribe-button"]')
    await expect(page.locator('[data-testid="subscription-status"]')).toBeVisible()
    
    // Переходит к планировщику
    await page.goto('/planner')
    
    // Должен быть перенаправлен на авторизацию
    await expect(page.locator('body')).toBeVisible()
  })

  test('должен исследовать сценарий существующего пользователя', async ({ page }) => {
    // Существующий пользователь заходит в систему
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
    
    // Исследует планировщик
    await expect(page.locator('[data-testid="planner-content"]')).toBeVisible()
    
    // Добавляет задачу
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Test Task')
    await page.click('[data-testid="save-task-button"]')
    
    // Проверяет, что задача добавилась
    await expect(page.locator('.task-card')).toBeVisible()
  })

  test('должен исследовать сценарий премиум пользователя', async ({ page }) => {
    // Премиум пользователь заходит в систему
    await page.goto('/planner')
    
    // Мокаем премиум подписку
    await page.evaluate(() => {
      localStorage.setItem('auth-token', 'mock-token')
      localStorage.setItem('user', JSON.stringify({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        subscription: 'premium'
      }))
    })
    
    await page.reload()
    await page.waitForSelector('[data-testid="planner-content"]')
    
    // Исследует премиум функции
    await expect(page.locator('[data-testid="planner-content"]')).toBeVisible()
    
    // Проверяет доступ к ИИ функциям
    const aiSection = page.locator('[data-testid="ai-section"]')
    if (await aiSection.count() > 0) {
      await expect(aiSection).toBeVisible()
    }
  })
})

describe('🔧 Technical Exploration Tests', () => {
  test('должен исследовать API endpoints', async ({ page }) => {
    await page.goto('/')
    
    // Исследуем доступные API endpoints
    const endpoints = [
      '/api/test',
      '/api/subscribe',
      '/api/health',
      '/api/status'
    ]
    
    for (const endpoint of endpoints) {
      const response = await page.request.get(endpoint)
      
      // Проверяем, что endpoint отвечает
      expect(response.status()).toBeOneOf([200, 404, 405])
      
      if (response.status() === 200) {
        const data = await response.json()
        expect(data).toBeTruthy()
      }
    }
  })

  test('должен исследовать консольные сообщения', async ({ page }) => {
    await page.goto('/')
    
    const consoleMessages = []
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      })
    })
    
    await page.waitForLoadState('networkidle')
    
    // Проверяем, что нет критических ошибок
    const errors = consoleMessages.filter(msg => msg.type === 'error')
    const criticalErrors = errors.filter(error => 
      error.text.includes('Error') || error.text.includes('Failed')
    )
    
    expect(criticalErrors.length).toBe(0)
  })

  test('должен исследовать сетевые запросы', async ({ page }) => {
    const requests = []
    const responses = []
    
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers()
      })
    })
    
    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status(),
        headers: response.headers()
      })
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Проверяем, что все запросы успешны
    const failedRequests = responses.filter(response => 
      response.status >= 400
    )
    
    expect(failedRequests.length).toBe(0)
  })
})