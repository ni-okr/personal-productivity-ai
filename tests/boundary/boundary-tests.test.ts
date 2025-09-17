/**
 * 🎯 ТЕСТЫ ГРАНИЧНЫХ ЗНАЧЕНИЙ
 * Покрытие: минимальные, максимальные, критические значения
 */

import { test, expect, Page } from '@playwright/test'

describe('📏 String Length Boundaries', () => {
  test('должен тестировать граничные значения длины email', async ({ page }) => {
    await page.goto('/')
    
    // Граничные значения длины email
    const emailBoundaries = [
      { length: 0, email: '', valid: false, description: 'empty email' },
      { length: 1, email: 'a', valid: false, description: 'single character' },
      { length: 2, email: 'ab', valid: false, description: 'two characters' },
      { length: 3, email: 'abc', valid: false, description: 'three characters' },
      { length: 4, email: 'a@b', valid: false, description: 'minimal valid format' },
      { length: 5, email: 'a@b.c', valid: true, description: 'minimal valid email' },
      { length: 6, email: 'ab@b.c', valid: true, description: 'minimal valid email +1' },
      { length: 10, email: 'test@b.co', valid: true, description: 'short valid email' },
      { length: 50, email: 'test@example.com', valid: true, description: 'medium valid email' },
      { length: 100, email: 'a'.repeat(50) + '@' + 'b'.repeat(50) + '.com', valid: true, description: 'long valid email' },
      { length: 200, email: 'a'.repeat(100) + '@' + 'b'.repeat(100) + '.com', valid: true, description: 'very long valid email' },
      { length: 300, email: 'a'.repeat(150) + '@' + 'b'.repeat(150) + '.com', valid: true, description: 'extremely long valid email' },
      { length: 400, email: 'a'.repeat(200) + '@' + 'b'.repeat(200) + '.com', valid: true, description: 'maximum length valid email' },
      { length: 500, email: 'a'.repeat(250) + '@' + 'b'.repeat(250) + '.com', valid: false, description: 'exceeds maximum length' }
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
      { length: 0, title: '', valid: false, description: 'empty title' },
      { length: 1, title: 'A', valid: true, description: 'single character' },
      { length: 2, title: 'AB', valid: true, description: 'two characters' },
      { length: 3, title: 'ABC', valid: true, description: 'three characters' },
      { length: 10, title: 'ABCDEFGHIJ', valid: true, description: 'ten characters' },
      { length: 50, title: 'A'.repeat(50), valid: true, description: 'fifty characters' },
      { length: 100, title: 'A'.repeat(100), valid: true, description: 'hundred characters' },
      { length: 200, title: 'A'.repeat(200), valid: true, description: 'two hundred characters' },
      { length: 300, title: 'A'.repeat(300), valid: true, description: 'three hundred characters' },
      { length: 400, title: 'A'.repeat(400), valid: true, description: 'four hundred characters' },
      { length: 500, title: 'A'.repeat(500), valid: true, description: 'five hundred characters' },
      { length: 1000, title: 'A'.repeat(1000), valid: false, description: 'exceeds maximum length' }
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
      { length: 0, description: '', valid: true, description: 'empty description' },
      { length: 1, description: 'A', valid: true, description: 'single character' },
      { length: 2, description: 'AB', valid: true, description: 'two characters' },
      { length: 10, description: 'ABCDEFGHIJ', valid: true, description: 'ten characters' },
      { length: 50, description: 'A'.repeat(50), valid: true, description: 'fifty characters' },
      { length: 100, description: 'A'.repeat(100), valid: true, description: 'hundred characters' },
      { length: 500, description: 'A'.repeat(500), valid: true, description: 'five hundred characters' },
      { length: 1000, description: 'A'.repeat(1000), valid: true, description: 'thousand characters' },
      { length: 2000, description: 'A'.repeat(2000), valid: true, description: 'two thousand characters' },
      { length: 5000, description: 'A'.repeat(5000), valid: true, description: 'five thousand characters' },
      { length: 10000, description: 'A'.repeat(10000), valid: true, description: 'ten thousand characters' },
      { length: 20000, description: 'A'.repeat(20000), valid: false, description: 'exceeds maximum length' }
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

describe('🔢 Numeric Boundaries', () => {
  test('должен тестировать граничные значения task priority', async ({ page }) => {
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
    
    // Граничные значения task priority
    const priorityBoundaries = [
      { priority: 0, valid: false, description: 'zero priority' },
      { priority: 1, valid: true, description: 'minimum priority' },
      { priority: 2, valid: true, description: 'low priority' },
      { priority: 3, valid: true, description: 'medium priority' },
      { priority: 4, valid: true, description: 'high priority' },
      { priority: 5, valid: true, description: 'maximum priority' },
      { priority: 6, valid: false, description: 'exceeds maximum priority' },
      { priority: -1, valid: false, description: 'negative priority' },
      { priority: 10, valid: false, description: 'exceeds maximum priority' }
    ]
    
    for (const boundary of priorityBoundaries) {
      await page.click('[data-testid="add-task-button"]')
      await page.fill('[data-testid="task-title"]', `Task with priority ${boundary.priority}`)
      await page.selectOption('[data-testid="task-priority"]', boundary.priority.toString())
      await page.click('[data-testid="save-task-button"]')
      
      if (boundary.valid) {
        // Проверяем, что задача создана
        const taskCard = page.locator('.task-card').last()
        await expect(taskCard).toContainText(`Task with priority ${boundary.priority}`)
      } else {
        // Проверяем ошибку валидации
        await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
      }
    }
  })

  test('должен тестировать граничные значения task due date', async ({ page }) => {
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
    
    // Граничные значения task due date
    const dateBoundaries = [
      { date: '', valid: true, description: 'empty date' },
      { date: '2024-01-01', valid: true, description: 'minimum date' },
      { date: '2024-12-31', valid: true, description: 'maximum date' },
      { date: '2025-01-01', valid: true, description: 'future date' },
      { date: '2030-12-31', valid: true, description: 'far future date' },
      { date: '2023-12-31', valid: false, description: 'past date' },
      { date: '2024-02-29', valid: true, description: 'leap year date' },
      { date: '2024-02-30', valid: false, description: 'invalid leap year date' },
      { date: '2024-04-31', valid: false, description: 'invalid month date' },
      { date: '2024-13-01', valid: false, description: 'invalid month' },
      { date: '2024-01-32', valid: false, description: 'invalid day' }
    ]
    
    for (const boundary of dateBoundaries) {
      await page.click('[data-testid="add-task-button"]')
      await page.fill('[data-testid="task-title"]', `Task with date ${boundary.date}`)
      await page.fill('[data-testid="task-due-date"]', boundary.date)
      await page.click('[data-testid="save-task-button"]')
      
      if (boundary.valid) {
        // Проверяем, что задача создана
        const taskCard = page.locator('.task-card').last()
        await expect(taskCard).toContainText(`Task with date ${boundary.date}`)
      } else {
        // Проверяем ошибку валидации
        await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
      }
    }
  })

  test('должен тестировать граничные значения task count', async ({ page }) => {
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
    
    // Граничные значения task count
    const taskCountBoundaries = [
      { count: 0, valid: true, description: 'zero tasks' },
      { count: 1, valid: true, description: 'one task' },
      { count: 10, valid: true, description: 'ten tasks' },
      { count: 50, valid: true, description: 'fifty tasks' },
      { count: 100, valid: true, description: 'hundred tasks' },
      { count: 500, valid: true, description: 'five hundred tasks' },
      { count: 1000, valid: true, description: 'thousand tasks' },
      { count: 2000, valid: false, description: 'exceeds maximum tasks' }
    ]
    
    for (const boundary of taskCountBoundaries) {
      // Создаем задачи до достижения граничного значения
      for (let i = 0; i < boundary.count; i++) {
        await page.click('[data-testid="add-task-button"]')
        await page.fill('[data-testid="task-title"]', `Task ${i + 1}`)
        await page.click('[data-testid="save-task-button"]')
        
        if (!boundary.valid && i === boundary.count - 1) {
          // Проверяем ошибку валидации на последней итерации
          await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
          break
        }
      }
      
      if (boundary.valid) {
        // Проверяем, что все задачи созданы
        const taskCards = page.locator('.task-card')
        await expect(taskCards).toHaveCount(boundary.count)
      }
    }
  })
})

describe('⏰ Time Boundaries', () => {
  test('должен тестировать граничные значения времени выполнения задач', async ({ page }) => {
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
    
    // Граничные значения времени выполнения задач
    const timeBoundaries = [
      { duration: 0, valid: false, description: 'zero duration' },
      { duration: 1, valid: true, description: 'one minute' },
      { duration: 5, valid: true, description: 'five minutes' },
      { duration: 15, valid: true, description: 'fifteen minutes' },
      { duration: 30, valid: true, description: 'thirty minutes' },
      { duration: 60, valid: true, description: 'one hour' },
      { duration: 120, valid: true, description: 'two hours' },
      { duration: 480, valid: true, description: 'eight hours' },
      { duration: 1440, valid: true, description: 'one day' },
      { duration: 10080, valid: true, description: 'one week' },
      { duration: 43200, valid: false, description: 'exceeds maximum duration' }
    ]
    
    for (const boundary of timeBoundaries) {
      await page.click('[data-testid="add-task-button"]')
      await page.fill('[data-testid="task-title"]', `Task with duration ${boundary.duration}`)
      await page.fill('[data-testid="task-duration"]', boundary.duration.toString())
      await page.click('[data-testid="save-task-button"]')
      
      if (boundary.valid) {
        // Проверяем, что задача создана
        const taskCard = page.locator('.task-card').last()
        await expect(taskCard).toContainText(`Task with duration ${boundary.duration}`)
      } else {
        // Проверяем ошибку валидации
        await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
      }
    }
  })

  test('должен тестировать граничные значения времени создания задач', async ({ page }) => {
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
    
    // Граничные значения времени создания задач
    const creationTimeBoundaries = [
      { time: new Date('2024-01-01T00:00:00Z'), valid: true, description: 'minimum date' },
      { time: new Date('2024-06-15T12:00:00Z'), valid: true, description: 'mid date' },
      { time: new Date('2024-12-31T23:59:59Z'), valid: true, description: 'maximum date' },
      { time: new Date('2025-01-01T00:00:00Z'), valid: true, description: 'future date' },
      { time: new Date('2030-12-31T23:59:59Z'), valid: true, description: 'far future date' },
      { time: new Date('2023-12-31T23:59:59Z'), valid: false, description: 'past date' },
      { time: new Date('2024-02-29T12:00:00Z'), valid: true, description: 'leap year date' },
      { time: new Date('2024-02-30T12:00:00Z'), valid: false, description: 'invalid leap year date' }
    ]
    
    for (const boundary of creationTimeBoundaries) {
      // Устанавливаем время создания
      await page.evaluate((time) => {
        localStorage.setItem('task-creation-time', time.toISOString())
      }, boundary.time)
      
      await page.click('[data-testid="add-task-button"]')
      await page.fill('[data-testid="task-title"]', `Task created at ${boundary.time.toISOString()}`)
      await page.click('[data-testid="save-task-button"]')
      
      if (boundary.valid) {
        // Проверяем, что задача создана
        const taskCard = page.locator('.task-card').last()
        await expect(taskCard).toContainText(`Task created at ${boundary.time.toISOString()}`)
      } else {
        // Проверяем ошибку валидации
        await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
      }
    }
  })
})

describe('💾 Memory Boundaries', () => {
  test('должен тестировать граничные значения использования памяти', async ({ page }) => {
    await page.goto('/')
    
    // Граничные значения использования памяти
    const memoryBoundaries = [
      { size: 0, valid: true, description: 'zero memory usage' },
      { size: 1024, valid: true, description: '1KB memory usage' },
      { size: 10240, valid: true, description: '10KB memory usage' },
      { size: 102400, valid: true, description: '100KB memory usage' },
      { size: 1048576, valid: true, description: '1MB memory usage' },
      { size: 10485760, valid: true, description: '10MB memory usage' },
      { size: 104857600, valid: true, description: '100MB memory usage' },
      { size: 1073741824, valid: true, description: '1GB memory usage' },
      { size: 2147483648, valid: false, description: 'exceeds maximum memory usage' }
    ]
    
    for (const boundary of memoryBoundaries) {
      // Устанавливаем использование памяти
      await page.evaluate((size) => {
        localStorage.setItem('memory-usage', size.toString())
      }, boundary.size)
      
      await page.reload()
      
      if (boundary.valid) {
        // Проверяем, что страница загружается
        await expect(page.locator('body')).toBeVisible()
      } else {
        // Проверяем ошибку памяти
        await expect(page.locator('[data-testid="memory-error"]')).toBeVisible()
      }
    }
  })

  test('должен тестировать граничные значения размера данных', async ({ page }) => {
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
    
    // Граничные значения размера данных
    const dataSizeBoundaries = [
      { size: 0, valid: true, description: 'zero data size' },
      { size: 1024, valid: true, description: '1KB data size' },
      { size: 10240, valid: true, description: '10KB data size' },
      { size: 102400, valid: true, description: '100KB data size' },
      { size: 1048576, valid: true, description: '1MB data size' },
      { size: 10485760, valid: true, description: '10MB data size' },
      { size: 104857600, valid: true, description: '100MB data size' },
      { size: 1073741824, valid: true, description: '1GB data size' },
      { size: 2147483648, valid: false, description: 'exceeds maximum data size' }
    ]
    
    for (const boundary of dataSizeBoundaries) {
      // Устанавливаем размер данных
      await page.evaluate((size) => {
        localStorage.setItem('data-size', size.toString())
      }, boundary.size)
      
      await page.click('[data-testid="add-task-button"]')
      await page.fill('[data-testid="task-title"]', `Task with data size ${boundary.size}`)
      await page.click('[data-testid="save-task-button"]')
      
      if (boundary.valid) {
        // Проверяем, что задача создана
        const taskCard = page.locator('.task-card').last()
        await expect(taskCard).toContainText(`Task with data size ${boundary.size}`)
      } else {
        // Проверяем ошибку размера данных
        await expect(page.locator('[data-testid="data-size-error"]')).toBeVisible()
      }
    }
  })
})

describe('🌐 Network Boundaries', () => {
  test('должен тестировать граничные значения сетевых запросов', async ({ page }) => {
    await page.goto('/')
    
    // Граничные значения сетевых запросов
    const networkBoundaries = [
      { requests: 0, valid: true, description: 'zero requests' },
      { requests: 1, valid: true, description: 'one request' },
      { requests: 10, valid: true, description: 'ten requests' },
      { requests: 100, valid: true, description: 'hundred requests' },
      { requests: 1000, valid: true, description: 'thousand requests' },
      { requests: 10000, valid: true, description: 'ten thousand requests' },
      { requests: 100000, valid: false, description: 'exceeds maximum requests' }
    ]
    
    for (const boundary of networkBoundaries) {
      // Устанавливаем количество запросов
      await page.evaluate((requests) => {
        localStorage.setItem('network-requests', requests.toString())
      }, boundary.requests)
      
      await page.reload()
      
      if (boundary.valid) {
        // Проверяем, что страница загружается
        await expect(page.locator('body')).toBeVisible()
      } else {
        // Проверяем ошибку сети
        await expect(page.locator('[data-testid="network-error"]')).toBeVisible()
      }
    }
  })

  test('должен тестировать граничные значения времени ответа', async ({ page }) => {
    await page.goto('/')
    
    // Граничные значения времени ответа
    const responseTimeBoundaries = [
      { time: 0, valid: true, description: 'zero response time' },
      { time: 100, valid: true, description: '100ms response time' },
      { time: 500, valid: true, description: '500ms response time' },
      { time: 1000, valid: true, description: '1s response time' },
      { time: 2000, valid: true, description: '2s response time' },
      { time: 5000, valid: true, description: '5s response time' },
      { time: 10000, valid: true, description: '10s response time' },
      { time: 30000, valid: false, description: 'exceeds maximum response time' }
    ]
    
    for (const boundary of responseTimeBoundaries) {
      // Устанавливаем время ответа
      await page.evaluate((time) => {
        localStorage.setItem('response-time', time.toString())
      }, boundary.time)
      
      await page.reload()
      
      if (boundary.valid) {
        // Проверяем, что страница загружается
        await expect(page.locator('body')).toBeVisible()
      } else {
        // Проверяем ошибку времени ответа
        await expect(page.locator('[data-testid="response-time-error"]')).toBeVisible()
      }
    }
  })
})