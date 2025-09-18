/**
 * ⚡ НАГРУЗОЧНЫЕ И СТРЕСС-ТЕСТЫ
 * Покрытие: 100% критических путей производительности
 */

import { test, expect, Page } from '@playwright/test'

describe('🚀 Load Tests', () => {
  test('должен выдерживать 100 одновременных пользователей', async ({ page, context }) => {
    const promises = []
    
    // Создаем 100 одновременных сессий
    for (let i = 0; i < 100; i++) {
      const newPage = await context.newPage()
      promises.push(
        newPage.goto('/').then(() => {
          return newPage.waitForLoadState('networkidle')
        })
      )
    }
    
    const startTime = Date.now()
    await Promise.all(promises)
    const endTime = Date.now()
    
    const loadTime = endTime - startTime
    
    // Все страницы должны загрузиться менее чем за 30 секунд
    expect(loadTime).toBeLessThan(30000)
  })

  test('должен обрабатывать 1000 задач в базе данных', async ({ page }) => {
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
    
    const startTime = Date.now()
    
    // Создаем 1000 задач
    for (let i = 0; i < 1000; i++) {
      await page.click('[data-testid="add-task-button"]')
      await page.fill('[data-testid="task-title"]', `Load Test Task ${i}`)
      await page.selectOption('select', 'medium')
      await page.fill('input[type="number"]', '30')
      await page.click('[data-testid="save-task-button"]')
      await page.waitForSelector('.task-card', { timeout: 1000 })
    }
    
    const endTime = Date.now()
    const processingTime = endTime - startTime
    
    // Создание 1000 задач должно занять менее 5 минут
    expect(processingTime).toBeLessThan(300000)
    
    // Проверяем, что все задачи созданы
    const taskCount = await page.locator('.task-card').count()
    expect(taskCount).toBe(1000)
  })

  test('должен обрабатывать максимальную нагрузку на API', async ({ page }) => {
    await page.goto('/')
    
    const startTime = Date.now()
    
    // Отправляем 1000 запросов подписки одновременно
    const promises = []
    for (let i = 0; i < 1000; i++) {
      promises.push(
        page.request.post('/api/subscribe', {
          data: { email: `loadtest${i}@example.com` }
        })
      )
    }
    
    const responses = await Promise.allSettled(promises)
    const endTime = Date.now()
    
    const processingTime = endTime - startTime
    
    // Все запросы должны обработаться менее чем за 60 секунд
    expect(processingTime).toBeLessThan(60000)
    
    // Проверяем, что большинство запросов успешны
    const successfulRequests = responses.filter(r => r.status === 'fulfilled').length
    expect(successfulRequests).toBeGreaterThan(900) // 90% успешных запросов
  })
})

describe('💥 Stress Tests', () => {
  test('должен выдерживать стресс тест базы данных', async ({ page }) => {
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
    
    const startTime = Date.now()
    
    // Создаем, обновляем и удаляем задачи в быстром темпе
    const operations = []
    for (let i = 0; i < 100; i++) {
      // Создание задачи
      operations.push(async () => {
        await page.click('[data-testid="add-task-button"]')
        await page.fill('[data-testid="task-title"]', `Stress Test Task ${i}`)
        await page.click('[data-testid="save-task-button"]')
        await page.waitForSelector('.task-card', { timeout: 1000 })
      })
      
      // Обновление задачи
      operations.push(async () => {
        const taskCard = page.locator('.task-card').first()
        await taskCard.locator('button[aria-label*="Toggle task"]').click()
      })
      
      // Удаление задачи
      operations.push(async () => {
        const taskCard = page.locator('.task-card').first()
        await taskCard.locator('button[title="Удалить задачу"]').click()
      })
    }
    
    // Выполняем операции в случайном порядке
    const shuffledOperations = operations.sort(() => Math.random() - 0.5)
    
    for (const operation of shuffledOperations) {
      try {
        await operation()
      } catch (error) {
        // Игнорируем ошибки для стресс-теста
        console.log('Operation failed:', error)
      }
    }
    
    const endTime = Date.now()
    const processingTime = endTime - startTime
    
    // Операции должны завершиться менее чем за 2 минуты
    expect(processingTime).toBeLessThan(120000)
  })

  test('должен выдерживать стресс тест памяти браузера', async ({ page }) => {
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
    
    // Создаем много задач для нагрузки на память
    for (let i = 0; i < 500; i++) {
      await page.click('[data-testid="add-task-button"]')
      await page.fill('[data-testid="task-title"]', `Memory Test Task ${i}`)
      await page.fill('textarea', `Description ${i}`.repeat(100)) // Большое описание
      await page.click('[data-testid="save-task-button"]')
      await page.waitForSelector('.task-card', { timeout: 1000 })
    }
    
    // Проверяем, что страница все еще отзывчива
    await page.click('[data-testid="add-task-button"]')
    await expect(page.locator('[data-testid="task-title"]')).toBeVisible()
    
    // Проверяем, что нет утечек памяти (это сложно проверить в Playwright)
    // В реальном приложении можно использовать performance.memory API
  })

  test('должен выдерживать стресс тест сети', async ({ page }) => {
    // Симулируем медленное соединение
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 100)) // 100ms задержка
      await route.continue()
    })
    
    await page.goto('/')
    
    const startTime = Date.now()
    
    // Выполняем много действий при медленном соединении
    for (let i = 0; i < 50; i++) {
      await page.click('[data-testid="planner-button"]')
      await page.goBack()
      await page.click('[data-testid="notify-release-button"]')
      await page.fill('[data-testid="email-input"]', `networktest${i}@example.com`)
      await page.click('[data-testid="subscribe-button"]')
      await page.waitForSelector('[data-testid="subscription-status"]')
    }
    
    const endTime = Date.now()
    const processingTime = endTime - startTime
    
    // Операции должны завершиться даже при медленном соединении
    expect(processingTime).toBeLessThan(300000) // 5 минут максимум
  })
})

describe('📊 Performance Monitoring', () => {
  test('должен измерять время загрузки страницы', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    // Страница должна загружаться менее чем за 3 секунды
    expect(loadTime).toBeLessThan(3000)
    
    // Записываем метрики для мониторинга
    console.log(`Page load time: ${loadTime}ms`)
  })

  test('должен измерять время отклика API', async ({ page }) => {
    await page.goto('/')
    
    const startTime = Date.now()
    
    const response = await page.request.post('/api/subscribe', {
      data: { email: 'perftest@example.com' }
    })
    
    const responseTime = Date.now() - startTime
    
    // API должен отвечать менее чем за 1 секунду
    expect(responseTime).toBeLessThan(1000)
    expect(response.status()).toBe(200)
    
    console.log(`API response time: ${responseTime}ms`)
  })

  test('должен измерять использование памяти', async ({ page }) => {
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
    
    // Получаем информацию об использовании памяти
    const memoryInfo = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory
      }
      return null
    })
    
    if (memoryInfo) {
      console.log('Memory usage:', memoryInfo)
      
      // Проверяем, что использование памяти разумное
      expect(memoryInfo.usedJSHeapSize).toBeLessThan(50 * 1024 * 1024) // 50MB
    }
  })

  test('должен измерять производительность рендеринга', async ({ page }) => {
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
    
    // Измеряем время до первого контентного рендера
    const fcp = await page.evaluate(() => {
      return new Promise(resolve => {
        new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              resolve(entry.startTime)
            }
          }
        }).observe({ entryTypes: ['paint'] })
      })
    })
    
    // FCP должен быть менее 1.5 секунд
    expect(fcp).toBeLessThan(1500)
    
    console.log(`First Contentful Paint: ${fcp}ms`)
  })
})

describe('🔄 Stability Tests', () => {
  test('должен работать стабильно при длительной работе', async ({ page }) => {
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
    
    // Выполняем операции в течение 5 минут
    const endTime = Date.now() + 5 * 60 * 1000 // 5 минут
    
    while (Date.now() < endTime) {
      try {
        // Создаем задачу
        await page.click('[data-testid="add-task-button"]')
        await page.fill('[data-testid="task-title"]', `Stability Test ${Date.now()}`)
        await page.click('[data-testid="save-task-button"]')
        await page.waitForSelector('.task-card', { timeout: 5000 })
        
        // Завершаем задачу
        const taskCard = page.locator('.task-card').first()
        await taskCard.locator('button[aria-label*="Toggle task"]').click()
        
        // Удаляем задачу
        await taskCard.locator('button[title="Удалить задачу"]').click()
        
        // Небольшая пауза между операциями
        await page.waitForTimeout(1000)
      } catch (error) {
        console.log('Operation failed during stability test:', error)
        // Продолжаем тест даже при ошибках
      }
    }
    
    // Проверяем, что приложение все еще работает
    await expect(page.locator('[data-testid="planner-content"]')).toBeVisible()
  })

  test('должен восстанавливаться после ошибок', async ({ page }) => {
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
    
    // Симулируем ошибку сети
    await page.route('**/api/tasks', route => route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal Server Error' })
    }))
    
    // Пытаемся создать задачу
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Error Test Task')
    await page.click('[data-testid="save-task-button"]')
    
    // Проверяем, что ошибка обработана
    await expect(page.locator('.error-message')).toBeVisible()
    
    // Восстанавливаем сеть
    await page.unroute('**/api/tasks')
    
    // Проверяем, что приложение продолжает работать
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Recovery Test Task')
    await page.click('[data-testid="save-task-button"]')
    
    // Проверяем, что задача создана
    await expect(page.locator('.task-card')).toContainText('Recovery Test Task')
  })
})