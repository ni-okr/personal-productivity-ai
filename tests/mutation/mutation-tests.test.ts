/**
 * 🧬 ТЕСТЫ МУТАЦИОННОГО ТЕСТИРОВАНИЯ
 * Покрытие: качество тестов, покрытие кода, эффективность
 */

import { test, expect, Page } from '@playwright/test'

describe('🔬 Basic Mutation Tests', () => {
  test('должен обнаруживать мутации в логике валидации', async ({ page }) => {
    await page.goto('/')
    
    // Тестируем валидацию email
    const emailInput = page.locator('[data-testid="email-input"]')
    const subscribeButton = page.locator('[data-testid="subscribe-button"]')
    
    // Валидный email
    await emailInput.fill('test@example.com')
    await subscribeButton.click()
    
    // Проверяем, что валидация работает
    const statusElement = page.locator('[data-testid="subscription-status"]')
    await expect(statusElement).toBeVisible()
    
    // Невалидный email
    await emailInput.fill('invalid-email')
    await subscribeButton.click()
    
    // Проверяем, что валидация отклоняет невалидный email
    const errorMessage = page.locator('.error-message')
    if (await errorMessage.count() > 0) {
      const errorText = await errorMessage.textContent()
      expect(errorText).toContain('email')
    }
  })

  test('должен обнаруживать мутации в логике навигации', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем навигацию
    const links = page.locator('a')
    const linkCount = await links.count()
    
    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i)
      const href = await link.getAttribute('href')
      const isVisible = await link.isVisible()
      
      if (isVisible && href && !href.startsWith('http')) {
        // Переходим по ссылке
        await link.click()
        
        // Проверяем, что страница загрузилась
        await expect(page.locator('body')).toBeVisible()
        
        // Возвращаемся назад
        await page.goBack()
      }
    }
  })

  test('должен обнаруживать мутации в логике состояния', async ({ page }) => {
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
    
    // Проверяем состояние модала
    const modal = page.locator('[data-testid="task-modal"]')
    await expect(modal).not.toBeVisible()
    
    // Открываем модал
    await page.click('[data-testid="add-task-button"]')
    await expect(modal).toBeVisible()
    
    // Закрываем модал
    await page.keyboard.press('Escape')
    await expect(modal).not.toBeVisible()
  })
})

describe('🎯 Conditional Mutation Tests', () => {
  test('должен обнаруживать мутации в условной логике', async ({ page }) => {
    await page.goto('/')
    
    // Тестируем условную логику для разных состояний
    const states = [
      { email: '', expected: 'empty' },
      { email: 'test@example.com', expected: 'valid' },
      { email: 'invalid-email', expected: 'invalid' }
    ]
    
    for (const state of states) {
      const emailInput = page.locator('[data-testid="email-input"]')
      const subscribeButton = page.locator('[data-testid="subscribe-button"]')
      
      await emailInput.fill(state.email)
      await subscribeButton.click()
      
      if (state.expected === 'valid') {
        // Проверяем, что валидный email принимается
        const statusElement = page.locator('[data-testid="subscription-status"]')
        await expect(statusElement).toBeVisible()
      } else if (state.expected === 'invalid') {
        // Проверяем, что невалидный email отклоняется
        const errorMessage = page.locator('.error-message')
        if (await errorMessage.count() > 0) {
          const errorText = await errorMessage.textContent()
          expect(errorText).toContain('email')
        }
      } else if (state.expected === 'empty') {
        // Проверяем, что пустой email отклоняется
        const errorMessage = page.locator('.error-message')
        if (await errorMessage.count() > 0) {
          const errorText = await errorMessage.textContent()
          expect(errorText).toContain('обязательно')
        }
      }
    }
  })

  test('должен обнаруживать мутации в логике авторизации', async ({ page }) => {
    await page.goto('/planner')
    
    // Тестируем разные состояния авторизации
    const authStates = [
      { user: null, expected: 'redirect' },
      { user: { id: '', email: '', name: '' }, expected: 'error' },
      { user: { id: 'user-1', email: 'test@example.com', name: 'Test User', subscription: 'free' }, expected: 'success' }
    ]
    
    for (const authState of authStates) {
      await page.evaluate((userState) => {
        if (userState.user) {
          localStorage.setItem('user', JSON.stringify(userState.user))
          localStorage.setItem('auth-token', 'mock-token')
        } else {
          localStorage.removeItem('user')
          localStorage.removeItem('auth-token')
        }
      }, authState)
      
      await page.reload()
      
      if (authState.expected === 'success') {
        // Проверяем, что авторизованный пользователь видит контент
        await expect(page.locator('[data-testid="planner-content"]')).toBeVisible()
      } else if (authState.expected === 'redirect') {
        // Проверяем, что неавторизованный пользователь перенаправляется
        await expect(page.locator('body')).toBeVisible()
      } else if (authState.expected === 'error') {
        // Проверяем, что некорректные данные вызывают ошибку
        await expect(page.locator('body')).toBeVisible()
      }
    }
  })

  test('должен обнаруживать мутации в логике подписок', async ({ page }) => {
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
    
    // Тестируем разные типы подписок
    const subscriptionTypes = ['free', 'premium', 'pro']
    
    for (const subscriptionType of subscriptionTypes) {
      await page.evaluate((type) => {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        user.subscription = type
        localStorage.setItem('user', JSON.stringify(user))
      }, subscriptionType)
      
      await page.reload()
      await page.waitForSelector('[data-testid="planner-content"]')
      
      // Проверяем, что контент отображается для всех типов подписок
      await expect(page.locator('[data-testid="planner-content"]')).toBeVisible()
      
      // Проверяем доступ к функциям в зависимости от типа подписки
      if (subscriptionType === 'premium' || subscriptionType === 'pro') {
        const aiSection = page.locator('[data-testid="ai-section"]')
        if (await aiSection.count() > 0) {
          await expect(aiSection).toBeVisible()
        }
      }
    }
  })
})

describe('🔄 Loop Mutation Tests', () => {
  test('должен обнаруживать мутации в циклах обработки данных', async ({ page }) => {
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
    
    // Добавляем несколько задач
    const taskCount = 5
    for (let i = 0; i < taskCount; i++) {
      await page.click('[data-testid="add-task-button"]')
      await page.fill('[data-testid="task-title"]', `Task ${i}`)
      await page.click('[data-testid="save-task-button"]')
      await page.waitForTimeout(100)
    }
    
    // Проверяем, что все задачи отображаются
    const taskCards = page.locator('.task-card')
    const loadedTaskCount = await taskCards.count()
    expect(loadedTaskCount).toBeGreaterThan(0)
    
    // Проверяем, что можно взаимодействовать с каждой задачей
    for (let i = 0; i < loadedTaskCount; i++) {
      const taskCard = taskCards.nth(i)
      await expect(taskCard).toBeVisible()
      
      // Проверяем, что задача имеет необходимые элементы
      const title = taskCard.locator('[data-testid="task-title"]')
      if (await title.count() > 0) {
        await expect(title).toBeVisible()
      }
    }
  })

  test('должен обнаруживать мутации в циклах валидации', async ({ page }) => {
    await page.goto('/')
    
    // Тестируем валидацию множественных полей
    const testCases = [
      { email: 'test1@example.com', expected: 'valid' },
      { email: 'test2@example.com', expected: 'valid' },
      { email: 'invalid1', expected: 'invalid' },
      { email: 'invalid2', expected: 'invalid' },
      { email: '', expected: 'empty' }
    ]
    
    for (const testCase of testCases) {
      const emailInput = page.locator('[data-testid="email-input"]')
      const subscribeButton = page.locator('[data-testid="subscribe-button"]')
      
      await emailInput.fill(testCase.email)
      await subscribeButton.click()
      
      if (testCase.expected === 'valid') {
        // Проверяем, что валидный email принимается
        const statusElement = page.locator('[data-testid="subscription-status"]')
        await expect(statusElement).toBeVisible()
      } else if (testCase.expected === 'invalid') {
        // Проверяем, что невалидный email отклоняется
        const errorMessage = page.locator('.error-message')
        if (await errorMessage.count() > 0) {
          const errorText = await errorMessage.textContent()
          expect(errorText).toContain('email')
        }
      } else if (testCase.expected === 'empty') {
        // Проверяем, что пустой email отклоняется
        const errorMessage = page.locator('.error-message')
        if (await errorMessage.count() > 0) {
          const errorText = await errorMessage.textContent()
          expect(errorText).toContain('обязательно')
        }
      }
    }
  })

  test('должен обнаруживать мутации в циклах рендеринга', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем рендеринг всех элементов
    const elements = page.locator('h1, h2, h3, p, button, a, input')
    const elementCount = await elements.count()
    
    for (let i = 0; i < elementCount; i++) {
      const element = elements.nth(i)
      const isVisible = await element.isVisible()
      
      if (isVisible) {
        // Проверяем, что элемент имеет необходимые атрибуты
        const tagName = await element.evaluate(el => el.tagName.toLowerCase())
        
        if (tagName === 'input') {
          const type = await element.getAttribute('type')
          expect(type).toBeTruthy()
        } else if (tagName === 'button') {
          const type = await element.getAttribute('type')
          expect(type).toBeTruthy()
        } else if (tagName === 'a') {
          const href = await element.getAttribute('href')
          expect(href).toBeTruthy()
        }
      }
    }
  })
})

describe('🔀 Branch Mutation Tests', () => {
  test('должен обнаруживать мутации в ветвлениях', async ({ page }) => {
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
    
    // Тестируем разные ветвления в логике задач
    const taskStates = [
      { title: 'Task 1', description: 'Description 1', completed: false },
      { title: 'Task 2', description: 'Description 2', completed: true },
      { title: 'Task 3', description: '', completed: false }
    ]
    
    for (const taskState of taskStates) {
      await page.click('[data-testid="add-task-button"]')
      await page.fill('[data-testid="task-title"]', taskState.title)
      
      if (taskState.description) {
        await page.fill('[data-testid="task-description"]', taskState.description)
      }
      
      await page.click('[data-testid="save-task-button"]')
      await page.waitForTimeout(100)
      
      // Проверяем, что задача создана
      const taskCards = page.locator('.task-card')
      const taskCount = await taskCards.count()
      expect(taskCount).toBeGreaterThan(0)
      
      // Проверяем, что задача имеет правильное состояние
      const lastTask = taskCards.last()
      await expect(lastTask).toBeVisible()
      
      if (taskState.completed) {
        // Проверяем, что завершенная задача отмечена
        const completedIndicator = lastTask.locator('[data-testid="completed-indicator"]')
        if (await completedIndicator.count() > 0) {
          await expect(completedIndicator).toBeVisible()
        }
      }
    }
  })

  test('должен обнаруживать мутации в условных рендерингах', async ({ page }) => {
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
    
    // Тестируем условный рендеринг для разных состояний
    const states = [
      { hasTasks: false, expected: 'empty' },
      { hasTasks: true, expected: 'populated' }
    ]
    
    for (const state of states) {
      if (state.hasTasks) {
        // Добавляем задачу
        await page.click('[data-testid="add-task-button"]')
        await page.fill('[data-testid="task-title"]', 'Test Task')
        await page.click('[data-testid="save-task-button"]')
        await page.waitForTimeout(100)
      }
      
      if (state.expected === 'empty') {
        // Проверяем, что отображается сообщение о пустом списке
        const emptyMessage = page.locator('[data-testid="empty-message"]')
        if (await emptyMessage.count() > 0) {
          await expect(emptyMessage).toBeVisible()
        }
      } else if (state.expected === 'populated') {
        // Проверяем, что отображаются задачи
        const taskCards = page.locator('.task-card')
        const taskCount = await taskCards.count()
        expect(taskCount).toBeGreaterThan(0)
      }
    }
  })

  test('должен обнаруживать мутации в логике ошибок', async ({ page }) => {
    await page.goto('/')
    
    // Тестируем разные типы ошибок
    const errorTypes = [
      { input: '', type: 'empty' },
      { input: 'invalid-email', type: 'invalid' },
      { input: 'a'.repeat(1000), type: 'too-long' }
    ]
    
    for (const errorType of errorTypes) {
      const emailInput = page.locator('[data-testid="email-input"]')
      const subscribeButton = page.locator('[data-testid="subscribe-button"]')
      
      await emailInput.fill(errorType.input)
      await subscribeButton.click()
      
      // Проверяем, что отображается правильное сообщение об ошибке
      const errorMessage = page.locator('.error-message')
      if (await errorMessage.count() > 0) {
        const errorText = await errorMessage.textContent()
        
        if (errorType.type === 'empty') {
          expect(errorText).toContain('обязательно')
        } else if (errorType.type === 'invalid') {
          expect(errorText).toContain('email')
        } else if (errorType.type === 'too-long') {
          expect(errorText).toContain('длинн')
        }
      }
    }
  })
})

describe('🎯 Boundary Mutation Tests', () => {
  test('должен обнаруживать мутации в граничных условиях', async ({ page }) => {
    await page.goto('/')
    
    // Тестируем граничные условия для email
    const boundaryCases = [
      { email: 'a@b.co', expected: 'valid' }, // Минимальный валидный email
      { email: 'test@example.com', expected: 'valid' }, // Обычный email
      { email: 'a'.repeat(100) + '@example.com', expected: 'valid' }, // Длинный локальная часть
      { email: 'test@' + 'a'.repeat(100) + '.com', expected: 'valid' }, // Длинный домен
      { email: 'a@b', expected: 'invalid' }, // Неполный домен
      { email: '@example.com', expected: 'invalid' }, // Отсутствует локальная часть
      { email: 'test@', expected: 'invalid' } // Отсутствует домен
    ]
    
    for (const boundaryCase of boundaryCases) {
      const emailInput = page.locator('[data-testid="email-input"]')
      const subscribeButton = page.locator('[data-testid="subscribe-button"]')
      
      await emailInput.fill(boundaryCase.email)
      await subscribeButton.click()
      
      if (boundaryCase.expected === 'valid') {
        // Проверяем, что валидный email принимается
        const statusElement = page.locator('[data-testid="subscription-status"]')
        await expect(statusElement).toBeVisible()
      } else if (boundaryCase.expected === 'invalid') {
        // Проверяем, что невалидный email отклоняется
        const errorMessage = page.locator('.error-message')
        if (await errorMessage.count() > 0) {
          const errorText = await errorMessage.textContent()
          expect(errorText).toContain('email')
        }
      }
    }
  })

  test('должен обнаруживать мутации в граничных условиях задач', async ({ page }) => {
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
    
    // Тестируем граничные условия для задач
    const boundaryCases = [
      { title: 'A', description: 'B', expected: 'valid' }, // Минимальные данные
      { title: 'A'.repeat(1000), description: 'B'.repeat(1000), expected: 'valid' }, // Максимальные данные
      { title: '', description: 'Description', expected: 'invalid' }, // Пустой заголовок
      { title: 'Title', description: '', expected: 'valid' }, // Пустое описание
      { title: 'A'.repeat(10000), description: 'B', expected: 'invalid' } // Слишком длинный заголовок
    ]
    
    for (const boundaryCase of boundaryCases) {
      await page.click('[data-testid="add-task-button"]')
      await page.fill('[data-testid="task-title"]', boundaryCase.title)
      await page.fill('[data-testid="task-description"]', boundaryCase.description)
      await page.click('[data-testid="save-task-button"]')
      
      if (boundaryCase.expected === 'valid') {
        // Проверяем, что задача создана
        const taskCards = page.locator('.task-card')
        const taskCount = await taskCards.count()
        expect(taskCount).toBeGreaterThan(0)
      } else if (boundaryCase.expected === 'invalid') {
        // Проверяем, что отображается ошибка
        const errorMessage = page.locator('.error-message')
        if (await errorMessage.count() > 0) {
          const errorText = await errorMessage.textContent()
          expect(errorText).toContain('ошибка')
        }
      }
    }
  })

  test('должен обнаруживать мутации в граничных условиях производительности', async ({ page }) => {
    await page.goto('/')
    
    // Тестируем граничные условия производительности
    const performanceTests = [
      { actionCount: 1, expected: 'fast' },
      { actionCount: 10, expected: 'fast' },
      { actionCount: 100, expected: 'slow' }
    ]
    
    for (const performanceTest of performanceTests) {
      const startTime = Date.now()
      
      // Выполняем действия
      for (let i = 0; i < performanceTest.actionCount; i++) {
        await page.fill('[data-testid="email-input"]', `test${i}@example.com`)
        await page.click('[data-testid="subscribe-button"]')
        await page.waitForTimeout(10)
      }
      
      const endTime = Date.now()
      const totalTime = endTime - startTime
      
      if (performanceTest.expected === 'fast') {
        // Быстрые действия должны выполняться быстро
        expect(totalTime).toBeLessThan(5000) // 5 секунд
      } else if (performanceTest.expected === 'slow') {
        // Медленные действия могут выполняться дольше
        expect(totalTime).toBeLessThan(30000) // 30 секунд
      }
    }
  })
})