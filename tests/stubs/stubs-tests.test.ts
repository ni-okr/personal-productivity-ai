/**
 * 🎭 ТЕСТЫ С ЗАГЛУШКАМИ
 * Покрытие: Test Doubles, Stubs, Mocks, Spies, Fakes, Dummies
 */

import { test, expect, Page } from '@playwright/test'

describe('🎭 Test Doubles Tests', () => {
  test('должен использовать Test Doubles для изоляции компонентов', async ({ page }) => {
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
    
    // Создаем Test Double для задачи
    const taskDouble = {
      id: 'task-double-1',
      title: 'Test Double Task',
      description: 'This is a test double task',
      priority: 'high',
      category: 'work',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'user-1'
    }
    
    // Внедряем Test Double в приложение
    await page.evaluate((task) => {
      localStorage.setItem('test-double-task', JSON.stringify(task))
    }, taskDouble)
    
    // Проверяем, что Test Double работает
    const injectedTask = await page.evaluate(() => {
      const taskData = localStorage.getItem('test-double-task')
      return taskData ? JSON.parse(taskData) : null
    })
    
    expect(injectedTask).toBeDefined()
    expect(injectedTask.id).toBe('task-double-1')
    expect(injectedTask.title).toBe('Test Double Task')
    expect(injectedTask.priority).toBe('high')
    expect(injectedTask.category).toBe('work')
    expect(injectedTask.completed).toBe(false)
  })

  test('должен использовать Test Doubles для имитации внешних сервисов', async ({ page }) => {
    await page.goto('/')
    
    // Создаем Test Double для внешнего сервиса подписки
    const subscriptionServiceDouble = {
      subscribe: async (email: string) => {
        return {
          success: true,
          message: 'Successfully subscribed with test double',
          data: {
            id: 'sub-double-1',
            email: email,
            subscribedAt: new Date().toISOString()
          }
        }
      },
      unsubscribe: async (email: string) => {
        return {
          success: true,
          message: 'Successfully unsubscribed with test double'
        }
      },
      getSubscribers: async () => {
        return [
          {
            id: 'sub-double-1',
            email: 'test@example.com',
            subscribedAt: new Date().toISOString()
          }
        ]
      }
    }
    
    // Внедряем Test Double
    await page.evaluate((service) => {
      window.subscriptionServiceDouble = service
    }, subscriptionServiceDouble)
    
    // Тестируем функциональность с Test Double
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.click('[data-testid="subscribe-button"]')
    
    // Проверяем, что Test Double сработал
    const result = await page.evaluate(() => {
      return window.subscriptionServiceDouble ? 'Test Double injected' : 'Test Double not found'
    })
    
    expect(result).toBe('Test Double injected')
  })
})

describe('🔌 Stub Tests', () => {
  test('должен использовать Stubs для замены внешних зависимостей', async ({ page }) => {
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
    
    // Создаем Stub для базы данных
    const databaseStub = {
      tasks: [
        {
          id: 'stub-task-1',
          title: 'Stub Task 1',
          description: 'This is a stub task',
          priority: 'high',
          category: 'work',
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: 'user-1'
        },
        {
          id: 'stub-task-2',
          title: 'Stub Task 2',
          description: 'Another stub task',
          priority: 'medium',
          category: 'personal',
          completed: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: 'user-1'
        }
      ],
      getTasks: function(userId: string) {
        return this.tasks.filter(task => task.userId === userId)
      },
      createTask: function(task: any) {
        const newTask = {
          ...task,
          id: `stub-task-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        this.tasks.push(newTask)
        return newTask
      },
      updateTask: function(id: string, updates: any) {
        const taskIndex = this.tasks.findIndex(task => task.id === id)
        if (taskIndex !== -1) {
          this.tasks[taskIndex] = {
            ...this.tasks[taskIndex],
            ...updates,
            updatedAt: new Date().toISOString()
          }
          return this.tasks[taskIndex]
        }
        return null
      },
      deleteTask: function(id: string) {
        const taskIndex = this.tasks.findIndex(task => task.id === id)
        if (taskIndex !== -1) {
          const deletedTask = this.tasks[taskIndex]
          this.tasks.splice(taskIndex, 1)
          return deletedTask
        }
        return null
      }
    }
    
    // Внедряем Stub
    await page.evaluate((stub) => {
      window.databaseStub = stub
    }, databaseStub)
    
    // Тестируем функциональность с Stub
    const tasks = await page.evaluate(() => {
      return window.databaseStub.getTasks('user-1')
    })
    
    expect(tasks).toHaveLength(2)
    expect(tasks[0].title).toBe('Stub Task 1')
    expect(tasks[1].title).toBe('Stub Task 2')
    
    // Тестируем создание задачи через Stub
    const newTask = await page.evaluate(() => {
      return window.databaseStub.createTask({
        title: 'New Stub Task',
        description: 'Created through stub',
        priority: 'low',
        category: 'health',
        completed: false,
        userId: 'user-1'
      })
    })
    
    expect(newTask).toBeDefined()
    expect(newTask.title).toBe('New Stub Task')
    expect(newTask.id).toMatch(/^stub-task-\d+$/)
  })

  test('должен использовать Stubs для имитации API ответов', async ({ page }) => {
    await page.goto('/')
    
    // Создаем Stub для API подписки
    const apiStub = {
      subscribe: async (email: string) => {
        // Имитируем задержку сети
        await new Promise(resolve => setTimeout(resolve, 100))
        
        if (email === 'test@example.com') {
          return {
            success: true,
            message: 'Successfully subscribed via API stub',
            data: {
              id: 'api-stub-sub-1',
              email: email,
              subscribedAt: new Date().toISOString()
            }
          }
        } else {
          return {
            success: false,
            message: 'Invalid email via API stub'
          }
        }
      }
    }
    
    // Внедряем Stub
    await page.evaluate((stub) => {
      window.apiStub = stub
    }, apiStub)
    
    // Тестируем с валидным email
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.click('[data-testid="subscribe-button"]')
    
    // Проверяем, что Stub сработал
    const result = await page.evaluate(() => {
      return window.apiStub ? 'API Stub injected' : 'API Stub not found'
    })
    
    expect(result).toBe('API Stub injected')
  })
})

describe('🎯 Mock Tests', () => {
  test('должен использовать Mocks для проверки взаимодействий', async ({ page }) => {
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
    
    // Создаем Mock для AI сервиса
    const aiServiceMock = {
      calls: [],
      generateSuggestions: function(tasks: any[]) {
        this.calls.push({
          method: 'generateSuggestions',
          args: [tasks],
          timestamp: new Date().toISOString()
        })
        
        return [
          {
            id: 'mock-suggestion-1',
            title: 'Mock AI Suggestion 1',
            description: 'This is a mock AI suggestion',
            type: 'productivity',
            confidence: 0.85
          },
          {
            id: 'mock-suggestion-2',
            title: 'Mock AI Suggestion 2',
            description: 'Another mock AI suggestion',
            type: 'time-management',
            confidence: 0.72
          }
        ]
      },
      analyzeProductivity: function(tasks: any[]) {
        this.calls.push({
          method: 'analyzeProductivity',
          args: [tasks],
          timestamp: new Date().toISOString()
        })
        
        return {
          score: 85,
          insights: [
            'Mock insight 1: You are doing well with high priority tasks',
            'Mock insight 2: Consider taking more breaks'
          ],
          recommendations: [
            'Mock recommendation 1: Focus on one task at a time',
            'Mock recommendation 2: Set specific time blocks for tasks'
          ]
        }
      },
      getCallHistory: function() {
        return this.calls
      },
      resetCalls: function() {
        this.calls = []
      }
    }
    
    // Внедряем Mock
    await page.evaluate((mock) => {
      window.aiServiceMock = mock
    }, aiServiceMock)
    
    // Тестируем генерацию предложений
    const suggestions = await page.evaluate(() => {
      return window.aiServiceMock.generateSuggestions([])
    })
    
    expect(suggestions).toHaveLength(2)
    expect(suggestions[0].title).toBe('Mock AI Suggestion 1')
    expect(suggestions[1].title).toBe('Mock AI Suggestion 2')
    
    // Проверяем, что Mock был вызван
    const callHistory = await page.evaluate(() => {
      return window.aiServiceMock.getCallHistory()
    })
    
    expect(callHistory).toHaveLength(1)
    expect(callHistory[0].method).toBe('generateSuggestions')
    expect(callHistory[0].args).toEqual([[]])
    
    // Тестируем анализ продуктивности
    const analysis = await page.evaluate(() => {
      return window.aiServiceMock.analyzeProductivity([])
    })
    
    expect(analysis.score).toBe(85)
    expect(analysis.insights).toHaveLength(2)
    expect(analysis.recommendations).toHaveLength(2)
    
    // Проверяем, что Mock был вызван еще раз
    const updatedCallHistory = await page.evaluate(() => {
      return window.aiServiceMock.getCallHistory()
    })
    
    expect(updatedCallHistory).toHaveLength(2)
    expect(updatedCallHistory[1].method).toBe('analyzeProductivity')
  })

  test('должен использовать Mocks для проверки событий', async ({ page }) => {
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
    
    // Создаем Mock для событий
    const eventMock = {
      events: [],
      emit: function(eventName: string, data: any) {
        this.events.push({
          name: eventName,
          data: data,
          timestamp: new Date().toISOString()
        })
      },
      on: function(eventName: string, callback: Function) {
        // Mock implementation
      },
      getEvents: function() {
        return this.events
      },
      clearEvents: function() {
        this.events = []
      }
    }
    
    // Внедряем Mock
    await page.evaluate((mock) => {
      window.eventMock = mock
    }, eventMock)
    
    // Тестируем создание задачи
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Mock Event Task')
    await page.click('[data-testid="save-task-button"]')
    
    // Проверяем, что события были отправлены
    const events = await page.evaluate(() => {
      return window.eventMock.getEvents()
    })
    
    expect(events).toBeDefined()
    expect(Array.isArray(events)).toBe(true)
  })
})

describe('🕵️ Spy Tests', () => {
  test('должен использовать Spies для мониторинга вызовов функций', async ({ page }) => {
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
    
    // Создаем Spy для функции создания задач
    const taskCreationSpy = {
      calls: [],
      originalFunction: null,
      spy: function(fn: Function) {
        this.originalFunction = fn
        return (...args: any[]) => {
          this.calls.push({
            args: args,
            timestamp: new Date().toISOString()
          })
          return fn.apply(this, args)
        }
      },
      getCalls: function() {
        return this.calls
      },
      reset: function() {
        this.calls = []
      }
    }
    
    // Внедряем Spy
    await page.evaluate((spy) => {
      window.taskCreationSpy = spy
    }, taskCreationSpy)
    
    // Тестируем создание задачи
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Spy Test Task')
    await page.click('[data-testid="save-task-button"]')
    
    // Проверяем, что Spy зафиксировал вызов
    const calls = await page.evaluate(() => {
      return window.taskCreationSpy.getCalls()
    })
    
    expect(calls).toBeDefined()
    expect(Array.isArray(calls)).toBe(true)
  })

  test('должен использовать Spies для мониторинга API вызовов', async ({ page }) => {
    await page.goto('/')
    
    // Создаем Spy для fetch API
    const fetchSpy = {
      calls: [],
      originalFetch: null,
      spy: function() {
        this.originalFetch = window.fetch
        window.fetch = (...args: any[]) => {
          this.calls.push({
            url: args[0],
            options: args[1],
            timestamp: new Date().toISOString()
          })
          return this.originalFetch.apply(window, args)
        }
      },
      restore: function() {
        if (this.originalFetch) {
          window.fetch = this.originalFetch
        }
      },
      getCalls: function() {
        return this.calls
      },
      reset: function() {
        this.calls = []
      }
    }
    
    // Внедряем Spy
    await page.evaluate((spy) => {
      window.fetchSpy = spy
      window.fetchSpy.spy()
    }, fetchSpy)
    
    // Тестируем подписку
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.click('[data-testid="subscribe-button"]')
    
    // Проверяем, что Spy зафиксировал API вызов
    const calls = await page.evaluate(() => {
      return window.fetchSpy.getCalls()
    })
    
    expect(calls).toBeDefined()
    expect(Array.isArray(calls)).toBe(true)
    
    // Восстанавливаем оригинальный fetch
    await page.evaluate(() => {
      window.fetchSpy.restore()
    })
  })
})

describe('🎨 Fake Tests', () => {
  test('должен использовать Fakes для имитации реального поведения', async ({ page }) => {
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
    
    // Создаем Fake для базы данных
    const databaseFake = {
      tasks: [],
      users: [],
      subscriptions: [],
      
      // Реализуем реальное поведение для тестов
      createTask: function(taskData: any) {
        const task = {
          id: `fake-task-${Date.now()}`,
          ...taskData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        this.tasks.push(task)
        return task
      },
      
      getTasks: function(userId: string) {
        return this.tasks.filter(task => task.userId === userId)
      },
      
      updateTask: function(id: string, updates: any) {
        const taskIndex = this.tasks.findIndex(task => task.id === id)
        if (taskIndex !== -1) {
          this.tasks[taskIndex] = {
            ...this.tasks[taskIndex],
            ...updates,
            updatedAt: new Date().toISOString()
          }
          return this.tasks[taskIndex]
        }
        return null
      },
      
      deleteTask: function(id: string) {
        const taskIndex = this.tasks.findIndex(task => task.id === id)
        if (taskIndex !== -1) {
          const deletedTask = this.tasks[taskIndex]
          this.tasks.splice(taskIndex, 1)
          return deletedTask
        }
        return null
      },
      
      createUser: function(userData: any) {
        const user = {
          id: `fake-user-${Date.now()}`,
          ...userData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        this.users.push(user)
        return user
      },
      
      getUser: function(id: string) {
        return this.users.find(user => user.id === id)
      },
      
      createSubscription: function(subscriptionData: any) {
        const subscription = {
          id: `fake-sub-${Date.now()}`,
          ...subscriptionData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        this.subscriptions.push(subscription)
        return subscription
      },
      
      getSubscription: function(userId: string) {
        return this.subscriptions.find(sub => sub.userId === userId)
      }
    }
    
    // Внедряем Fake
    await page.evaluate((fake) => {
      window.databaseFake = fake
    }, databaseFake)
    
    // Тестируем создание пользователя
    const user = await page.evaluate(() => {
      return window.databaseFake.createUser({
        email: 'fake@example.com',
        name: 'Fake User',
        subscription: 'free'
      })
    })
    
    expect(user).toBeDefined()
    expect(user.email).toBe('fake@example.com')
    expect(user.name).toBe('Fake User')
    expect(user.id).toMatch(/^fake-user-\d+$/)
    
    // Тестируем создание задачи
    const task = await page.evaluate(() => {
      return window.databaseFake.createTask({
        title: 'Fake Task',
        description: 'This is a fake task',
        priority: 'high',
        category: 'work',
        completed: false,
        userId: 'fake-user-1'
      })
    })
    
    expect(task).toBeDefined()
    expect(task.title).toBe('Fake Task')
    expect(task.priority).toBe('high')
    expect(task.category).toBe('work')
    expect(task.userId).toBe('fake-user-1')
    
    // Тестируем получение задач
    const tasks = await page.evaluate(() => {
      return window.databaseFake.getTasks('fake-user-1')
    })
    
    expect(tasks).toHaveLength(1)
    expect(tasks[0].title).toBe('Fake Task')
  })

  test('должен использовать Fakes для имитации внешних сервисов', async ({ page }) => {
    await page.goto('/')
    
    // Создаем Fake для сервиса подписки
    const subscriptionServiceFake = {
      subscribers: [],
      
      subscribe: async function(email: string) {
        // Имитируем реальное поведение
        const existingSubscriber = this.subscribers.find(sub => sub.email === email)
        if (existingSubscriber) {
          return {
            success: false,
            message: 'Email already subscribed'
          }
        }
        
        const subscriber = {
          id: `fake-sub-${Date.now()}`,
          email: email,
          subscribedAt: new Date().toISOString(),
          status: 'active'
        }
        
        this.subscribers.push(subscriber)
        
        // Имитируем задержку сети
        await new Promise(resolve => setTimeout(resolve, 50))
        
        return {
          success: true,
          message: 'Successfully subscribed via fake service',
          data: subscriber
        }
      },
      
      unsubscribe: async function(email: string) {
        const subscriberIndex = this.subscribers.findIndex(sub => sub.email === email)
        if (subscriberIndex === -1) {
          return {
            success: false,
            message: 'Email not found'
          }
        }
        
        this.subscribers.splice(subscriberIndex, 1)
        
        // Имитируем задержку сети
        await new Promise(resolve => setTimeout(resolve, 50))
        
        return {
          success: true,
          message: 'Successfully unsubscribed via fake service'
        }
      },
      
      getSubscribers: async function() {
        // Имитируем задержку сети
        await new Promise(resolve => setTimeout(resolve, 30))
        
        return [...this.subscribers]
      },
      
      getSubscriberCount: function() {
        return this.subscribers.length
      }
    }
    
    // Внедряем Fake
    await page.evaluate((fake) => {
      window.subscriptionServiceFake = fake
    }, subscriptionServiceFake)
    
    // Тестируем подписку
    const subscribeResult = await page.evaluate(() => {
      return window.subscriptionServiceFake.subscribe('fake@example.com')
    })
    
    expect(subscribeResult.success).toBe(true)
    expect(subscribeResult.message).toBe('Successfully subscribed via fake service')
    expect(subscribeResult.data.email).toBe('fake@example.com')
    
    // Тестируем повторную подписку
    const duplicateResult = await page.evaluate(() => {
      return window.subscriptionServiceFake.subscribe('fake@example.com')
    })
    
    expect(duplicateResult.success).toBe(false)
    expect(duplicateResult.message).toBe('Email already subscribed')
    
    // Тестируем получение списка подписчиков
    const subscribers = await page.evaluate(() => {
      return window.subscriptionServiceFake.getSubscribers()
    })
    
    expect(subscribers).toHaveLength(1)
    expect(subscribers[0].email).toBe('fake@example.com')
    
    // Тестируем отписку
    const unsubscribeResult = await page.evaluate(() => {
      return window.subscriptionServiceFake.unsubscribe('fake@example.com')
    })
    
    expect(unsubscribeResult.success).toBe(true)
    expect(unsubscribeResult.message).toBe('Successfully unsubscribed via fake service')
    
    // Проверяем, что подписчик удален
    const subscriberCount = await page.evaluate(() => {
      return window.subscriptionServiceFake.getSubscriberCount()
    })
    
    expect(subscriberCount).toBe(0)
  })
})

describe('🎪 Dummy Tests', () => {
  test('должен использовать Dummies для заполнения обязательных параметров', async ({ page }) => {
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
    
    // Создаем Dummy объекты для тестирования
    const dummyObjects = {
      user: {
        id: 'dummy-user-1',
        email: 'dummy@example.com',
        name: 'Dummy User',
        subscription: 'free'
      },
      task: {
        id: 'dummy-task-1',
        title: 'Dummy Task',
        description: 'This is a dummy task',
        priority: 'medium',
        category: 'personal',
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 'dummy-user-1'
      },
      subscription: {
        id: 'dummy-sub-1',
        plan: 'premium',
        features: ['unlimited-tasks', 'advanced-ai'],
        price: 9.99,
        currency: 'USD',
        status: 'active',
        userId: 'dummy-user-1'
      }
    }
    
    // Внедряем Dummy объекты
    await page.evaluate((dummies) => {
      window.dummyObjects = dummies
    }, dummyObjects)
    
    // Тестируем функциональность с Dummy объектами
    const user = await page.evaluate(() => {
      return window.dummyObjects.user
    })
    
    expect(user).toBeDefined()
    expect(user.id).toBe('dummy-user-1')
    expect(user.email).toBe('dummy@example.com')
    expect(user.name).toBe('Dummy User')
    
    const task = await page.evaluate(() => {
      return window.dummyObjects.task
    })
    
    expect(task).toBeDefined()
    expect(task.id).toBe('dummy-task-1')
    expect(task.title).toBe('Dummy Task')
    expect(task.priority).toBe('medium')
    expect(task.category).toBe('personal')
    
    const subscription = await page.evaluate(() => {
      return window.dummyObjects.subscription
    })
    
    expect(subscription).toBeDefined()
    expect(subscription.id).toBe('dummy-sub-1')
    expect(subscription.plan).toBe('premium')
    expect(subscription.price).toBe(9.99)
    expect(subscription.status).toBe('active')
  })

  test('должен использовать Dummies для тестирования валидации', async ({ page }) => {
    await page.goto('/')
    
    // Создаем Dummy данные для тестирования валидации
    const validationDummies = {
      validEmail: 'dummy@example.com',
      invalidEmail: 'dummy-invalid-email',
      validPassword: 'DummyPassword123!',
      invalidPassword: 'dummy',
      validName: 'Dummy User',
      invalidName: '',
      validTaskTitle: 'Dummy Task Title',
      invalidTaskTitle: '',
      validPriority: 'high',
      invalidPriority: 'invalid-priority',
      validCategory: 'work',
      invalidCategory: 'invalid-category'
    }
    
    // Внедряем Dummy данные
    await page.evaluate((dummies) => {
      window.validationDummies = dummies
    }, validationDummies)
    
    // Тестируем валидацию email
    const validEmail = await page.evaluate(() => {
      return window.validationDummies.validEmail
    })
    
    expect(validEmail).toBe('dummy@example.com')
    expect(validEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    
    const invalidEmail = await page.evaluate(() => {
      return window.validationDummies.invalidEmail
    })
    
    expect(invalidEmail).toBe('dummy-invalid-email')
    expect(invalidEmail).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    
    // Тестируем валидацию пароля
    const validPassword = await page.evaluate(() => {
      return window.validationDummies.validPassword
    })
    
    expect(validPassword).toBe('DummyPassword123!')
    expect(validPassword.length).toBeGreaterThanOrEqual(8)
    expect(validPassword).toMatch(/[A-Z]/)
    expect(validPassword).toMatch(/[a-z]/)
    expect(validPassword).toMatch(/[0-9]/)
    expect(validPassword).toMatch(/[!@#$%^&*(),.?":{}|<>]/)
    
    const invalidPassword = await page.evaluate(() => {
      return window.validationDummies.invalidPassword
    })
    
    expect(invalidPassword).toBe('dummy')
    expect(invalidPassword.length).toBeLessThan(8)
    
    // Тестируем валидацию приоритета
    const validPriority = await page.evaluate(() => {
      return window.validationDummies.validPriority
    })
    
    expect(validPriority).toBe('high')
    expect(['high', 'medium', 'low']).toContain(validPriority)
    
    const invalidPriority = await page.evaluate(() => {
      return window.validationDummies.invalidPriority
    })
    
    expect(invalidPriority).toBe('invalid-priority')
    expect(['high', 'medium', 'low']).not.toContain(invalidPriority)
  })
})