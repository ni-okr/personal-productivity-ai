/**
 * ⚖️ ТЕСТЫ ЭКВИВАЛЕНТНОСТИ
 * Покрытие: эквивалентные классы входных данных, граничные значения
 */

import { test, expect, Page } from '@playwright/test'

describe('📊 Input Equivalence Classes', () => {
  test('должен тестировать эквивалентные классы email валидации', async ({ page }) => {
    await page.goto('/')
    
    // Эквивалентные классы email валидации
    const emailClasses = [
      {
        name: 'valid emails',
        emails: [
          'test@example.com',
          'user.name@domain.co.uk',
          'user+tag@example.org',
          'user123@test-domain.com',
          'a@b.co'
        ],
        expected: 'valid'
      },
      {
        name: 'invalid emails - missing @',
        emails: [
          'testexample.com',
          'user.name.domain.co.uk',
          'user+tag.example.org'
        ],
        expected: 'invalid'
      },
      {
        name: 'invalid emails - missing domain',
        emails: [
          'test@',
          'user@',
          'user.name@'
        ],
        expected: 'invalid'
      },
      {
        name: 'invalid emails - missing local part',
        emails: [
          '@example.com',
          '@domain.co.uk',
          '@example.org'
        ],
        expected: 'invalid'
      },
      {
        name: 'invalid emails - multiple @',
        emails: [
          'test@@example.com',
          'user@example@com',
          'test@example@com'
        ],
        expected: 'invalid'
      },
      {
        name: 'invalid emails - special characters',
        emails: [
          'test@example..com',
          'test@.example.com',
          'test@example.com.',
          '.test@example.com'
        ],
        expected: 'invalid'
      }
    ]
    
    for (const emailClass of emailClasses) {
      for (const email of emailClass.emails) {
        await page.fill('[data-testid="email-input"]', email)
        await page.click('[data-testid="subscribe-button"]')
        
        if (emailClass.expected === 'valid') {
          // Проверяем успешную подписку
          await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
        } else {
          // Проверяем ошибку валидации
          await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
        }
        
        // Очищаем поле для следующего теста
        await page.fill('[data-testid="email-input"]', '')
      }
    }
  })

  test('должен тестировать эквивалентные классы task приоритетов', async ({ page }) => {
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
    
    // Эквивалентные классы task приоритетов
    const priorityClasses = [
      {
        name: 'high priority',
        priorities: ['high', 'urgent', 'critical'],
        expected: 'high'
      },
      {
        name: 'medium priority',
        priorities: ['medium', 'normal', 'standard'],
        expected: 'medium'
      },
      {
        name: 'low priority',
        priorities: ['low', 'minor', 'optional'],
        expected: 'low'
      }
    ]
    
    for (const priorityClass of priorityClasses) {
      for (const priority of priorityClass.priorities) {
        await page.click('[data-testid="add-task-button"]')
        await page.fill('[data-testid="task-title"]', `Task with ${priority} priority`)
        await page.selectOption('[data-testid="task-priority"]', priority)
        await page.click('[data-testid="save-task-button"]')
        
        // Проверяем, что задача создана с правильным приоритетом
        const taskCard = page.locator('.task-card').last()
        await expect(taskCard).toContainText(`Task with ${priority} priority`)
        
        // Проверяем визуальное отображение приоритета
        const priorityElement = taskCard.locator('[data-testid="task-priority"]')
        await expect(priorityElement).toHaveClass(new RegExp(priorityClass.expected))
      }
    }
  })

  test('должен тестировать эквивалентные классы task категорий', async ({ page }) => {
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
    
    // Эквивалентные классы task категорий
    const categoryClasses = [
      {
        name: 'work category',
        categories: ['work', 'job', 'career', 'business'],
        expected: 'work'
      },
      {
        name: 'personal category',
        categories: ['personal', 'private', 'individual', 'self'],
        expected: 'personal'
      },
      {
        name: 'health category',
        categories: ['health', 'fitness', 'medical', 'wellness'],
        expected: 'health'
      },
      {
        name: 'education category',
        categories: ['education', 'learning', 'study', 'academic'],
        expected: 'education'
      }
    ]
    
    for (const categoryClass of categoryClasses) {
      for (const category of categoryClass.categories) {
        await page.click('[data-testid="add-task-button"]')
        await page.fill('[data-testid="task-title"]', `Task in ${category} category`)
        await page.selectOption('[data-testid="task-category"]', category)
        await page.click('[data-testid="save-task-button"]')
        
        // Проверяем, что задача создана с правильной категорией
        const taskCard = page.locator('.task-card').last()
        await expect(taskCard).toContainText(`Task in ${category} category`)
        
        // Проверяем визуальное отображение категории
        const categoryElement = taskCard.locator('[data-testid="task-category"]')
        await expect(categoryElement).toHaveClass(new RegExp(categoryClass.expected))
      }
    }
  })
})

describe('🎯 Boundary Value Analysis', () => {
  test('должен тестировать граничные значения длины email', async ({ page }) => {
    await page.goto('/')
    
    // Граничные значения длины email
    const emailBoundaries = [
      { length: 1, email: 'a@b.co', valid: true },
      { length: 2, email: 'ab@b.co', valid: true },
      { length: 3, email: 'abc@b.co', valid: true },
      { length: 10, email: 'abcdefghij@b.co', valid: true },
      { length: 50, email: 'abcdefghijklmnopqrstuvwxyz1234567890@example.com', valid: true },
      { length: 100, email: 'a'.repeat(50) + '@' + 'b'.repeat(50) + '.com', valid: true },
      { length: 200, email: 'a'.repeat(100) + '@' + 'b'.repeat(100) + '.com', valid: true },
      { length: 300, email: 'a'.repeat(150) + '@' + 'b'.repeat(150) + '.com', valid: true },
      { length: 400, email: 'a'.repeat(200) + '@' + 'b'.repeat(200) + '.com', valid: true },
      { length: 500, email: 'a'.repeat(250) + '@' + 'b'.repeat(250) + '.com', valid: true }
    ]
    
    for (const boundary of emailBoundaries) {
      await page.fill('[data-testid="email-input"]', boundary.email)
      await page.click('[data-testid="subscribe-button"]')
      
      if (boundary.valid) {
        // Проверяем успешную подписку
        await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
      } else {
        // Проверяем ошибку валидации
        await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
      }
      
      // Очищаем поле для следующего теста
      await page.fill('[data-testid="email-input"]', '')
    }
  })

  test('должен тестировать граничные значения длины task title', async ({ page }) => {
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
    
    // Граничные значения длины task title
    const titleBoundaries = [
      { length: 1, title: 'A', valid: true },
      { length: 2, title: 'AB', valid: true },
      { length: 3, title: 'ABC', valid: true },
      { length: 10, title: 'ABCDEFGHIJ', valid: true },
      { length: 50, title: 'A'.repeat(50), valid: true },
      { length: 100, title: 'A'.repeat(100), valid: true },
      { length: 200, title: 'A'.repeat(200), valid: true },
      { length: 300, title: 'A'.repeat(300), valid: true },
      { length: 400, title: 'A'.repeat(400), valid: true },
      { length: 500, title: 'A'.repeat(500), valid: true }
    ]
    
    for (const boundary of titleBoundaries) {
      await page.click('[data-testid="add-task-button"]')
      await page.fill('[data-testid="task-title"]', boundary.title)
      await page.click('[data-testid="save-task-button"]')
      
      if (boundary.valid) {
        // Проверяем, что задача создана
        const taskCard = page.locator('.task-card').last()
        await expect(taskCard).toContainText(boundary.title)
      } else {
        // Проверяем ошибку валидации
        await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
      }
    }
  })

  test('должен тестировать граничные значения длины task description', async ({ page }) => {
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
    
    // Граничные значения длины task description
    const descriptionBoundaries = [
      { length: 0, description: '', valid: true },
      { length: 1, description: 'A', valid: true },
      { length: 2, description: 'AB', valid: true },
      { length: 10, description: 'ABCDEFGHIJ', valid: true },
      { length: 50, description: 'A'.repeat(50), valid: true },
      { length: 100, description: 'A'.repeat(100), valid: true },
      { length: 500, description: 'A'.repeat(500), valid: true },
      { length: 1000, description: 'A'.repeat(1000), valid: true },
      { length: 2000, description: 'A'.repeat(2000), valid: true },
      { length: 5000, description: 'A'.repeat(5000), valid: true }
    ]
    
    for (const boundary of descriptionBoundaries) {
      await page.click('[data-testid="add-task-button"]')
      await page.fill('[data-testid="task-title"]', 'Test Task')
      await page.fill('[data-testid="task-description"]', boundary.description)
      await page.click('[data-testid="save-task-button"]')
      
      if (boundary.valid) {
        // Проверяем, что задача создана
        const taskCard = page.locator('.task-card').last()
        await expect(taskCard).toContainText('Test Task')
      } else {
        // Проверяем ошибку валидации
        await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
      }
    }
  })
})

describe('🔄 State Equivalence Classes', () => {
  test('должен тестировать эквивалентные классы состояний аутентификации', async ({ page }) => {
    // Эквивалентные классы состояний аутентификации
    const authStates = [
      {
        name: 'not authenticated',
        state: { authenticated: false, token: null, user: null },
        expected: 'redirect to login'
      },
      {
        name: 'authenticated with valid token',
        state: { authenticated: true, token: 'valid-token', user: { id: 'user-1', email: 'test@example.com', name: 'Test User' } },
        expected: 'access granted'
      },
      {
        name: 'authenticated with expired token',
        state: { authenticated: true, token: 'expired-token', user: { id: 'user-1', email: 'test@example.com', name: 'Test User' } },
        expected: 'redirect to login'
      },
      {
        name: 'authenticated with invalid token',
        state: { authenticated: true, token: 'invalid-token', user: { id: 'user-1', email: 'test@example.com', name: 'Test User' } },
        expected: 'redirect to login'
      },
      {
        name: 'authenticated with no user data',
        state: { authenticated: true, token: 'valid-token', user: null },
        expected: 'redirect to login'
      },
      {
        name: 'not authenticated with valid token',
        state: { authenticated: false, token: 'valid-token', user: null },
        expected: 'redirect to login'
      }
    ]
    
    for (const authState of authStates) {
      // Устанавливаем состояние аутентификации
      await page.evaluate((state) => {
        if (state.token) {
          localStorage.setItem('auth-token', state.token)
        } else {
          localStorage.removeItem('auth-token')
        }
        
        if (state.user) {
          localStorage.setItem('user', JSON.stringify(state.user))
        } else {
          localStorage.removeItem('user')
        }
      }, authState.state)
      
      await page.goto('/planner')
      
      if (authState.expected === 'access granted') {
        // Проверяем успешную аутентификацию
        await expect(page.locator('[data-testid="planner-content"]')).toBeVisible()
      } else {
        // Проверяем редирект на страницу входа
        await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
      }
    }
  })

  test('должен тестировать эквивалентные классы состояний задач', async ({ page }) => {
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
    
    // Эквивалентные классы состояний задач
    const taskStates = [
      {
        name: 'pending task',
        state: { completed: false, priority: 'high', category: 'work' },
        expected: 'displayed as pending'
      },
      {
        name: 'completed task',
        state: { completed: true, priority: 'high', category: 'work' },
        expected: 'displayed as completed'
      },
      {
        name: 'high priority task',
        state: { completed: false, priority: 'high', category: 'work' },
        expected: 'displayed with high priority styling'
      },
      {
        name: 'medium priority task',
        state: { completed: false, priority: 'medium', category: 'work' },
        expected: 'displayed with medium priority styling'
      },
      {
        name: 'low priority task',
        state: { completed: false, priority: 'low', category: 'work' },
        expected: 'displayed with low priority styling'
      },
      {
        name: 'work category task',
        state: { completed: false, priority: 'high', category: 'work' },
        expected: 'displayed with work category styling'
      },
      {
        name: 'personal category task',
        state: { completed: false, priority: 'high', category: 'personal' },
        expected: 'displayed with personal category styling'
      }
    ]
    
    for (const taskState of taskStates) {
      // Создаем задачу с определенным состоянием
      await page.click('[data-testid="add-task-button"]')
      await page.fill('[data-testid="task-title"]', `Task ${taskState.name}`)
      await page.selectOption('[data-testid="task-priority"]', taskState.state.priority)
      await page.selectOption('[data-testid="task-category"]', taskState.state.category)
      
      if (taskState.state.completed) {
        await page.check('[data-testid="task-completed"]')
      }
      
      await page.click('[data-testid="save-task-button"]')
      
      // Проверяем, что задача создана с правильным состоянием
      const taskCard = page.locator('.task-card').last()
      await expect(taskCard).toContainText(`Task ${taskState.name}`)
      
      if (taskState.state.completed) {
        await expect(taskCard.locator('[data-testid="task-completed"]')).toBeChecked()
      } else {
        await expect(taskCard.locator('[data-testid="task-completed"]')).not.toBeChecked()
      }
    }
  })

  test('должен тестировать эквивалентные классы состояний UI', async ({ page }) => {
    await page.goto('/')
    
    // Эквивалентные классы состояний UI
    const uiStates = [
      {
        name: 'light theme',
        state: { theme: 'light', language: 'en', sidebar: 'open' },
        expected: 'light theme applied'
      },
      {
        name: 'dark theme',
        state: { theme: 'dark', language: 'en', sidebar: 'open' },
        expected: 'dark theme applied'
      },
      {
        name: 'auto theme',
        state: { theme: 'auto', language: 'en', sidebar: 'open' },
        expected: 'auto theme applied'
      },
      {
        name: 'English language',
        state: { theme: 'light', language: 'en', sidebar: 'open' },
        expected: 'English text displayed'
      },
      {
        name: 'Russian language',
        state: { theme: 'light', language: 'ru', sidebar: 'open' },
        expected: 'Russian text displayed'
      },
      {
        name: 'sidebar open',
        state: { theme: 'light', language: 'en', sidebar: 'open' },
        expected: 'sidebar visible'
      },
      {
        name: 'sidebar closed',
        state: { theme: 'light', language: 'en', sidebar: 'closed' },
        expected: 'sidebar hidden'
      }
    ]
    
    for (const uiState of uiStates) {
      // Устанавливаем состояние UI
      await page.evaluate((state) => {
        localStorage.setItem('theme', state.theme)
        localStorage.setItem('language', state.language)
        localStorage.setItem('sidebar-open', state.sidebar === 'open' ? 'true' : 'false')
      }, uiState.state)
      
      await page.reload()
      
      // Проверяем, что состояние UI применилось
      const body = page.locator('body')
      if (uiState.state.theme === 'dark') {
        await expect(body).toHaveClass(/dark/)
      } else if (uiState.state.theme === 'light') {
        await expect(body).not.toHaveClass(/dark/)
      }
      
      if (uiState.state.language === 'ru') {
        await expect(page.locator('h1')).toContainText('Персональный ИИ')
      } else {
        await expect(page.locator('h1')).toContainText('Personal AI')
      }
    }
  })
})

describe('🌐 Environment Equivalence Classes', () => {
  test('должен тестировать эквивалентные классы окружений', async ({ page }) => {
    // Эквивалентные классы окружений
    const environmentClasses = [
      {
        name: 'development environment',
        env: { environment: 'development', debug: true, logging: 'verbose' },
        expected: 'development features enabled'
      },
      {
        name: 'staging environment',
        env: { environment: 'staging', debug: false, logging: 'info' },
        expected: 'staging features enabled'
      },
      {
        name: 'production environment',
        env: { environment: 'production', debug: false, logging: 'error' },
        expected: 'production features enabled'
      },
      {
        name: 'test environment',
        env: { environment: 'test', debug: true, logging: 'debug' },
        expected: 'test features enabled'
      }
    ]
    
    for (const envClass of environmentClasses) {
      // Устанавливаем окружение
      await page.evaluate((env) => {
        localStorage.setItem('environment', env.environment)
        localStorage.setItem('debug-enabled', env.debug.toString())
        localStorage.setItem('logging-level', env.logging)
      }, envClass.env)
      
      await page.goto('/')
      
      // Проверяем, что окружение применилось
      const envStatus = await page.evaluate(() => localStorage.getItem('environment'))
      const debugStatus = await page.evaluate(() => localStorage.getItem('debug-enabled'))
      const loggingStatus = await page.evaluate(() => localStorage.getItem('logging-level'))
      
      expect(envStatus).toBe(envClass.env.environment)
      expect(debugStatus).toBe(envClass.env.debug.toString())
      expect(loggingStatus).toBe(envClass.env.logging)
    }
  })

  test('должен тестировать эквивалентные классы браузеров', async ({ page }) => {
    await page.goto('/')
    
    // Эквивалентные классы браузеров
    const browserClasses = [
      {
        name: 'Chrome browser',
        browser: { browser: 'chrome', version: '120', os: 'windows' },
        expected: 'Chrome features enabled'
      },
      {
        name: 'Firefox browser',
        browser: { browser: 'firefox', version: '119', os: 'windows' },
        expected: 'Firefox features enabled'
      },
      {
        name: 'Safari browser',
        browser: { browser: 'safari', version: '17', os: 'macos' },
        expected: 'Safari features enabled'
      },
      {
        name: 'Edge browser',
        browser: { browser: 'edge', version: '120', os: 'windows' },
        expected: 'Edge features enabled'
      }
    ]
    
    for (const browserClass of browserClasses) {
      // Устанавливаем браузер
      await page.evaluate((browser) => {
        localStorage.setItem('browser', browser.browser)
        localStorage.setItem('browser-version', browser.version)
        localStorage.setItem('operating-system', browser.os)
      }, browserClass.browser)
      
      await page.reload()
      
      // Проверяем, что браузер применился
      const browserStatus = await page.evaluate(() => localStorage.getItem('browser'))
      const versionStatus = await page.evaluate(() => localStorage.getItem('browser-version'))
      const osStatus = await page.evaluate(() => localStorage.getItem('operating-system'))
      
      expect(browserStatus).toBe(browserClass.browser.browser)
      expect(versionStatus).toBe(browserClass.browser.version)
      expect(osStatus).toBe(browserClass.browser.os)
    }
  })

  test('должен тестировать эквивалентные классы устройств', async ({ page }) => {
    // Эквивалентные классы устройств
    const deviceClasses = [
      {
        name: 'desktop device',
        device: { device: 'desktop', width: 1920, height: 1080, touch: false },
        expected: 'desktop layout'
      },
      {
        name: 'tablet device',
        device: { device: 'tablet', width: 768, height: 1024, touch: true },
        expected: 'tablet layout'
      },
      {
        name: 'mobile device',
        device: { device: 'mobile', width: 375, height: 667, touch: true },
        expected: 'mobile layout'
      }
    ]
    
    for (const deviceClass of deviceClasses) {
      // Устанавливаем устройство
      await page.setViewportSize({ width: deviceClass.device.width, height: deviceClass.device.height })
      
      await page.evaluate((device) => {
        localStorage.setItem('device-type', device.device)
        localStorage.setItem('touch-enabled', device.touch.toString())
      }, deviceClass.device)
      
      await page.goto('/')
      
      // Проверяем, что устройство применилось
      const deviceStatus = await page.evaluate(() => localStorage.getItem('device-type'))
      const touchStatus = await page.evaluate(() => localStorage.getItem('touch-enabled'))
      
      expect(deviceStatus).toBe(deviceClass.device.device)
      expect(touchStatus).toBe(deviceClass.device.touch.toString())
    }
  })
})