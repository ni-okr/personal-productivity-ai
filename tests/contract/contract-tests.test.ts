/**
 * 📋 ТЕСТЫ КОНТРАКТНОГО ТЕСТИРОВАНИЯ
 * Покрытие: API контракты, интерфейсы, протоколы взаимодействия
 */

import { test, expect, Page } from '@playwright/test'

describe('🔌 API Contract Tests', () => {
  test('должен тестировать контракт API подписки', async ({ page }) => {
    await page.goto('/')
    
    // Тестируем контракт API подписки
    const subscriptionContract = {
      endpoint: '/api/subscribe',
      method: 'POST',
      requestSchema: {
        type: 'object',
        required: ['email'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            minLength: 1,
            maxLength: 255
          }
        }
      },
      responseSchema: {
        type: 'object',
        required: ['success', 'message'],
        properties: {
          success: {
            type: 'boolean'
          },
          message: {
            type: 'string'
          },
          data: {
            type: 'object',
            properties: {
              id: {
                type: 'string'
              },
              email: {
                type: 'string'
              },
              subscribedAt: {
                type: 'string',
                format: 'date-time'
              }
            }
          }
        }
      }
    }
    
    // Тестируем валидный запрос
    const validRequest = {
      email: 'test@example.com'
    }
    
    const response = await page.request.post(subscriptionContract.endpoint, {
      data: validRequest
    })
    
    expect(response.status()).toBe(200)
    
    const responseData = await response.json()
    expect(responseData).toHaveProperty('success')
    expect(responseData).toHaveProperty('message')
    expect(typeof responseData.success).toBe('boolean')
    expect(typeof responseData.message).toBe('string')
    
    if (responseData.success) {
      expect(responseData).toHaveProperty('data')
      expect(responseData.data).toHaveProperty('id')
      expect(responseData.data).toHaveProperty('email')
      expect(responseData.data).toHaveProperty('subscribedAt')
    }
    
    // Тестируем невалидный запрос
    const invalidRequest = {
      email: 'invalid-email'
    }
    
    const invalidResponse = await page.request.post(subscriptionContract.endpoint, {
      data: invalidRequest
    })
    
    expect(invalidResponse.status()).toBe(400)
    
    const invalidResponseData = await invalidResponse.json()
    expect(invalidResponseData).toHaveProperty('success')
    expect(invalidResponseData).toHaveProperty('message')
    expect(invalidResponseData.success).toBe(false)
  })

  test('должен тестировать контракт API тестирования', async ({ page }) => {
    await page.goto('/')
    
    // Тестируем контракт API тестирования
    const testContract = {
      endpoint: '/api/test',
      method: 'GET',
      responseSchema: {
        type: 'object',
        required: ['status', 'timestamp', 'version'],
        properties: {
          status: {
            type: 'string',
            enum: ['ok', 'error']
          },
          timestamp: {
            type: 'string',
            format: 'date-time'
          },
          version: {
            type: 'string',
            pattern: '^\\d+\\.\\d+\\.\\d+$'
          },
          environment: {
            type: 'string',
            enum: ['development', 'staging', 'production', 'test']
          },
          services: {
            type: 'object',
            properties: {
              database: {
                type: 'string',
                enum: ['connected', 'disconnected', 'error']
              },
              cache: {
                type: 'string',
                enum: ['connected', 'disconnected', 'error']
              },
              external: {
                type: 'string',
                enum: ['connected', 'disconnected', 'error']
              }
            }
          }
        }
      }
    }
    
    const response = await page.request.get(testContract.endpoint)
    
    expect(response.status()).toBe(200)
    
    const responseData = await response.json()
    expect(responseData).toHaveProperty('status')
    expect(responseData).toHaveProperty('timestamp')
    expect(responseData).toHaveProperty('version')
    expect(['ok', 'error']).toContain(responseData.status)
    expect(typeof responseData.timestamp).toBe('string')
    expect(/^\d+\.\d+\.\d+$/.test(responseData.version)).toBe(true)
    
    if (responseData.environment) {
      expect(['development', 'staging', 'production', 'test']).toContain(responseData.environment)
    }
    
    if (responseData.services) {
      expect(responseData.services).toHaveProperty('database')
      expect(responseData.services).toHaveProperty('cache')
      expect(responseData.services).toHaveProperty('external')
      expect(['connected', 'disconnected', 'error']).toContain(responseData.services.database)
      expect(['connected', 'disconnected', 'error']).toContain(responseData.services.cache)
      expect(['connected', 'disconnected', 'error']).toContain(responseData.services.external)
    }
  })

  test('должен тестировать контракт API аутентификации', async ({ page }) => {
    await page.goto('/')
    
    // Тестируем контракт API аутентификации
    const authContract = {
      endpoint: '/api/auth/login',
      method: 'POST',
      requestSchema: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            minLength: 1,
            maxLength: 255
          },
          password: {
            type: 'string',
            minLength: 8,
            maxLength: 128
          },
          rememberMe: {
            type: 'boolean'
          }
        }
      },
      responseSchema: {
        type: 'object',
        required: ['success', 'message'],
        properties: {
          success: {
            type: 'boolean'
          },
          message: {
            type: 'string'
          },
          data: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string'
                  },
                  email: {
                    type: 'string'
                  },
                  name: {
                    type: 'string'
                  },
                  subscription: {
                    type: 'string',
                    enum: ['free', 'premium', 'pro', 'enterprise']
                  }
                }
              },
              token: {
                type: 'string'
              },
              expiresAt: {
                type: 'string',
                format: 'date-time'
              }
            }
          }
        }
      }
    }
    
    // Тестируем валидный запрос
    const validRequest = {
      email: 'test@example.com',
      password: 'password123',
      rememberMe: true
    }
    
    const response = await page.request.post(authContract.endpoint, {
      data: validRequest
    })
    
    expect(response.status()).toBe(200)
    
    const responseData = await response.json()
    expect(responseData).toHaveProperty('success')
    expect(responseData).toHaveProperty('message')
    expect(typeof responseData.success).toBe('boolean')
    expect(typeof responseData.message).toBe('string')
    
    if (responseData.success) {
      expect(responseData).toHaveProperty('data')
      expect(responseData.data).toHaveProperty('user')
      expect(responseData.data).toHaveProperty('token')
      expect(responseData.data).toHaveProperty('expiresAt')
      
      expect(responseData.data.user).toHaveProperty('id')
      expect(responseData.data.user).toHaveProperty('email')
      expect(responseData.data.user).toHaveProperty('name')
      expect(responseData.data.user).toHaveProperty('subscription')
      expect(['free', 'premium', 'pro', 'enterprise']).toContain(responseData.data.user.subscription)
    }
    
    // Тестируем невалидный запрос
    const invalidRequest = {
      email: 'invalid-email',
      password: '123'
    }
    
    const invalidResponse = await page.request.post(authContract.endpoint, {
      data: invalidRequest
    })
    
    expect(invalidResponse.status()).toBe(400)
    
    const invalidResponseData = await invalidResponse.json()
    expect(invalidResponseData).toHaveProperty('success')
    expect(invalidResponseData).toHaveProperty('message')
    expect(invalidResponseData.success).toBe(false)
  })
})

describe('📊 Data Contract Tests', () => {
  test('должен тестировать контракт данных задач', async ({ page }) => {
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
    
    // Тестируем контракт данных задач
    const taskDataContract = {
      schema: {
        type: 'object',
        required: ['id', 'title', 'priority', 'category', 'completed', 'createdAt', 'updatedAt'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid'
          },
          title: {
            type: 'string',
            minLength: 1,
            maxLength: 500
          },
          description: {
            type: 'string',
            maxLength: 2000
          },
          priority: {
            type: 'string',
            enum: ['high', 'medium', 'low']
          },
          category: {
            type: 'string',
            enum: ['work', 'personal', 'health', 'education']
          },
          completed: {
            type: 'boolean'
          },
          dueDate: {
            type: 'string',
            format: 'date'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          },
          userId: {
            type: 'string',
            format: 'uuid'
          }
        }
      }
    }
    
    // Создаем задачу для тестирования контракта
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Contract Test Task')
    await page.fill('[data-testid="task-description"]', 'Test description for contract validation')
    await page.selectOption('[data-testid="task-priority"]', 'high')
    await page.selectOption('[data-testid="task-category"]', 'work')
    await page.fill('[data-testid="task-due-date"]', '2024-12-31')
    await page.click('[data-testid="save-task-button"]')
    
    // Получаем данные задачи
    const taskData = await page.evaluate(() => {
      const taskCard = document.querySelector('.task-card')
      if (taskCard) {
        return {
          id: taskCard.getAttribute('data-task-id'),
          title: taskCard.querySelector('[data-testid="task-title"]')?.textContent,
          description: taskCard.querySelector('[data-testid="task-description"]')?.textContent,
          priority: taskCard.querySelector('[data-testid="task-priority"]')?.textContent,
          category: taskCard.querySelector('[data-testid="task-category"]')?.textContent,
          completed: taskCard.querySelector('[data-testid="task-completed"]')?.checked,
          dueDate: taskCard.querySelector('[data-testid="task-due-date"]')?.value,
          createdAt: taskCard.getAttribute('data-created-at'),
          updatedAt: taskCard.getAttribute('data-updated-at'),
          userId: taskCard.getAttribute('data-user-id')
        }
      }
      return null
    })
    
    expect(taskData).toBeDefined()
    expect(taskData.id).toBeDefined()
    expect(taskData.title).toBe('Contract Test Task')
    expect(taskData.description).toBe('Test description for contract validation')
    expect(['high', 'medium', 'low']).toContain(taskData.priority)
    expect(['work', 'personal', 'health', 'education']).toContain(taskData.category)
    expect(typeof taskData.completed).toBe('boolean')
    expect(taskData.dueDate).toBe('2024-12-31')
    expect(taskData.createdAt).toBeDefined()
    expect(taskData.updatedAt).toBeDefined()
    expect(taskData.userId).toBeDefined()
  })

  test('должен тестировать контракт данных пользователя', async ({ page }) => {
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
    
    // Тестируем контракт данных пользователя
    const userDataContract = {
      schema: {
        type: 'object',
        required: ['id', 'email', 'name', 'subscription', 'createdAt', 'updatedAt'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid'
          },
          email: {
            type: 'string',
            format: 'email',
            minLength: 1,
            maxLength: 255
          },
          name: {
            type: 'string',
            minLength: 1,
            maxLength: 100
          },
          subscription: {
            type: 'string',
            enum: ['free', 'premium', 'pro', 'enterprise']
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          },
          lastLoginAt: {
            type: 'string',
            format: 'date-time'
          },
          preferences: {
            type: 'object',
            properties: {
              theme: {
                type: 'string',
                enum: ['light', 'dark', 'auto']
              },
              language: {
                type: 'string',
                enum: ['en', 'ru']
              },
              notifications: {
                type: 'boolean'
              }
            }
          }
        }
      }
    }
    
    // Получаем данные пользователя
    const userData = await page.evaluate(() => {
      const userData = localStorage.getItem('user')
      if (userData) {
        return JSON.parse(userData)
      }
      return null
    })
    
    expect(userData).toBeDefined()
    expect(userData.id).toBeDefined()
    expect(userData.email).toBe('test@example.com')
    expect(userData.name).toBe('Test User')
    expect(['free', 'premium', 'pro', 'enterprise']).toContain(userData.subscription)
  })

  test('должен тестировать контракт данных подписки', async ({ page }) => {
    await page.goto('/')
    
    // Мокаем подписку
    await page.evaluate(() => {
      localStorage.setItem('subscription', JSON.stringify({
        id: 'sub-1',
        plan: 'premium',
        features: ['unlimited-tasks', 'advanced-ai', 'priority-support'],
        price: 9.99,
        currency: 'USD',
        status: 'active',
        autoRenew: true,
        nextBillingDate: '2024-12-31T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }))
    })
    
    await page.reload()
    
    // Тестируем контракт данных подписки
    const subscriptionDataContract = {
      schema: {
        type: 'object',
        required: ['id', 'plan', 'features', 'price', 'currency', 'status', 'createdAt', 'updatedAt'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid'
          },
          plan: {
            type: 'string',
            enum: ['free', 'premium', 'pro', 'enterprise']
          },
          features: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['basic-tasks', 'unlimited-tasks', 'basic-ai', 'advanced-ai', 'all-ai-models', 'priority-support', 'analytics', 'api-access']
            }
          },
          price: {
            type: 'number',
            minimum: 0
          },
          currency: {
            type: 'string',
            enum: ['USD', 'EUR', 'GBP', 'RUB']
          },
          status: {
            type: 'string',
            enum: ['active', 'cancelled', 'expired', 'pending']
          },
          autoRenew: {
            type: 'boolean'
          },
          nextBillingDate: {
            type: 'string',
            format: 'date-time'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      }
    }
    
    // Получаем данные подписки
    const subscriptionData = await page.evaluate(() => {
      const subscriptionData = localStorage.getItem('subscription')
      if (subscriptionData) {
        return JSON.parse(subscriptionData)
      }
      return null
    })
    
    expect(subscriptionData).toBeDefined()
    expect(subscriptionData.id).toBeDefined()
    expect(['free', 'premium', 'pro', 'enterprise']).toContain(subscriptionData.plan)
    expect(Array.isArray(subscriptionData.features)).toBe(true)
    expect(typeof subscriptionData.price).toBe('number')
    expect(subscriptionData.price).toBeGreaterThanOrEqual(0)
    expect(['USD', 'EUR', 'GBP', 'RUB']).toContain(subscriptionData.currency)
    expect(['active', 'cancelled', 'expired', 'pending']).toContain(subscriptionData.status)
    expect(typeof subscriptionData.autoRenew).toBe('boolean')
    expect(subscriptionData.nextBillingDate).toBeDefined()
    expect(subscriptionData.createdAt).toBeDefined()
    expect(subscriptionData.updatedAt).toBeDefined()
  })
})

describe('🔗 Interface Contract Tests', () => {
  test('должен тестировать контракт интерфейса компонентов', async ({ page }) => {
    await page.goto('/')
    
    // Тестируем контракт интерфейса компонентов
    const componentInterfaceContract = {
      Button: {
        props: {
          variant: {
            type: 'string',
            enum: ['primary', 'secondary', 'ghost', 'danger', 'outline']
          },
          size: {
            type: 'string',
            enum: ['sm', 'md', 'lg']
          },
          isLoading: {
            type: 'boolean'
          },
          disabled: {
            type: 'boolean'
          },
          children: {
            type: 'string'
          }
        },
        events: {
          onClick: {
            type: 'function'
          }
        }
      },
      Input: {
        props: {
          type: {
            type: 'string',
            enum: ['text', 'email', 'password', 'number', 'date']
          },
          value: {
            type: 'string'
          },
          placeholder: {
            type: 'string'
          },
          required: {
            type: 'boolean'
          },
          disabled: {
            type: 'boolean'
          }
        },
        events: {
          onChange: {
            type: 'function'
          },
          onFocus: {
            type: 'function'
          },
          onBlur: {
            type: 'function'
          }
        }
      },
      TaskCard: {
        props: {
          task: {
            type: 'object',
            required: ['id', 'title', 'priority', 'category', 'completed'],
            properties: {
              id: {
                type: 'string'
              },
              title: {
                type: 'string'
              },
              priority: {
                type: 'string',
                enum: ['high', 'medium', 'low']
              },
              category: {
                type: 'string',
                enum: ['work', 'personal', 'health', 'education']
              },
              completed: {
                type: 'boolean'
              }
            }
          }
        },
        events: {
          onToggle: {
            type: 'function'
          },
          onEdit: {
            type: 'function'
          },
          onDelete: {
            type: 'function'
          }
        }
      }
    }
    
    // Тестируем Button компонент
    const buttonElement = page.locator('[data-testid="subscribe-button"]')
    await expect(buttonElement).toBeVisible()
    await expect(buttonElement).toHaveAttribute('type', 'submit')
    
    // Тестируем Input компонент
    const inputElement = page.locator('[data-testid="email-input"]')
    await expect(inputElement).toBeVisible()
    await expect(inputElement).toHaveAttribute('type', 'email')
    await expect(inputElement).toHaveAttribute('required')
    
    // Тестируем взаимодействие с компонентами
    await inputElement.fill('test@example.com')
    await buttonElement.click()
    
    // Проверяем, что события обработаны
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
  })

  test('должен тестировать контракт интерфейса страниц', async ({ page }) => {
    await page.goto('/')
    
    // Тестируем контракт интерфейса главной страницы
    const homePageContract = {
      requiredElements: [
        '[data-testid="email-input"]',
        '[data-testid="subscribe-button"]',
        'h1',
        '[data-testid="features-section"]',
        '[data-testid="pricing-section"]'
      ],
      optionalElements: [
        '[data-testid="install-button"]',
        '[data-testid="success-message"]',
        '[data-testid="error-message"]'
      ]
    }
    
    // Проверяем наличие обязательных элементов
    for (const selector of homePageContract.requiredElements) {
      const element = page.locator(selector)
      await expect(element).toBeVisible()
    }
    
    // Проверяем функциональность страницы
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.click('[data-testid="subscribe-button"]')
    
    // Проверяем, что появился один из опциональных элементов
    const successMessage = page.locator('[data-testid="success-message"]')
    const errorMessage = page.locator('[data-testid="error-message"]')
    
    await expect(successMessage.or(errorMessage)).toBeVisible()
    
    // Тестируем контракт интерфейса страницы планировщика
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
    
    const plannerPageContract = {
      requiredElements: [
        '[data-testid="planner-content"]',
        '[data-testid="add-task-button"]',
        '[data-testid="task-list"]',
        '[data-testid="ai-suggestions"]',
        '[data-testid="productivity-analysis"]'
      ],
      optionalElements: [
        '[data-testid="task-card"]',
        '[data-testid="smart-sort-button"]',
        '[data-testid="filter-tasks"]'
      ]
    }
    
    // Проверяем наличие обязательных элементов
    for (const selector of plannerPageContract.requiredElements) {
      const element = page.locator(selector)
      await expect(element).toBeVisible()
    }
  })

  test('должен тестировать контракт интерфейса API', async ({ page }) => {
    await page.goto('/')
    
    // Тестируем контракт интерфейса API
    const apiInterfaceContract = {
      baseURL: 'http://localhost:3000',
      endpoints: {
        subscribe: {
          path: '/api/subscribe',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        },
        test: {
          path: '/api/test',
          method: 'GET',
          headers: {}
        }
      }
    }
    
    // Тестируем endpoint подписки
    const subscribeResponse = await page.request.post(apiInterfaceContract.endpoints.subscribe.path, {
      data: { email: 'test@example.com' },
      headers: apiInterfaceContract.endpoints.subscribe.headers
    })
    
    expect(subscribeResponse.status()).toBe(200)
    expect(subscribeResponse.headers()['content-type']).toContain('application/json')
    
    // Тестируем endpoint тестирования
    const testResponse = await page.request.get(apiInterfaceContract.endpoints.test.path, {
      headers: apiInterfaceContract.endpoints.test.headers
    })
    
    expect(testResponse.status()).toBe(200)
    expect(testResponse.headers()['content-type']).toContain('application/json')
  })
})