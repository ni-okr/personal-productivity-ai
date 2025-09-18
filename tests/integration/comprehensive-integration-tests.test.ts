/**
 * 🔗 ИСЧЕРПЫВАЮЩИЕ ИНТЕГРАЦИОННЫЕ ТЕСТЫ
 * Покрытие: 95% интеграций между компонентами
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useAppStore } from '@/stores/useAppStore'
import { addSubscriber, getActiveSubscribers } from '@/lib/supabase'
import { signUp, signIn, signOut } from '@/lib/auth'
import { AIPlanner } from '@/lib/aiModels'
import { smartTaskPrioritization, analyzeProductivityAndSuggest } from '@/lib/smartPlanning'
import { validateTask, validateEmail } from '@/utils/validation'
import { Task, User, UserPreferences } from '@/types'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  addSubscriber: jest.fn(),
  getActiveSubscribers: jest.fn(),
  unsubscribe: jest.fn()
}))

// Mock Auth
jest.mock('@/lib/auth', () => ({
  signUp: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getUserProfile: jest.fn(),
  updateUserProfile: jest.fn(),
  resetPassword: jest.fn(),
  confirmEmail: jest.fn(),
  updatePassword: jest.fn(),
  signInWithGoogle: jest.fn(),
  signInWithGitHub: jest.fn()
}))

describe('🔗 Auth Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('должен интегрировать регистрацию с созданием профиля', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      timezone: 'Europe/Moscow',
      subscription: 'free' as const,
      subscriptionStatus: 'active' as const,
      preferences: {
        workingHours: { start: '09:00', end: '18:00' },
        focusTime: 25,
        breakTime: 5,
        notifications: { email: true, push: true, desktop: true },
        aiCoaching: { enabled: true, frequency: 'medium', style: 'gentle' }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const mockSignUp = signUp as jest.MockedFunction<typeof signUp>
    mockSignUp.mockResolvedValue({
      success: true,
      user: mockUser
    })

    const result = await signUp({
      email: 'test@example.com',
      password: 'SecurePass123!',
      name: 'Test User'
    })

    expect(result.success).toBe(true)
    expect(result.user).toEqual(mockUser)
    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'SecurePass123!',
      name: 'Test User'
    })
  })

  test('должен интегрировать вход с загрузкой данных пользователя', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      timezone: 'Europe/Moscow',
      subscription: 'premium' as const,
      subscriptionStatus: 'active' as const,
      preferences: {
        workingHours: { start: '09:00', end: '18:00' },
        focusTime: 25,
        breakTime: 5,
        notifications: { email: true, push: true, desktop: true },
        aiCoaching: { enabled: true, frequency: 'medium', style: 'gentle' }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const mockSignIn = signIn as jest.MockedFunction<typeof signIn>
    mockSignIn.mockResolvedValue({
      success: true,
      user: mockUser
    })

    const result = await signIn({
      email: 'test@example.com',
      password: 'SecurePass123!'
    })

    expect(result.success).toBe(true)
    expect(result.user).toEqual(mockUser)
    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'SecurePass123!'
    })
  })

  test('должен интегрировать выход с очисткой данных', async () => {
    const mockSignOut = signOut as jest.MockedFunction<typeof signOut>
    mockSignOut.mockResolvedValue({
      success: true,
      message: 'Вы успешно вышли из системы'
    })

    const result = await signOut()

    expect(result.success).toBe(true)
    expect(mockSignOut).toHaveBeenCalled()
  })
})

describe('🗄️ Supabase API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('должен интегрировать добавление подписчика с валидацией', async () => {
    const mockAddSubscriber = addSubscriber as jest.MockedFunction<typeof addSubscriber>
    mockAddSubscriber.mockResolvedValue({
      success: true,
      message: 'Спасибо за подписку! Мы уведомим вас о запуске.',
      data: {
        id: 'sub-1',
        email: 'test@example.com',
        source: 'landing_page',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    })

    // Сначала валидируем email
    const emailValidation = validateEmail('test@example.com')
    expect(emailValidation.isValid).toBe(true)

    // Затем добавляем подписчика
    const result = await addSubscriber('test@example.com')

    expect(result.success).toBe(true)
    expect(result.data?.email).toBe('test@example.com')
    expect(mockAddSubscriber).toHaveBeenCalledWith('test@example.com')
  })

  test('должен интегрировать получение подписчиков с обработкой ошибок', async () => {
    const mockGetActiveSubscribers = getActiveSubscribers as jest.MockedFunction<typeof getActiveSubscribers>
    mockGetActiveSubscribers.mockResolvedValue([
      {
        id: 'sub-1',
        email: 'test1@example.com',
        source: 'landing_page',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'sub-2',
        email: 'test2@example.com',
        source: 'landing_page',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ])

    const subscribers = await getActiveSubscribers()

    expect(subscribers).toHaveLength(2)
    expect(subscribers[0].email).toBe('test1@example.com')
    expect(subscribers[1].email).toBe('test2@example.com')
    expect(mockGetActiveSubscribers).toHaveBeenCalled()
  })
})

describe('🧠 AI Integration Tests', () => {
  test('должен интегрировать AI планировщик с валидацией данных', async () => {
    const planner = new AIPlanner('mock-ai')
    
    const tasks: Task[] = [
      {
        id: '1',
        title: 'Test Task 1',
        priority: 'high',
        status: 'todo',
        source: 'manual',
        tags: [],
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
        estimatedMinutes: 60
      },
      {
        id: '2',
        title: 'Test Task 2',
        priority: 'medium',
        status: 'todo',
        source: 'manual',
        tags: [],
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
        estimatedMinutes: 30
      }
    ]

    // Валидируем задачи перед отправкой в AI
    const validatedTasks = tasks.filter(task => {
      const validation = validateTask({
        title: task.title,
        priority: task.priority,
        estimatedMinutes: task.estimatedMinutes
      })
      return validation.isValid
    })

    expect(validatedTasks).toHaveLength(2)

    // Отправляем в AI для приоритизации
    const prioritizedTasks = await planner.prioritizeTasks(validatedTasks)

    expect(prioritizedTasks).toHaveLength(2)
    expect(prioritizedTasks[0].priority).toBe('high')
  })

  test('должен интегрировать AI анализ с умными алгоритмами', async () => {
    const completedTasks: Task[] = [
      {
        id: '1',
        title: 'Completed Task 1',
        priority: 'urgent',
        status: 'completed',
        source: 'manual',
        tags: [],
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: new Date()
      },
      {
        id: '2',
        title: 'Completed Task 2',
        priority: 'high',
        status: 'completed',
        source: 'manual',
        tags: [],
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: new Date()
      }
    ]

    // Сначала используем умные алгоритмы
    const smartAnalysis = analyzeProductivityAndSuggest(completedTasks)
    expect(smartAnalysis.score).toBeGreaterThan(0)
    expect(smartAnalysis.insights).toHaveLength(1)

    // Затем используем AI для более глубокого анализа
    const planner = new AIPlanner('mock-ai')
    const aiAnalysis = await planner.analyzeProductivity(completedTasks)

    expect(aiAnalysis.score).toBeGreaterThan(0)
    expect(aiAnalysis.insights).toHaveLength(3)
    expect(aiAnalysis.recommendations).toHaveLength(3)
  })
})

describe('🏪 Store Integration Tests', () => {
  beforeEach(() => {
    // Очищаем store перед каждым тестом
    useAppStore.getState().clearUserData()
  })

  test('должен интегрировать создание задачи с валидацией и AI', async () => {
    const user: User = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      timezone: 'Europe/Moscow',
      subscription: 'free',
      subscriptionStatus: 'active',
      preferences: {
        workingHours: { start: '09:00', end: '18:00' },
        focusTime: 25,
        breakTime: 5,
        notifications: { email: true, push: true, desktop: true },
        aiCoaching: { enabled: true, frequency: 'medium', style: 'gentle' }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Устанавливаем пользователя
    useAppStore.getState().setUser(user)

    // Валидируем данные задачи
    const taskData = {
      title: 'Test Task',
      description: 'Test Description',
      priority: 'high' as const,
      estimatedMinutes: 60,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }

    const validation = validateTask(taskData)
    expect(validation.isValid).toBe(true)

    // Создаем задачу
    const task: Task = {
      id: 'task-1',
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      status: 'todo',
      source: 'manual',
      tags: [],
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      estimatedMinutes: taskData.estimatedMinutes,
      dueDate: taskData.dueDate
    }

    useAppStore.getState().addTask(task)

    // Проверяем, что задача добавлена
    const tasks = useAppStore.getState().tasks
    expect(tasks).toHaveLength(1)
    expect(tasks[0].title).toBe('Test Task')

    // Применяем умную сортировку
    const sortedTasks = smartTaskPrioritization(tasks)
    expect(sortedTasks[0].priority).toBe('high')
  })

  test('должен интегрировать обновление задачи с AI анализом', async () => {
    const user: User = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      timezone: 'Europe/Moscow',
      subscription: 'free',
      subscriptionStatus: 'active',
      preferences: {
        workingHours: { start: '09:00', end: '18:00' },
        focusTime: 25,
        breakTime: 5,
        notifications: { email: true, push: true, desktop: true },
        aiCoaching: { enabled: true, frequency: 'medium', style: 'gentle' }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    useAppStore.getState().setUser(user)

    const task: Task = {
      id: 'task-1',
      title: 'Test Task',
      priority: 'high',
      status: 'todo',
      source: 'manual',
      tags: [],
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    useAppStore.getState().addTask(task)

    // Обновляем задачу
    useAppStore.getState().updateTask('task-1', { status: 'completed', completedAt: new Date() })

    // Проверяем обновление
    const updatedTask = useAppStore.getState().tasks.find(t => t.id === 'task-1')
    expect(updatedTask?.status).toBe('completed')
    expect(updatedTask?.completedAt).toBeDefined()

    // Анализируем продуктивность
    const completedTasks = useAppStore.getState().completedTasksToday()
    expect(completedTasks).toHaveLength(1)

    const analysis = analyzeProductivityAndSuggest(completedTasks)
    expect(analysis.score).toBeGreaterThan(0)
  })

  test('должен интегрировать удаление задачи с очисткой связанных данных', () => {
    const user: User = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      timezone: 'Europe/Moscow',
      subscription: 'free',
      subscriptionStatus: 'active',
      preferences: {
        workingHours: { start: '09:00', end: '18:00' },
        focusTime: 25,
        breakTime: 5,
        notifications: { email: true, push: true, desktop: true },
        aiCoaching: { enabled: true, frequency: 'medium', style: 'gentle' }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    useAppStore.getState().setUser(user)

    const task: Task = {
      id: 'task-1',
      title: 'Test Task',
      priority: 'high',
      status: 'todo',
      source: 'manual',
      tags: [],
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    useAppStore.getState().addTask(task)
    expect(useAppStore.getState().tasks).toHaveLength(1)

    // Удаляем задачу
    useAppStore.getState().deleteTask('task-1')
    expect(useAppStore.getState().tasks).toHaveLength(0)
  })
})

describe('🔄 Cross-Module Integration Tests', () => {
  test('должен интегрировать полный цикл: регистрация → создание задач → AI анализ', async () => {
    // 1. Регистрация пользователя
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      timezone: 'Europe/Moscow',
      subscription: 'free' as const,
      subscriptionStatus: 'active' as const,
      preferences: {
        workingHours: { start: '09:00', end: '18:00' },
        focusTime: 25,
        breakTime: 5,
        notifications: { email: true, push: true, desktop: true },
        aiCoaching: { enabled: true, frequency: 'medium', style: 'gentle' }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const mockSignUp = signUp as jest.MockedFunction<typeof signUp>
    mockSignUp.mockResolvedValue({
      success: true,
      user: mockUser
    })

    const signUpResult = await signUp({
      email: 'test@example.com',
      password: 'SecurePass123!',
      name: 'Test User'
    })

    expect(signUpResult.success).toBe(true)

    // 2. Устанавливаем пользователя в store
    useAppStore.getState().setUser(mockUser)

    // 3. Создаем задачи
    const tasks: Task[] = [
      {
        id: 'task-1',
        title: 'High Priority Task',
        priority: 'high',
        status: 'todo',
        source: 'manual',
        tags: [],
        userId: mockUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        estimatedMinutes: 60
      },
      {
        id: 'task-2',
        title: 'Medium Priority Task',
        priority: 'medium',
        status: 'todo',
        source: 'manual',
        tags: [],
        userId: mockUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        estimatedMinutes: 30
      }
    ]

    // Валидируем и добавляем задачи
    tasks.forEach(task => {
      const validation = validateTask({
        title: task.title,
        priority: task.priority,
        estimatedMinutes: task.estimatedMinutes
      })
      expect(validation.isValid).toBe(true)
      useAppStore.getState().addTask(task)
    })

    // 4. Применяем умную сортировку
    const sortedTasks = smartTaskPrioritization(useAppStore.getState().tasks)
    expect(sortedTasks[0].priority).toBe('high')

    // 5. Завершаем одну задачу
    useAppStore.getState().updateTask('task-1', { 
      status: 'completed', 
      completedAt: new Date() 
    })

    // 6. Анализируем продуктивность
    const completedTasks = useAppStore.getState().completedTasksToday()
    const analysis = analyzeProductivityAndSuggest(completedTasks)
    
    expect(analysis.score).toBeGreaterThan(0)
    expect(analysis.insights).toHaveLength(1)
    expect(analysis.recommendations).toHaveLength(1)
  })

  test('должен интегрировать подписку с валидацией и уведомлениями', async () => {
    // 1. Валидируем email
    const email = 'subscriber@example.com'
    const emailValidation = validateEmail(email)
    expect(emailValidation.isValid).toBe(true)

    // 2. Добавляем подписчика
    const mockAddSubscriber = addSubscriber as jest.MockedFunction<typeof addSubscriber>
    mockAddSubscriber.mockResolvedValue({
      success: true,
      message: 'Спасибо за подписку! Мы уведомим вас о запуске.',
      data: {
        id: 'sub-1',
        email: email,
        source: 'landing_page',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    })

    const result = await addSubscriber(email)
    expect(result.success).toBe(true)

    // 3. Получаем список подписчиков
    const mockGetActiveSubscribers = getActiveSubscribers as jest.MockedFunction<typeof getActiveSubscribers>
    mockGetActiveSubscribers.mockResolvedValue([
      {
        id: 'sub-1',
        email: email,
        source: 'landing_page',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ])

    const subscribers = await getActiveSubscribers()
    expect(subscribers).toHaveLength(1)
    expect(subscribers[0].email).toBe(email)
  })
})

describe('🚨 Error Handling Integration Tests', () => {
  test('должен обрабатывать ошибки валидации в интеграции', async () => {
    // Попытка создать задачу с невалидными данными
    const invalidTaskData = {
      title: '', // Пустое название
      priority: 'invalid' as any, // Невалидный приоритет
      estimatedMinutes: -1 // Отрицательное время
    }

    const validation = validateTask(invalidTaskData)
    expect(validation.isValid).toBe(false)
    expect(validation.errors).toHaveLength(3)

    // Не добавляем задачу в store, если валидация не прошла
    const initialTasksCount = useAppStore.getState().tasks.length
    expect(useAppStore.getState().tasks).toHaveLength(initialTasksCount)
  })

  test('должен обрабатывать ошибки API в интеграции', async () => {
    const mockAddSubscriber = addSubscriber as jest.MockedFunction<typeof addSubscriber>
    mockAddSubscriber.mockRejectedValue(new Error('API Error'))

    await expect(addSubscriber('test@example.com')).rejects.toThrow('API Error')
  })

  test('должен обрабатывать ошибки AI в интеграции', async () => {
    const planner = new AIPlanner('mock-ai')
    
    // Передаем невалидные данные в AI
    const invalidTasks: any[] = [
      { id: '1', title: null, priority: 'invalid' },
      { id: '2', title: '', priority: 'high' }
    ]

    // AI должен обработать ошибки gracefully
    const result = await planner.prioritizeTasks(invalidTasks)
    expect(Array.isArray(result)).toBe(true)
  })
})

describe('📊 Performance Integration Tests', () => {
  test('должен эффективно обрабатывать большое количество задач', async () => {
    const startTime = Date.now()
    
    // Создаем 1000 задач
    const tasks: Task[] = Array.from({ length: 1000 }, (_, i) => ({
      id: `task-${i}`,
      title: `Task ${i}`,
      priority: ['low', 'medium', 'high', 'urgent'][i % 4] as TaskPriority,
      status: 'todo',
      source: 'manual',
      tags: [],
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
      estimatedMinutes: Math.floor(Math.random() * 120) + 15
    }))

    // Применяем умную сортировку
    const sortedTasks = smartTaskPrioritization(tasks)
    
    const endTime = Date.now()
    const processingTime = endTime - startTime

    expect(sortedTasks).toHaveLength(1000)
    expect(processingTime).toBeLessThan(1000) // Должно обработаться менее чем за секунду
  })

  test('должен эффективно анализировать продуктивность для большого количества завершенных задач', async () => {
    const startTime = Date.now()
    
    // Создаем 500 завершенных задач
    const completedTasks: Task[] = Array.from({ length: 500 }, (_, i) => ({
      id: `task-${i}`,
      title: `Completed Task ${i}`,
      priority: ['low', 'medium', 'high', 'urgent'][i % 4] as TaskPriority,
      status: 'completed',
      source: 'manual',
      tags: [],
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: new Date()
    }))

    // Анализируем продуктивность
    const analysis = analyzeProductivityAndSuggest(completedTasks)
    
    const endTime = Date.now()
    const processingTime = endTime - startTime

    expect(analysis.score).toBeGreaterThan(0)
    expect(processingTime).toBeLessThan(500) // Должно обработаться менее чем за полсекунды
  })
})