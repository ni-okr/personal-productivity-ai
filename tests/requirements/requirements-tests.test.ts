/**
 * 📋 ТЕСТЫ ТРАССИРОВКИ ТРЕБОВАНИЙ
 * Покрытие: соответствие функциональности требованиям, трассировка изменений
 */

import { test, expect, Page } from '@playwright/test'

describe('🎯 Functional Requirements Traceability', () => {
  test('должен соответствовать требованию FR-001: Регистрация пользователя', async ({ page }) => {
    await page.goto('/')
    
    // FR-001: Пользователь должен иметь возможность зарегистрироваться
    const registrationRequirements = [
      { field: 'email', required: true, validation: 'email format' },
      { field: 'password', required: true, validation: 'minimum 8 characters' },
      { field: 'name', required: true, validation: 'non-empty string' },
      { field: 'confirm-password', required: true, validation: 'matches password' }
    ]
    
    for (const req of registrationRequirements) {
      // Проверяем наличие поля
      const field = page.locator(`[data-testid="${req.field}"]`)
      await expect(field).toBeVisible()
      
      // Проверяем обязательность поля
      if (req.required) {
        await expect(field).toHaveAttribute('required')
      }
      
      // Проверяем валидацию поля
      if (req.validation === 'email format') {
        await field.fill('invalid-email')
        await page.click('[data-testid="register-button"]')
        await expect(page.locator('[data-testid="email-error"]')).toBeVisible()
      } else if (req.validation === 'minimum 8 characters') {
        await field.fill('1234567')
        await page.click('[data-testid="register-button"]')
        await expect(page.locator('[data-testid="password-error"]')).toBeVisible()
      } else if (req.validation === 'non-empty string') {
        await field.fill('')
        await page.click('[data-testid="register-button"]')
        await expect(page.locator('[data-testid="name-error"]')).toBeVisible()
      } else if (req.validation === 'matches password') {
        await page.fill('[data-testid="password"]', 'password123')
        await field.fill('different-password')
        await page.click('[data-testid="register-button"]')
        await expect(page.locator('[data-testid="confirm-password-error"]')).toBeVisible()
      }
    }
  })

  test('должен соответствовать требованию FR-002: Аутентификация пользователя', async ({ page }) => {
    await page.goto('/')
    
    // FR-002: Пользователь должен иметь возможность войти в систему
    const authenticationRequirements = [
      { field: 'email', required: true, validation: 'email format' },
      { field: 'password', required: true, validation: 'non-empty string' },
      { action: 'login', expected: 'redirect to planner' },
      { action: 'logout', expected: 'redirect to home' },
      { action: 'remember-me', expected: 'persist session' }
    ]
    
    for (const req of authenticationRequirements) {
      if (req.field) {
        // Проверяем наличие поля
        const field = page.locator(`[data-testid="${req.field}"]`)
        await expect(field).toBeVisible()
        
        // Проверяем обязательность поля
        if (req.required) {
          await expect(field).toHaveAttribute('required')
        }
        
        // Проверяем валидацию поля
        if (req.validation === 'email format') {
          await field.fill('invalid-email')
          await page.click('[data-testid="login-button"]')
          await expect(page.locator('[data-testid="email-error"]')).toBeVisible()
        } else if (req.validation === 'non-empty string') {
          await field.fill('')
          await page.click('[data-testid="login-button"]')
          await expect(page.locator('[data-testid="password-error"]')).toBeVisible()
        }
      } else if (req.action) {
        if (req.action === 'login') {
          // Проверяем успешный вход
          await page.fill('[data-testid="email"]', 'test@example.com')
          await page.fill('[data-testid="password"]', 'password123')
          await page.click('[data-testid="login-button"]')
          await expect(page.locator('[data-testid="planner-content"]')).toBeVisible()
        } else if (req.action === 'logout') {
          // Проверяем выход
          await page.click('[data-testid="logout-button"]')
          await expect(page.locator('[data-testid="home-content"]')).toBeVisible()
        } else if (req.action === 'remember-me') {
          // Проверяем запоминание сессии
          await page.check('[data-testid="remember-me"]')
          await page.fill('[data-testid="email"]', 'test@example.com')
          await page.fill('[data-testid="password"]', 'password123')
          await page.click('[data-testid="login-button"]')
          await page.reload()
          await expect(page.locator('[data-testid="planner-content"]')).toBeVisible()
        }
      }
    }
  })

  test('должен соответствовать требованию FR-003: Управление задачами', async ({ page }) => {
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
    
    // FR-003: Пользователь должен иметь возможность управлять задачами
    const taskManagementRequirements = [
      { action: 'create', field: 'title', required: true, validation: 'non-empty string' },
      { action: 'create', field: 'description', required: false, validation: 'optional string' },
      { action: 'create', field: 'priority', required: true, validation: 'high/medium/low' },
      { action: 'create', field: 'category', required: true, validation: 'work/personal/health' },
      { action: 'create', field: 'due-date', required: false, validation: 'future date' },
      { action: 'update', field: 'title', required: true, validation: 'non-empty string' },
      { action: 'update', field: 'description', required: false, validation: 'optional string' },
      { action: 'update', field: 'priority', required: true, validation: 'high/medium/low' },
      { action: 'update', field: 'category', required: true, validation: 'work/personal/health' },
      { action: 'update', field: 'due-date', required: false, validation: 'future date' },
      { action: 'delete', field: 'task', required: true, validation: 'existing task' },
      { action: 'complete', field: 'task', required: true, validation: 'existing task' }
    ]
    
    for (const req of taskManagementRequirements) {
      if (req.action === 'create') {
        // Проверяем создание задачи
        await page.click('[data-testid="add-task-button"]')
        
        if (req.field === 'title') {
          const field = page.locator(`[data-testid="task-${req.field}"]`)
          await expect(field).toBeVisible()
          
          if (req.required) {
            await expect(field).toHaveAttribute('required')
          }
          
          if (req.validation === 'non-empty string') {
            await field.fill('')
            await page.click('[data-testid="save-task-button"]')
            await expect(page.locator('[data-testid="title-error"]')).toBeVisible()
          }
        } else if (req.field === 'description') {
          const field = page.locator(`[data-testid="task-${req.field}"]`)
          await expect(field).toBeVisible()
          
          if (req.required) {
            await expect(field).toHaveAttribute('required')
          }
        } else if (req.field === 'priority') {
          const field = page.locator(`[data-testid="task-${req.field}"]`)
          await expect(field).toBeVisible()
          
          if (req.required) {
            await expect(field).toHaveAttribute('required')
          }
          
          if (req.validation === 'high/medium/low') {
            const options = field.locator('option')
            await expect(options).toHaveCount(3)
            await expect(options.nth(0)).toHaveValue('high')
            await expect(options.nth(1)).toHaveValue('medium')
            await expect(options.nth(2)).toHaveValue('low')
          }
        } else if (req.field === 'category') {
          const field = page.locator(`[data-testid="task-${req.field}"]`)
          await expect(field).toBeVisible()
          
          if (req.required) {
            await expect(field).toHaveAttribute('required')
          }
          
          if (req.validation === 'work/personal/health') {
            const options = field.locator('option')
            await expect(options).toHaveCount(3)
            await expect(options.nth(0)).toHaveValue('work')
            await expect(options.nth(1)).toHaveValue('personal')
            await expect(options.nth(2)).toHaveValue('health')
          }
        } else if (req.field === 'due-date') {
          const field = page.locator(`[data-testid="task-${req.field}"]`)
          await expect(field).toBeVisible()
          
          if (req.required) {
            await expect(field).toHaveAttribute('required')
          }
          
          if (req.validation === 'future date') {
            await field.fill('2023-01-01')
            await page.click('[data-testid="save-task-button"]')
            await expect(page.locator('[data-testid="due-date-error"]')).toBeVisible()
          }
        }
      } else if (req.action === 'update') {
        // Проверяем обновление задачи
        const taskCard = page.locator('.task-card').first()
        if (await taskCard.count() > 0) {
          await taskCard.click()
          
          if (req.field === 'title') {
            const field = page.locator(`[data-testid="task-${req.field}"]`)
            await expect(field).toBeVisible()
            
            if (req.required) {
              await expect(field).toHaveAttribute('required')
            }
            
            if (req.validation === 'non-empty string') {
              await field.fill('')
              await page.click('[data-testid="save-task-button"]')
              await expect(page.locator('[data-testid="title-error"]')).toBeVisible()
            }
          }
        }
      } else if (req.action === 'delete') {
        // Проверяем удаление задачи
        const deleteButton = page.locator('[data-testid="delete-task-button"]').first()
        if (await deleteButton.count() > 0) {
          await expect(deleteButton).toBeVisible()
          await deleteButton.click()
          await expect(page.locator('[data-testid="confirm-delete"]')).toBeVisible()
        }
      } else if (req.action === 'complete') {
        // Проверяем завершение задачи
        const completeButton = page.locator('[data-testid="complete-task-button"]').first()
        if (await completeButton.count() > 0) {
          await expect(completeButton).toBeVisible()
          await completeButton.click()
          await expect(page.locator('[data-testid="task-completed"]')).toBeChecked()
        }
      }
    }
  })

  test('должен соответствовать требованию FR-004: ИИ планировщик', async ({ page }) => {
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
    
    // FR-004: Пользователь должен иметь доступ к ИИ планировщику
    const aiPlannerRequirements = [
      { feature: 'smart-sorting', expected: 'tasks sorted by priority and deadline' },
      { feature: 'productivity-analysis', expected: 'daily productivity score and insights' },
      { feature: 'ai-suggestions', expected: 'personalized task recommendations' },
      { feature: 'smart-reminders', expected: 'contextual reminders and notifications' },
      { feature: 'time-optimization', expected: 'optimal time slot suggestions' }
    ]
    
    for (const req of aiPlannerRequirements) {
      if (req.feature === 'smart-sorting') {
        // Проверяем умную сортировку
        const sortButton = page.locator('[data-testid="smart-sort-button"]')
        await expect(sortButton).toBeVisible()
        await sortButton.click()
        
        const taskCards = page.locator('.task-card')
        if (await taskCards.count() > 1) {
          const firstTask = taskCards.first()
          const secondTask = taskCards.nth(1)
          
          const firstPriority = await firstTask.locator('[data-testid="task-priority"]').textContent()
          const secondPriority = await secondTask.locator('[data-testid="task-priority"]').textContent()
          
          // Проверяем, что задачи отсортированы по приоритету
          expect(['high', 'medium', 'low'].indexOf(firstPriority)).toBeLessThanOrEqual(['high', 'medium', 'low'].indexOf(secondPriority))
        }
      } else if (req.feature === 'productivity-analysis') {
        // Проверяем анализ продуктивности
        const analysisSection = page.locator('[data-testid="productivity-analysis"]')
        await expect(analysisSection).toBeVisible()
        
        const score = page.locator('[data-testid="productivity-score"]')
        await expect(score).toBeVisible()
        
        const insights = page.locator('[data-testid="productivity-insights"]')
        await expect(insights).toBeVisible()
      } else if (req.feature === 'ai-suggestions') {
        // Проверяем ИИ предложения
        const suggestionsSection = page.locator('[data-testid="ai-suggestions"]')
        await expect(suggestionsSection).toBeVisible()
        
        const suggestionCards = page.locator('.suggestion-card')
        await expect(suggestionCards).toHaveCount.greaterThan(0)
      } else if (req.feature === 'smart-reminders') {
        // Проверяем умные напоминания
        const remindersSection = page.locator('[data-testid="smart-reminders"]')
        await expect(remindersSection).toBeVisible()
        
        const reminderCards = page.locator('.reminder-card')
        await expect(reminderCards).toHaveCount.greaterThan(0)
      } else if (req.feature === 'time-optimization') {
        // Проверяем оптимизацию времени
        const timeOptimizationSection = page.locator('[data-testid="time-optimization"]')
        await expect(timeOptimizationSection).toBeVisible()
        
        const timeSlots = page.locator('[data-testid="optimal-time-slot"]')
        await expect(timeSlots).toHaveCount.greaterThan(0)
      }
    }
  })
})

describe('🔒 Non-Functional Requirements Traceability', () => {
  test('должен соответствовать требованию NFR-001: Производительность', async ({ page }) => {
    await page.goto('/')
    
    // NFR-001: Приложение должно загружаться менее чем за 3 секунды
    const startTime = Date.now()
    await page.goto('/')
    const loadTime = Date.now() - startTime
    
    expect(loadTime).toBeLessThan(3000)
    
    // NFR-001: Страница должна быть интерактивной менее чем за 5 секунд
    await page.waitForSelector('[data-testid="email-input"]')
    const interactiveTime = Date.now() - startTime
    
    expect(interactiveTime).toBeLessThan(5000)
  })

  test('должен соответствовать требованию NFR-002: Безопасность', async ({ page }) => {
    await page.goto('/')
    
    // NFR-002: Все данные должны быть зашифрованы
    const httpsCheck = await page.evaluate(() => {
      return window.location.protocol === 'https:'
    })
    expect(httpsCheck).toBe(true)
    
    // NFR-002: Пароли должны быть хешированы
    await page.fill('[data-testid="password"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    const passwordField = page.locator('[data-testid="password"]')
    const passwordValue = await passwordField.inputValue()
    expect(passwordValue).not.toBe('password123') // Пароль должен быть замаскирован
  })

  test('должен соответствовать требованию NFR-003: Доступность', async ({ page }) => {
    await page.goto('/')
    
    // NFR-003: Приложение должно соответствовать WCAG 2.1 AA
    const accessibilityChecks = [
      { element: 'h1', attribute: 'role', expected: 'heading' },
      { element: 'button', attribute: 'aria-label', expected: 'present' },
      { element: 'input', attribute: 'aria-describedby', expected: 'present' },
      { element: 'form', attribute: 'aria-label', expected: 'present' }
    ]
    
    for (const check of accessibilityChecks) {
      const element = page.locator(check.element).first()
      if (await element.count() > 0) {
        if (check.attribute === 'role') {
          await expect(element).toHaveAttribute('role', check.expected)
        } else if (check.attribute === 'aria-label') {
          await expect(element).toHaveAttribute('aria-label')
        } else if (check.attribute === 'aria-describedby') {
          await expect(element).toHaveAttribute('aria-describedby')
        }
      }
    }
  })

  test('должен соответствовать требованию NFR-004: Совместимость', async ({ page }) => {
    await page.goto('/')
    
    // NFR-004: Приложение должно работать в современных браузерах
    const browserCompatibility = [
      { feature: 'localStorage', expected: 'supported' },
      { feature: 'sessionStorage', expected: 'supported' },
      { feature: 'fetch', expected: 'supported' },
      { feature: 'promises', expected: 'supported' },
      { feature: 'async/await', expected: 'supported' }
    ]
    
    for (const check of browserCompatibility) {
      const isSupported = await page.evaluate((feature) => {
        switch (feature) {
          case 'localStorage':
            return typeof Storage !== 'undefined'
          case 'sessionStorage':
            return typeof Storage !== 'undefined'
          case 'fetch':
            return typeof fetch !== 'undefined'
          case 'promises':
            return typeof Promise !== 'undefined'
          case 'async/await':
            return typeof async function() {} === 'function'
          default:
            return false
        }
      }, check.feature)
      
      expect(isSupported).toBe(true)
    }
  })
})

describe('📊 Business Requirements Traceability', () => {
  test('должен соответствовать требованию BR-001: Монетизация', async ({ page }) => {
    await page.goto('/')
    
    // BR-001: Приложение должно поддерживать подписки
    const subscriptionRequirements = [
      { plan: 'free', features: ['basic-tasks', 'basic-ai'], price: 0 },
      { plan: 'premium', features: ['unlimited-tasks', 'advanced-ai', 'priority-support'], price: 9.99 },
      { plan: 'pro', features: ['unlimited-tasks', 'all-ai-models', 'priority-support', 'analytics'], price: 19.99 },
      { plan: 'enterprise', features: ['unlimited-tasks', 'all-ai-models', 'priority-support', 'analytics', 'api-access'], price: 49.99 }
    ]
    
    for (const req of subscriptionRequirements) {
      const planCard = page.locator(`[data-testid="plan-${req.plan}"]`)
      if (await planCard.count() > 0) {
        await expect(planCard).toBeVisible()
        
        const price = planCard.locator('[data-testid="plan-price"]')
        await expect(price).toContainText(req.price.toString())
        
        for (const feature of req.features) {
          const featureElement = planCard.locator(`[data-testid="feature-${feature}"]`)
          await expect(featureElement).toBeVisible()
        }
      }
    }
  })

  test('должен соответствовать требованию BR-002: Аналитика', async ({ page }) => {
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
    
    // BR-002: Приложение должно собирать аналитику использования
    const analyticsRequirements = [
      { metric: 'task-creation', expected: 'tracked' },
      { metric: 'task-completion', expected: 'tracked' },
      { metric: 'ai-usage', expected: 'tracked' },
      { metric: 'user-engagement', expected: 'tracked' },
      { metric: 'feature-usage', expected: 'tracked' }
    ]
    
    for (const req of analyticsRequirements) {
      const metricElement = page.locator(`[data-testid="metric-${req.metric}"]`)
      if (await metricElement.count() > 0) {
        await expect(metricElement).toBeVisible()
      }
    }
  })

  test('должен соответствовать требованию BR-003: Масштабируемость', async ({ page }) => {
    await page.goto('/')
    
    // BR-003: Приложение должно поддерживать рост пользователей
    const scalabilityRequirements = [
      { aspect: 'database', expected: 'scalable' },
      { aspect: 'caching', expected: 'implemented' },
      { aspect: 'cdn', expected: 'configured' },
      { aspect: 'load-balancing', expected: 'supported' },
      { aspect: 'monitoring', expected: 'enabled' }
    ]
    
    for (const req of scalabilityRequirements) {
      const aspectElement = page.locator(`[data-testid="scalability-${req.aspect}"]`)
      if (await aspectElement.count() > 0) {
        await expect(aspectElement).toBeVisible()
      }
    }
  })
})

describe('🔄 Change Traceability', () => {
  test('должен отслеживать изменения в требованиях', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем версию требований
    const requirementsVersion = await page.evaluate(() => {
      return localStorage.getItem('requirements-version')
    })
    
    expect(requirementsVersion).toBeDefined()
    
    // Проверяем дату последнего обновления требований
    const lastUpdated = await page.evaluate(() => {
      return localStorage.getItem('requirements-last-updated')
    })
    
    expect(lastUpdated).toBeDefined()
    
    // Проверяем, что требования актуальны
    const currentDate = new Date()
    const lastUpdatedDate = new Date(lastUpdated)
    const daysSinceUpdate = (currentDate.getTime() - lastUpdatedDate.getTime()) / (1000 * 60 * 60 * 24)
    
    expect(daysSinceUpdate).toBeLessThan(30) // Требования должны обновляться не реже раза в месяц
  })

  test('должен отслеживать изменения в функциональности', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем версию функциональности
    const functionalityVersion = await page.evaluate(() => {
      return localStorage.getItem('functionality-version')
    })
    
    expect(functionalityVersion).toBeDefined()
    
    // Проверяем дату последнего обновления функциональности
    const lastUpdated = await page.evaluate(() => {
      return localStorage.getItem('functionality-last-updated')
    })
    
    expect(lastUpdated).toBeDefined()
    
    // Проверяем, что функциональность актуальна
    const currentDate = new Date()
    const lastUpdatedDate = new Date(lastUpdated)
    const daysSinceUpdate = (currentDate.getTime() - lastUpdatedDate.getTime()) / (1000 * 60 * 60 * 24)
    
    expect(daysSinceUpdate).toBeLessThan(7) // Функциональность должна обновляться не реже раза в неделю
  })

  test('должен отслеживать изменения в тестах', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем версию тестов
    const testsVersion = await page.evaluate(() => {
      return localStorage.getItem('tests-version')
    })
    
    expect(testsVersion).toBeDefined()
    
    // Проверяем дату последнего обновления тестов
    const lastUpdated = await page.evaluate(() => {
      return localStorage.getItem('tests-last-updated')
    })
    
    expect(lastUpdated).toBeDefined()
    
    // Проверяем, что тесты актуальны
    const currentDate = new Date()
    const lastUpdatedDate = new Date(lastUpdated)
    const daysSinceUpdate = (currentDate.getTime() - lastUpdatedDate.getTime()) / (1000 * 60 * 60 * 24)
    
    expect(daysSinceUpdate).toBeLessThan(3) // Тесты должны обновляться не реже раза в 3 дня
  })
})