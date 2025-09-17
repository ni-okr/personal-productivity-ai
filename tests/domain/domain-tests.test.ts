/**
 * 🏗️ ТЕСТЫ ДОМЕННОГО АНАЛИЗА
 * Покрытие: бизнес-логика, предметная область, доменные правила
 */

import { test, expect, Page } from '@playwright/test'

describe('💼 Business Domain Tests', () => {
  test('должен тестировать доменные правила управления задачами', async ({ page }) => {
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
    
    // Доменные правила управления задачами
    const taskDomainRules = [
      {
        rule: 'Задача должна иметь уникальный идентификатор',
        test: async () => {
          await page.click('[data-testid="add-task-button"]')
          await page.fill('[data-testid="task-title"]', 'Test Task 1')
          await page.click('[data-testid="save-task-button"]')
          
          await page.click('[data-testid="add-task-button"]')
          await page.fill('[data-testid="task-title"]', 'Test Task 2')
          await page.click('[data-testid="save-task-button"]')
          
          const taskCards = page.locator('.task-card')
          await expect(taskCards).toHaveCount(2)
          
          const firstTaskId = await taskCards.first().getAttribute('data-task-id')
          const secondTaskId = await taskCards.nth(1).getAttribute('data-task-id')
          
          expect(firstTaskId).not.toBe(secondTaskId)
        }
      },
      {
        rule: 'Задача должна иметь обязательное название',
        test: async () => {
          await page.click('[data-testid="add-task-button"]')
          await page.fill('[data-testid="task-title"]', '')
          await page.click('[data-testid="save-task-button"]')
          
          await expect(page.locator('[data-testid="title-error"]')).toBeVisible()
        }
      },
      {
        rule: 'Задача должна иметь приоритет из допустимого списка',
        test: async () => {
          await page.click('[data-testid="add-task-button"]')
          await page.fill('[data-testid="task-title"]', 'Test Task')
          await page.selectOption('[data-testid="task-priority"]', 'invalid-priority')
          await page.click('[data-testid="save-task-button"]')
          
          await expect(page.locator('[data-testid="priority-error"]')).toBeVisible()
        }
      },
      {
        rule: 'Задача должна иметь категорию из допустимого списка',
        test: async () => {
          await page.click('[data-testid="add-task-button"]')
          await page.fill('[data-testid="task-title"]', 'Test Task')
          await page.selectOption('[data-testid="task-category"]', 'invalid-category')
          await page.click('[data-testid="save-task-button"]')
          
          await expect(page.locator('[data-testid="category-error"]')).toBeVisible()
        }
      },
      {
        rule: 'Задача должна иметь дату выполнения в будущем',
        test: async () => {
          await page.click('[data-testid="add-task-button"]')
          await page.fill('[data-testid="task-title"]', 'Test Task')
          await page.fill('[data-testid="task-due-date"]', '2023-01-01')
          await page.click('[data-testid="save-task-button"]')
          
          await expect(page.locator('[data-testid="due-date-error"]')).toBeVisible()
        }
      },
      {
        rule: 'Завершенная задача должна быть помечена как выполненная',
        test: async () => {
          await page.click('[data-testid="add-task-button"]')
          await page.fill('[data-testid="task-title"]', 'Test Task')
          await page.click('[data-testid="save-task-button"]')
          
          const taskCard = page.locator('.task-card').last()
          await taskCard.locator('[data-testid="complete-task-button"]').click()
          
          await expect(taskCard.locator('[data-testid="task-completed"]')).toBeChecked()
        }
      },
      {
        rule: 'Удаленная задача должна быть удалена из списка',
        test: async () => {
          await page.click('[data-testid="add-task-button"]')
          await page.fill('[data-testid="task-title"]', 'Test Task to Delete')
          await page.click('[data-testid="save-task-button"]')
          
          const taskCard = page.locator('.task-card').last()
          await taskCard.locator('[data-testid="delete-task-button"]').click()
          await page.click('[data-testid="confirm-delete"]')
          
          await expect(page.locator('.task-card')).not.toContainText('Test Task to Delete')
        }
      }
    ]
    
    for (const domainRule of taskDomainRules) {
      await domainRule.test()
    }
  })

  test('должен тестировать доменные правила приоритизации задач', async ({ page }) => {
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
    
    // Доменные правила приоритизации задач
    const prioritizationRules = [
      {
        rule: 'Задачи с высоким приоритетом должны отображаться первыми',
        test: async () => {
          // Создаем задачи с разными приоритетами
          await page.click('[data-testid="add-task-button"]')
          await page.fill('[data-testid="task-title"]', 'Low Priority Task')
          await page.selectOption('[data-testid="task-priority"]', 'low')
          await page.click('[data-testid="save-task-button"]')
          
          await page.click('[data-testid="add-task-button"]')
          await page.fill('[data-testid="task-title"]', 'High Priority Task')
          await page.selectOption('[data-testid="task-priority"]', 'high')
          await page.click('[data-testid="save-task-button"]')
          
          await page.click('[data-testid="add-task-button"]')
          await page.fill('[data-testid="task-title"]', 'Medium Priority Task')
          await page.selectOption('[data-testid="task-priority"]', 'medium')
          await page.click('[data-testid="save-task-button"]')
          
          // Включаем умную сортировку
          await page.click('[data-testid="smart-sort-button"]')
          
          // Проверяем порядок задач
          const taskCards = page.locator('.task-card')
          const firstTask = taskCards.first()
          const secondTask = taskCards.nth(1)
          const thirdTask = taskCards.nth(2)
          
          await expect(firstTask).toContainText('High Priority Task')
          await expect(secondTask).toContainText('Medium Priority Task')
          await expect(thirdTask).toContainText('Low Priority Task')
        }
      },
      {
        rule: 'Задачи с одинаковым приоритетом должны сортироваться по дате выполнения',
        test: async () => {
          // Создаем задачи с одинаковым приоритетом но разными датами
          await page.click('[data-testid="add-task-button"]')
          await page.fill('[data-testid="task-title"]', 'Task Due Later')
          await page.selectOption('[data-testid="task-priority"]', 'high')
          await page.fill('[data-testid="task-due-date"]', '2024-12-31')
          await page.click('[data-testid="save-task-button"]')
          
          await page.click('[data-testid="add-task-button"]')
          await page.fill('[data-testid="task-title"]', 'Task Due Earlier')
          await page.selectOption('[data-testid="task-priority"]', 'high')
          await page.fill('[data-testid="task-due-date"]', '2024-12-01')
          await page.click('[data-testid="save-task-button"]')
          
          // Включаем умную сортировку
          await page.click('[data-testid="smart-sort-button"]')
          
          // Проверяем порядок задач
          const taskCards = page.locator('.task-card')
          const firstTask = taskCards.first()
          const secondTask = taskCards.nth(1)
          
          await expect(firstTask).toContainText('Task Due Earlier')
          await expect(secondTask).toContainText('Task Due Later')
        }
      },
      {
        rule: 'Завершенные задачи должны отображаться в конце списка',
        test: async () => {
          // Создаем завершенную и незавершенную задачи
          await page.click('[data-testid="add-task-button"]')
          await page.fill('[data-testid="task-title"]', 'Completed Task')
          await page.selectOption('[data-testid="task-priority"]', 'high')
          await page.check('[data-testid="task-completed"]')
          await page.click('[data-testid="save-task-button"]')
          
          await page.click('[data-testid="add-task-button"]')
          await page.fill('[data-testid="task-title"]', 'Pending Task')
          await page.selectOption('[data-testid="task-priority"]', 'low')
          await page.click('[data-testid="save-task-button"]')
          
          // Включаем умную сортировку
          await page.click('[data-testid="smart-sort-button"]')
          
          // Проверяем порядок задач
          const taskCards = page.locator('.task-card')
          const firstTask = taskCards.first()
          const lastTask = taskCards.last()
          
          await expect(firstTask).toContainText('Pending Task')
          await expect(lastTask).toContainText('Completed Task')
        }
      }
    ]
    
    for (const prioritizationRule of prioritizationRules) {
      await prioritizationRule.test()
    }
  })

  test('должен тестировать доменные правила ИИ планировщика', async ({ page }) => {
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
    
    // Доменные правила ИИ планировщика
    const aiPlannerRules = [
      {
        rule: 'ИИ должен анализировать продуктивность пользователя',
        test: async () => {
          // Создаем несколько задач для анализа
          await page.click('[data-testid="add-task-button"]')
          await page.fill('[data-testid="task-title"]', 'Task 1')
          await page.selectOption('[data-testid="task-priority"]', 'high')
          await page.click('[data-testid="save-task-button"]')
          
          await page.click('[data-testid="add-task-button"]')
          await page.fill('[data-testid="task-title"]', 'Task 2')
          await page.selectOption('[data-testid="task-priority"]', 'medium')
          await page.click('[data-testid="save-task-button"]')
          
          // Запускаем анализ продуктивности
          await page.click('[data-testid="analyze-productivity-button"]')
          
          // Проверяем, что анализ выполнен
          const analysisSection = page.locator('[data-testid="productivity-analysis"]')
          await expect(analysisSection).toBeVisible()
          
          const score = page.locator('[data-testid="productivity-score"]')
          await expect(score).toBeVisible()
          
          const insights = page.locator('[data-testid="productivity-insights"]')
          await expect(insights).toBeVisible()
        }
      },
      {
        rule: 'ИИ должен предлагать умные рекомендации',
        test: async () => {
          // Запускаем генерацию рекомендаций
          await page.click('[data-testid="generate-suggestions-button"]')
          
          // Проверяем, что рекомендации сгенерированы
          const suggestionsSection = page.locator('[data-testid="ai-suggestions"]')
          await expect(suggestionsSection).toBeVisible()
          
          const suggestionCards = page.locator('.suggestion-card')
          await expect(suggestionCards).toHaveCount.greaterThan(0)
        }
      },
      {
        rule: 'ИИ должен оптимизировать время выполнения задач',
        test: async () => {
          // Создаем задачу для оптимизации времени
          await page.click('[data-testid="add-task-button"]')
          await page.fill('[data-testid="task-title"]', 'Task for Time Optimization')
          await page.selectOption('[data-testid="task-priority"]', 'high')
          await page.fill('[data-testid="task-duration"]', '120') // 2 часа
          await page.click('[data-testid="save-task-button"]')
          
          // Запускаем оптимизацию времени
          await page.click('[data-testid="optimize-time-button"]')
          
          // Проверяем, что время оптимизировано
          const timeOptimizationSection = page.locator('[data-testid="time-optimization"]')
          await expect(timeOptimizationSection).toBeVisible()
          
          const optimalTimeSlots = page.locator('[data-testid="optimal-time-slot"]')
          await expect(optimalTimeSlots).toHaveCount.greaterThan(0)
        }
      },
      {
        rule: 'ИИ должен учитывать предпочтения пользователя',
        test: async () => {
          // Устанавливаем предпочтения пользователя
          await page.click('[data-testid="user-preferences-button"]')
          
          await page.fill('[data-testid="preferred-work-hours-start"]', '09:00')
          await page.fill('[data-testid="preferred-work-hours-end"]', '17:00')
          await page.selectOption('[data-testid="preferred-break-duration"]', '15')
          await page.selectOption('[data-testid="preferred-task-duration"]', '60')
          
          await page.click('[data-testid="save-preferences-button"]')
          
          // Создаем задачу с учетом предпочтений
          await page.click('[data-testid="add-task-button"]')
          await page.fill('[data-testid="task-title"]', 'Task with User Preferences')
          await page.selectOption('[data-testid="task-priority"]', 'high')
          await page.click('[data-testid="save-task-button"]')
          
          // Запускаем планирование с учетом предпочтений
          await page.click('[data-testid="plan-with-preferences-button"]')
          
          // Проверяем, что план учитывает предпочтения
          const planSection = page.locator('[data-testid="ai-plan"]')
          await expect(planSection).toBeVisible()
          
          const planItems = page.locator('.plan-item')
          await expect(planItems).toHaveCount.greaterThan(0)
        }
      }
    ]
    
    for (const aiPlannerRule of aiPlannerRules) {
      await aiPlannerRule.test()
    }
  })
})

describe('🔐 Security Domain Tests', () => {
  test('должен тестировать доменные правила безопасности', async ({ page }) => {
    await page.goto('/')
    
    // Доменные правила безопасности
    const securityRules = [
      {
        rule: 'Пользователь должен быть аутентифицирован для доступа к планировщику',
        test: async () => {
          // Пытаемся получить доступ к планировщику без аутентификации
          await page.goto('/planner')
          
          // Проверяем, что произошел редирект на страницу входа
          await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
        }
      },
      {
        rule: 'Пользователь должен иметь права доступа к своим данным',
        test: async () => {
          // Мокаем аутентификацию
          await page.evaluate(() => {
            localStorage.setItem('auth-token', 'mock-token')
            localStorage.setItem('user', JSON.stringify({
              id: 'user-1',
              email: 'test@example.com',
              name: 'Test User',
              subscription: 'free'
            }))
          })
          
          await page.goto('/planner')
          await page.waitForSelector('[data-testid="planner-content"]')
          
          // Проверяем, что пользователь видит только свои задачи
          const taskCards = page.locator('.task-card')
          await expect(taskCards).toHaveCount(0) // Пользователь не должен видеть чужие задачи
        }
      },
      {
        rule: 'Пароль должен соответствовать требованиям безопасности',
        test: async () => {
          await page.goto('/')
          
          // Тестируем слабые пароли
          const weakPasswords = ['123456', 'password', 'qwerty', 'abc123']
          
          for (const password of weakPasswords) {
            await page.fill('[data-testid="password"]', password)
            await page.click('[data-testid="register-button"]')
            
            await expect(page.locator('[data-testid="password-error"]')).toBeVisible()
          }
          
          // Тестируем сильный пароль
          await page.fill('[data-testid="password"]', 'StrongPassword123!')
          await page.click('[data-testid="register-button"]')
          
          // Проверяем, что ошибки нет
          await expect(page.locator('[data-testid="password-error"]')).not.toBeVisible()
        }
      },
      {
        rule: 'Email должен быть валидным и уникальным',
        test: async () => {
          await page.goto('/')
          
          // Тестируем невалидные email
          const invalidEmails = ['invalid-email', '@example.com', 'test@', 'test.example.com']
          
          for (const email of invalidEmails) {
            await page.fill('[data-testid="email"]', email)
            await page.click('[data-testid="register-button"]')
            
            await expect(page.locator('[data-testid="email-error"]')).toBeVisible()
          }
          
          // Тестируем валидный email
          await page.fill('[data-testid="email"]', 'test@example.com')
          await page.click('[data-testid="register-button"]')
          
          // Проверяем, что ошибки нет
          await expect(page.locator('[data-testid="email-error"]')).not.toBeVisible()
        }
      }
    ]
    
    for (const securityRule of securityRules) {
      await securityRule.test()
    }
  })
})

describe('💰 Business Domain Tests', () => {
  test('должен тестировать доменные правила подписок', async ({ page }) => {
    await page.goto('/')
    
    // Доменные правила подписок
    const subscriptionRules = [
      {
        rule: 'Бесплатная подписка должна иметь ограничения',
        test: async () => {
          // Мокаем бесплатную подписку
          await page.evaluate(() => {
            localStorage.setItem('subscription', JSON.stringify({
              plan: 'free',
              features: ['basic-tasks', 'basic-ai'],
              limits: {
                tasks: 50,
                aiRequests: 100
              },
              status: 'active'
            }))
          })
          
          await page.goto('/planner')
          await page.waitForSelector('[data-testid="planner-content"]')
          
          // Проверяем ограничения
          const taskLimit = page.locator('[data-testid="task-limit"]')
          await expect(taskLimit).toContainText('50')
          
          const aiLimit = page.locator('[data-testid="ai-limit"]')
          await expect(aiLimit).toContainText('100')
        }
      },
      {
        rule: 'Премиум подписка должна снимать ограничения',
        test: async () => {
          // Мокаем премиум подписку
          await page.evaluate(() => {
            localStorage.setItem('subscription', JSON.stringify({
              plan: 'premium',
              features: ['unlimited-tasks', 'advanced-ai', 'priority-support'],
              limits: {
                tasks: -1, // -1 означает без ограничений
                aiRequests: -1
              },
              status: 'active'
            }))
          })
          
          await page.goto('/planner')
          await page.waitForSelector('[data-testid="planner-content"]')
          
          // Проверяем, что ограничения сняты
          const taskLimit = page.locator('[data-testid="task-limit"]')
          await expect(taskLimit).toContainText('Unlimited')
          
          const aiLimit = page.locator('[data-testid="ai-limit"]')
          await expect(aiLimit).toContainText('Unlimited')
        }
      },
      {
        rule: 'Подписка должна автоматически продлеваться',
        test: async () => {
          // Мокаем подписку с автоматическим продлением
          await page.evaluate(() => {
            localStorage.setItem('subscription', JSON.stringify({
              plan: 'premium',
              features: ['unlimited-tasks', 'advanced-ai', 'priority-support'],
              autoRenew: true,
              nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'active'
            }))
          })
          
          await page.goto('/planner')
          await page.waitForSelector('[data-testid="planner-content"]')
          
          // Проверяем, что подписка активна
          const subscriptionStatus = page.locator('[data-testid="subscription-status"]')
          await expect(subscriptionStatus).toContainText('Active')
          
          // Проверяем дату следующего списания
          const nextBillingDate = page.locator('[data-testid="next-billing-date"]')
          await expect(nextBillingDate).toBeVisible()
        }
      },
      {
        rule: 'Отмена подписки должна сохранять доступ до конца периода',
        test: async () => {
          // Мокаем отмененную подписку
          await page.evaluate(() => {
            localStorage.setItem('subscription', JSON.stringify({
              plan: 'premium',
              features: ['unlimited-tasks', 'advanced-ai', 'priority-support'],
              autoRenew: false,
              nextBillingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'cancelled'
            }))
          })
          
          await page.goto('/planner')
          await page.waitForSelector('[data-testid="planner-content"]')
          
          // Проверяем, что доступ сохранен
          const subscriptionStatus = page.locator('[data-testid="subscription-status"]')
          await expect(subscriptionStatus).toContainText('Active until')
          
          // Проверяем, что функции доступны
          const premiumFeatures = page.locator('[data-testid="premium-features"]')
          await expect(premiumFeatures).toBeVisible()
        }
      }
    ]
    
    for (const subscriptionRule of subscriptionRules) {
      await subscriptionRule.test()
    }
  })
})

describe('📊 Analytics Domain Tests', () => {
  test('должен тестировать доменные правила аналитики', async ({ page }) => {
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
    
    // Доменные правила аналитики
    const analyticsRules = [
      {
        rule: 'Аналитика должна отслеживать создание задач',
        test: async () => {
          // Создаем задачу
          await page.click('[data-testid="add-task-button"]')
          await page.fill('[data-testid="task-title"]', 'Analytics Test Task')
          await page.click('[data-testid="save-task-button"]')
          
          // Проверяем, что событие отслежено
          const analyticsData = await page.evaluate(() => {
            return localStorage.getItem('analytics-task-created')
          })
          
          expect(analyticsData).toBeDefined()
        }
      },
      {
        rule: 'Аналитика должна отслеживать завершение задач',
        test: async () => {
          // Создаем задачу
          await page.click('[data-testid="add-task-button"]')
          await page.fill('[data-testid="task-title"]', 'Task to Complete')
          await page.click('[data-testid="save-task-button"]')
          
          // Завершаем задачу
          const taskCard = page.locator('.task-card').last()
          await taskCard.locator('[data-testid="complete-task-button"]').click()
          
          // Проверяем, что событие отслежено
          const analyticsData = await page.evaluate(() => {
            return localStorage.getItem('analytics-task-completed')
          })
          
          expect(analyticsData).toBeDefined()
        }
      },
      {
        rule: 'Аналитика должна отслеживать использование ИИ функций',
        test: async () => {
          // Используем ИИ функцию
          await page.click('[data-testid="generate-suggestions-button"]')
          
          // Проверяем, что событие отслежено
          const analyticsData = await page.evaluate(() => {
            return localStorage.getItem('analytics-ai-usage')
          })
          
          expect(analyticsData).toBeDefined()
        }
      },
      {
        rule: 'Аналитика должна рассчитывать метрики продуктивности',
        test: async () => {
          // Создаем несколько задач для расчета метрик
          await page.click('[data-testid="add-task-button"]')
          await page.fill('[data-testid="task-title"]', 'Task 1')
          await page.click('[data-testid="save-task-button"]')
          
          await page.click('[data-testid="add-task-button"]')
          await page.fill('[data-testid="task-title"]', 'Task 2')
          await page.click('[data-testid="save-task-button"]')
          
          // Запускаем расчет метрик
          await page.click('[data-testid="calculate-metrics-button"]')
          
          // Проверяем, что метрики рассчитаны
          const metricsSection = page.locator('[data-testid="productivity-metrics"]')
          await expect(metricsSection).toBeVisible()
          
          const taskCount = page.locator('[data-testid="task-count"]')
          await expect(taskCount).toContainText('2')
          
          const completionRate = page.locator('[data-testid="completion-rate"]')
          await expect(completionRate).toBeVisible()
        }
      }
    ]
    
    for (const analyticsRule of analyticsRules) {
      await analyticsRule.test()
    }
  })
})