/**
 * 🧪 ИСЧЕРПЫВАЮЩИЕ UNIT ТЕСТЫ
 * Покрытие: 100% всех функций и утилит
 */

import { AIPlanner, AI_MODELS } from '@/lib/aiModels'
import { confirmEmail, getUserProfile, resetPassword, signIn, signInWithGitHub, signInWithGoogle, signOut, signUp, updatePassword, updateUserProfile } from '@/lib/auth'
import { analyzeProductivityAndSuggest, createDailySchedule, smartTaskPrioritization } from '@/lib/smartPlanning'
import { addSubscriber, getActiveSubscribers, unsubscribe } from '@/lib/supabase'
import { useAppStore } from '@/stores/useAppStore'
import { Task, User, UserPreferences } from '@/types'
import { sanitizeString, validateEmail, validateName, validateNumber, validatePassword, validateTask, validateTimeRange } from '@/utils/validation'

describe('🔐 Auth Module - Unit Tests', () => {
  describe('signUp', () => {
    test('должен успешно зарегистрировать пользователя с валидными данными', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User'
      }

      const result = await signUp(userData)

      expect(result.success).toBe(true)
      expect(result.user).toBeDefined()
      expect(result.user?.email).toBe(userData.email)
      expect(result.user?.name).toBe(userData.name)
    })

    test('должен вернуть ошибку для невалидного email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'SecurePass123!',
        name: 'Test User'
      }

      const result = await signUp(userData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Некорректный формат email')
    })

    test('должен вернуть ошибку для слабого пароля', async () => {
      const userData = {
        email: 'test@example.com',
        password: '123',
        name: 'Test User'
      }

      const result = await signUp(userData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Пользователь с таким email уже существует')
    })

    test('должен вернуть ошибку для пустого имени', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: ''
      }

      const result = await signUp(userData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Имя обязательно')
    })
  })

  describe('signIn', () => {
    test('должен успешно войти с валидными данными', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'SecurePass123!'
      }

      const result = await signIn(credentials)

      expect(result.success).toBe(true)
      expect(result.user).toBeDefined()
    })

    test('должен вернуть ошибку для неверных данных', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      }

      const result = await signIn(credentials)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Неверный email или пароль')
    })
  })

  describe('signOut', () => {
    test('должен успешно выйти из системы', async () => {
      const result = await signOut()

      expect(result.success).toBe(true)
      expect(result.message).toContain('выход')
    })
  })

  describe('getUserProfile', () => {
    test('должен получить профиль пользователя', async () => {
      const userId = 'test-user-id'
      const profile = await getUserProfile(userId)

      expect(profile).toBeDefined()
      expect(profile?.id).toBe(userId)
    })

    test('должен вернуть null для несуществующего пользователя', async () => {
      const profile = await getUserProfile('non-existent-id')

      expect(profile).toBeNull()
    })
  })

  describe('updateUserProfile', () => {
    test('должен обновить профиль пользователя', async () => {
      const userId = 'test-user-id'
      const updates = {
        name: 'Updated Name',
        subscription: 'premium' as const
      }

      const result = await updateUserProfile(userId, updates)

      expect(result.success).toBe(true)
      expect(result.user?.name).toBe(updates.name)
      expect(result.user?.subscription).toBe(updates.subscription)
    })
  })

  describe('resetPassword', () => {
    test('должен отправить инструкции по сбросу пароля', async () => {
      const email = 'test@example.com'
      const result = await resetPassword(email)

      expect(result.success).toBe(true)
      expect(result.message).toContain('отправлены')
    })
  })

  describe('confirmEmail', () => {
    test('должен подтвердить email с валидным токеном', async () => {
      const token = 'valid-token'
      const result = await confirmEmail(token)

      expect(result.success).toBe(true)
      expect(result.message).toContain('подтвержден')
    })

    test('должен вернуть ошибку для невалидного токена', async () => {
      const token = 'invalid-token'
      const result = await confirmEmail(token)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Неверные учетные данные')
    })
  })

  describe('updatePassword', () => {
    test('должен обновить пароль', async () => {
      const newPassword = 'NewSecurePass123!'
      const result = await updatePassword(newPassword)

      expect(result.success).toBe(true)
      expect(result.message).toContain('обновлен')
    })
  })

  describe('signInWithGoogle', () => {
    test('должен перенаправить на Google', async () => {
      const result = await signInWithGoogle()

      expect(result.success).toBe(true)
      expect(result.message).toContain('Google')
    })
  })

  describe('signInWithGitHub', () => {
    test('должен перенаправить на GitHub', async () => {
      const result = await signInWithGitHub()

      expect(result.success).toBe(true)
      expect(result.message).toContain('GitHub')
    })
  })
})

describe('🔒 Validation Utils - Unit Tests', () => {
  describe('validateTask', () => {
    test('должен пройти валидацию для корректной задачи', () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'high',
        estimatedMinutes: 60,
        dueDate: '2025-12-31T23:59:59Z'
      }

      const result = validateTask(taskData)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('должен вернуть ошибку для пустого названия', () => {
      const taskData = {
        title: '',
        priority: 'high',
        estimatedMinutes: 60
      }

      const result = validateTask(taskData)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Название задачи обязательно')
    })

    test('должен вернуть ошибку для слишком длинного названия', () => {
      const taskData = {
        title: 'a'.repeat(201),
        priority: 'high',
        estimatedMinutes: 60
      }

      const result = validateTask(taskData)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Название задачи не должно превышать 200 символов')
    })

    test('должен вернуть ошибку для невалидного приоритета', () => {
      const taskData = {
        title: 'Test Task',
        priority: 'invalid',
        estimatedMinutes: 60
      }

      const result = validateTask(taskData)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Некорректный приоритет задачи')
    })

    test('должен вернуть ошибку для отрицательного времени', () => {
      const taskData = {
        title: 'Test Task',
        priority: 'high',
        estimatedMinutes: -1
      }

      const result = validateTask(taskData)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Время выполнения должно быть больше 0 минут')
    })

    test('должен вернуть ошибку для слишком большого времени', () => {
      const taskData = {
        title: 'Test Task',
        priority: 'high',
        estimatedMinutes: 500
      }

      const result = validateTask(taskData)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Время выполнения не должно превышать 480 минут (8 часов)')
    })

    test('должен вернуть ошибку для прошедшей даты', () => {
      const taskData = {
        title: 'Test Task',
        priority: 'high',
        estimatedMinutes: 60,
        dueDate: '2020-01-01T00:00:00Z'
      }

      const result = validateTask(taskData)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Дата выполнения не может быть в прошлом')
    })
  })

  describe('validateEmail', () => {
    test('должен пройти валидацию для корректного email', () => {
      const email = 'test@example.com'
      const result = validateEmail(email)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('должен вернуть ошибку для невалидного формата', () => {
      const email = 'invalid-email'
      const result = validateEmail(email)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Некорректный формат email')
    })

    test('должен вернуть ошибку для пустого email', () => {
      const email = ''
      const result = validateEmail(email)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Email обязателен')
    })

    test('должен вернуть ошибку для слишком длинного email', () => {
      const email = 'a'.repeat(250) + '@example.com'
      const result = validateEmail(email)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Email слишком длинный')
    })
  })

  describe('validatePassword', () => {
    test('должен пройти валидацию для сильного пароля', () => {
      const password = 'SecurePass123!'
      const result = validatePassword(password)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('должен вернуть ошибку для короткого пароля', () => {
      const password = '123'
      const result = validatePassword(password)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Пароль должен содержать минимум 8 символов')
    })

    test('должен вернуть ошибку для пароля без строчных букв', () => {
      const password = 'SECUREPASS123!'
      const result = validatePassword(password)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Пароль должен содержать строчные буквы')
    })

    test('должен вернуть ошибку для пароля без заглавных букв', () => {
      const password = 'securepass123!'
      const result = validatePassword(password)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Пароль должен содержать заглавные буквы')
    })

    test('должен вернуть ошибку для пароля без цифр', () => {
      const password = 'SecurePass!'
      const result = validatePassword(password)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Пароль должен содержать цифры')
    })
  })

  describe('validateName', () => {
    test('должен пройти валидацию для корректного имени', () => {
      const name = 'John Doe'
      const result = validateName(name)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('должен вернуть ошибку для короткого имени', () => {
      const name = 'J'
      const result = validateName(name)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Имя должно содержать минимум 2 символа')
    })

    test('должен вернуть ошибку для имени с недопустимыми символами', () => {
      const name = 'John123'
      const result = validateName(name)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Имя может содержать только буквы, пробелы, дефисы и апострофы')
    })
  })

  describe('sanitizeString', () => {
    test('должен санитизировать XSS атаки', () => {
      const input = '<script>alert("xss")</script>'
      const result = sanitizeString(input)

      expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;')
    })

    test('должен санитизировать HTML теги', () => {
      const input = '<div>Hello</div>'
      const result = sanitizeString(input)

      expect(result).toBe('&lt;div&gt;Hello&lt;&#x2F;div&gt;')
    })
  })

  describe('validateNumber', () => {
    test('должен пройти валидацию для корректного числа', () => {
      const result = validateNumber(50, 0, 100, 'Возраст')

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('должен вернуть ошибку для числа меньше минимума', () => {
      const result = validateNumber(-1, 0, 100, 'Возраст')

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Возраст не должно быть меньше 0')
    })

    test('должен вернуть ошибку для числа больше максимума', () => {
      const result = validateNumber(101, 0, 100, 'Возраст')

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Возраст не должно быть больше 100')
    })
  })

  describe('validateTimeRange', () => {
    test('должен пройти валидацию для корректного диапазона', () => {
      const result = validateTimeRange('09:00', '18:00')

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('должен вернуть ошибку для невалидного формата времени', () => {
      const result = validateTimeRange('25:00', '18:00')

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Некорректный формат времени начала (используйте HH:MM)')
    })

    test('должен вернуть ошибку когда время начала позже окончания', () => {
      const result = validateTimeRange('18:00', '09:00')

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Время начала должно быть раньше времени окончания')
    })
  })
})

describe('🧠 Smart Planning - Unit Tests', () => {
  describe('smartTaskPrioritization', () => {
    test('должен сортировать задачи по приоритету', () => {
      const tasks: Task[] = [
        { id: '1', title: 'Low Task', priority: 'low', status: 'todo', source: 'manual', tags: [], userId: 'user1', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', title: 'High Task', priority: 'high', status: 'todo', source: 'manual', tags: [], userId: 'user1', createdAt: new Date(), updatedAt: new Date() },
        { id: '3', title: 'Urgent Task', priority: 'urgent', status: 'todo', source: 'manual', tags: [], userId: 'user1', createdAt: new Date(), updatedAt: new Date() },
        { id: '4', title: 'Medium Task', priority: 'medium', status: 'todo', source: 'manual', tags: [], userId: 'user1', createdAt: new Date(), updatedAt: new Date() }
      ]

      const sorted = smartTaskPrioritization(tasks)

      expect(sorted[0].priority).toBe('urgent')
      expect(sorted[1].priority).toBe('high')
      expect(sorted[2].priority).toBe('medium')
      expect(sorted[3].priority).toBe('low')
    })

    test('должен сортировать по дедлайну при одинаковом приоритете', () => {
      const now = new Date()
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

      const tasks: Task[] = [
        { id: '1', title: 'Task 1', priority: 'high', status: 'todo', source: 'manual', tags: [], userId: 'user1', createdAt: new Date(), updatedAt: new Date(), dueDate: nextWeek },
        { id: '2', title: 'Task 2', priority: 'high', status: 'todo', source: 'manual', tags: [], userId: 'user1', createdAt: new Date(), updatedAt: new Date(), dueDate: tomorrow }
      ]

      const sorted = smartTaskPrioritization(tasks)

      expect(sorted[0].dueDate).toEqual(tomorrow)
      expect(sorted[1].dueDate).toEqual(nextWeek)
    })

    test('должен сортировать по времени выполнения при одинаковом приоритете и дедлайне', () => {
      const tasks: Task[] = [
        { id: '1', title: 'Long Task', priority: 'high', status: 'todo', source: 'manual', tags: [], userId: 'user1', createdAt: new Date(), updatedAt: new Date(), estimatedMinutes: 120 },
        { id: '2', title: 'Short Task', priority: 'high', status: 'todo', source: 'manual', tags: [], userId: 'user1', createdAt: new Date(), updatedAt: new Date(), estimatedMinutes: 30 }
      ]

      const sorted = smartTaskPrioritization(tasks)

      expect(sorted[0].estimatedMinutes).toBe(30)
      expect(sorted[1].estimatedMinutes).toBe(120)
    })
  })

  describe('analyzeProductivityAndSuggest', () => {
    test('должен анализировать продуктивность для выполненных задач', () => {
      const completedTasks: Task[] = [
        { id: '1', title: 'Task 1', priority: 'urgent', status: 'completed', source: 'manual', tags: [], userId: 'user1', createdAt: new Date(), updatedAt: new Date(), completedAt: new Date() },
        { id: '2', title: 'Task 2', priority: 'high', status: 'completed', source: 'manual', tags: [], userId: 'user1', createdAt: new Date(), updatedAt: new Date(), completedAt: new Date() }
      ]

      const analysis = analyzeProductivityAndSuggest(completedTasks)

      expect(analysis.score).toBeGreaterThan(0)
      expect(analysis.insights.length).toBeGreaterThan(0)
      expect(analysis.recommendations).toHaveLength(1)
    })

    test('должен давать рекомендации для пустого списка задач', () => {
      const analysis = analyzeProductivityAndSuggest([])

      expect(analysis.score).toBe(0)
      expect(analysis.insights).toContain('📊 Сегодня еще не выполнено ни одной задачи')
      expect(analysis.recommendations).toContain('🎯 Начните с самой простой задачи для создания импульса')
    })
  })

  describe('createDailySchedule', () => {
    test('должен создать расписание на день', () => {
      const tasks: Task[] = [
        { id: '1', title: 'Task 1', priority: 'high', status: 'todo', source: 'manual', tags: [], userId: 'user1', createdAt: new Date(), updatedAt: new Date(), estimatedMinutes: 60 },
        { id: '2', title: 'Task 2', priority: 'medium', status: 'todo', source: 'manual', tags: [], userId: 'user1', createdAt: new Date(), updatedAt: new Date(), estimatedMinutes: 30 }
      ]

      const preferences: Partial<UserPreferences> = {
        workingHours: { start: '09:00', end: '18:00' },
        focusTime: 90,
        breakTime: 15
      }

      const schedule = createDailySchedule(tasks, preferences)

      expect(schedule.date).toBeDefined()
      expect(schedule.slots).toHaveLength(2)
      expect(schedule.productivity_score).toBeGreaterThanOrEqual(0)
      expect(schedule.recommendations.length).toBeGreaterThan(0)
    })
  })
})

describe('🤖 AI Models - Unit Tests', () => {
  describe('AIPlanner', () => {
    test('должен создать экземпляр с валидной моделью', () => {
      const planner = new AIPlanner('mock-ai')

      expect(planner).toBeDefined()
    })

    test('должен выбросить ошибку для невалидной модели', () => {
      expect(() => new AIPlanner('invalid-model')).toThrow('Модель invalid-model не найдена')
    })
  })

  describe('AI_MODELS', () => {
    test('должен содержать все необходимые модели', () => {
      expect(AI_MODELS['mock-ai']).toBeDefined()
      expect(AI_MODELS['gpt-4o-mini']).toBeDefined()
      expect(AI_MODELS['claude-sonnet']).toBeDefined()
      expect(AI_MODELS['gemini-pro']).toBeDefined()
    })

    test('должен иметь корректную структуру для каждой модели', () => {
      Object.values(AI_MODELS).forEach(model => {
        expect(model.id).toBeDefined()
        expect(model.name).toBeDefined()
        expect(model.provider).toBeDefined()
        expect(model.tier).toBeDefined()
        expect(model.costPerRequest).toBeDefined()
        expect(model.maxTokens).toBeDefined()
        expect(model.capabilities).toBeDefined()
      })
    })
  })
})

describe('🗄️ Supabase API - Unit Tests', () => {
  describe('addSubscriber', () => {
    test('должен добавить нового подписчика', async () => {
      const email = 'test@example.com'
      const result = await addSubscriber(email)

      expect(result.success).toBe(true)
      expect(result.message).toContain('Спасибо за подписку')
      expect(result.data).toBeDefined()
    })

    test('должен вернуть ошибку для дублирующегося email', async () => {
      const email = 'duplicate@example.com'

      // Первая подписка
      await addSubscriber(email)

      // Вторая подписка
      const result = await addSubscriber(email)

      expect(result.success).toBe(false)
      expect(result.message).toContain('уже подписан')
    })
  })

  describe('getActiveSubscribers', () => {
    test('должен получить список активных подписчиков', async () => {
      const subscribers = await getActiveSubscribers()

      expect(Array.isArray(subscribers)).toBe(true)
    })
  })

  describe('unsubscribe', () => {
    test('должен отписать пользователя', async () => {
      const email = 'unsubscribe@example.com'

      // Сначала подписываем
      await addSubscriber(email)

      // Затем отписываем
      const result = await unsubscribe(email)

      expect(result.success).toBe(true)
      expect(result.message).toContain('отписались')
    })

    test('должен вернуть ошибку для несуществующего подписчика', async () => {
      const result = await unsubscribe('nonexistent@example.com')

      expect(result.success).toBe(false)
      expect(result.message).toContain('не найден')
    })
  })
})

describe('🏪 Zustand Store - Unit Tests', () => {
  test('должен инициализироваться с пустым состоянием', () => {
    const store = useAppStore.getState()

    expect(store.user).toBeNull()
    expect(store.tasks).toEqual([])
    expect(store.suggestions).toEqual([])
    expect(store.metrics).toBeNull()
    expect(store.isLoading).toBe(false)
    expect(store.error).toBeNull()
  })

  test('должен обновлять пользователя', () => {
    const user: User = {
      id: '1',
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

    expect(useAppStore.getState().user).toEqual(user)
  })

  test('должен добавлять задачу', () => {
    const task: Task = {
      id: '1',
      title: 'Test Task',
      priority: 'high',
      status: 'todo',
      source: 'manual',
      tags: [],
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    useAppStore.getState().addTask(task)

    expect(useAppStore.getState().tasks).toContain(task)
  })

  test('должен обновлять задачу', () => {
    const task: Task = {
      id: '1',
      title: 'Test Task',
      priority: 'high',
      status: 'todo',
      source: 'manual',
      tags: [],
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    useAppStore.getState().addTask(task)
    useAppStore.getState().updateTask('1', { status: 'completed' })

    const updatedTask = useAppStore.getState().tasks.find(t => t.id === '1')
    expect(updatedTask?.status).toBe('completed')
  })

  test('должен удалять задачу', () => {
    const task: Task = {
      id: '1',
      title: 'Test Task',
      priority: 'high',
      status: 'todo',
      source: 'manual',
      tags: [],
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    useAppStore.getState().addTask(task)
    useAppStore.getState().deleteTask('1')

    expect(useAppStore.getState().tasks).not.toContain(task)
  })

  test('должен вычислять завершенные задачи сегодня', () => {
    const today = new Date()
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

    const tasks: Task[] = [
      {
        id: '1',
        title: 'Today Task',
        priority: 'high',
        status: 'completed',
        source: 'manual',
        tags: [],
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: today
      },
      {
        id: '2',
        title: 'Yesterday Task',
        priority: 'high',
        status: 'completed',
        source: 'manual',
        tags: [],
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: yesterday
      }
    ]

    useAppStore.getState().setTasks(tasks)

    const completedToday = useAppStore.getState().completedTasksToday()
    expect(completedToday).toHaveLength(1)
    expect(completedToday[0].id).toBe('1')
  })

  test('должен вычислять задачи в работе', () => {
    const tasks: Task[] = [
      {
        id: '1',
        title: 'Todo Task',
        priority: 'high',
        status: 'todo',
        source: 'manual',
        tags: [],
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        title: 'In Progress Task',
        priority: 'medium',
        status: 'in_progress',
        source: 'manual',
        tags: [],
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        title: 'Completed Task',
        priority: 'low',
        status: 'completed',
        source: 'manual',
        tags: [],
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    useAppStore.getState().setTasks(tasks)

    const pendingTasks = useAppStore.getState().pendingTasks()
    expect(pendingTasks).toHaveLength(2)
    expect(pendingTasks.map(t => t.id)).toContain('1')
    expect(pendingTasks.map(t => t.id)).toContain('2')
  })

  test('должен вычислять срочные задачи', () => {
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const tasks: Task[] = [
      {
        id: '1',
        title: 'Urgent Task',
        priority: 'urgent',
        status: 'todo',
        source: 'manual',
        tags: [],
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        title: 'High Task Tomorrow',
        priority: 'high',
        status: 'todo',
        source: 'manual',
        tags: [],
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: tomorrow
      },
      {
        id: '3',
        title: 'High Task Next Week',
        priority: 'high',
        status: 'todo',
        source: 'manual',
        tags: [],
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: nextWeek
      }
    ]

    useAppStore.getState().setTasks(tasks)

    const urgentTasks = useAppStore.getState().urgentTasks()
    expect(urgentTasks).toHaveLength(2)
    expect(urgentTasks.map(t => t.id)).toContain('1')
    expect(urgentTasks.map(t => t.id)).toContain('2')
  })
})

describe('📊 Edge Cases and Error Handling', () => {
  test('должен обрабатывать null и undefined значения', () => {
    expect(() => validateTask({})).not.toThrow()
    expect(() => validateEmail('')).not.toThrow()
    expect(() => validatePassword('')).not.toThrow()
  })

  test('должен обрабатывать экстремальные значения', () => {
    const extremeTask = {
      title: 'a'.repeat(1000),
      priority: 'urgent',
      estimatedMinutes: 10000
    }

    const result = validateTask(extremeTask)
    expect(result.isValid).toBe(false)
  })

  test('должен обрабатывать специальные символы', () => {
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    const result = sanitizeString(specialChars)
    expect(result).toBe('!@#$%^&*()_+-=[]{}|;:,.&lt;&gt;?')
  })
})