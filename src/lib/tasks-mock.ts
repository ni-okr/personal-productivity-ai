// 🧪 Mock функции для тестирования задач без Supabase

import { AICoachSuggestion, CreateTaskData, ProductivityMetrics, Task, TasksResponse, TaskStatus, UpdateTaskData } from '@/types'

// Mock данные для задач
const mockTasks: Task[] = [
  {
    id: 'mock-task-1',
    title: 'Протестировать mock режим планировщика',
    description: 'Проверить работу добавления задач в mock режиме',
    priority: 'high',
    status: 'todo',
    estimatedMinutes: 30,
    source: 'manual',
    tags: ['тестирование', 'mock'],
    userId: 'mock-user-1',
    createdAt: new Date('2024-09-16T10:00:00Z'),
    updatedAt: new Date('2024-09-16T10:00:00Z')
  },
  {
    id: 'mock-task-2',
    title: 'Создать mock данные для демонстрации',
    description: 'Добавить примеры задач для показа функциональности',
    priority: 'medium',
    status: 'in_progress',
    estimatedMinutes: 45,
    source: 'manual',
    tags: ['разработка', 'mock'],
    userId: 'mock-user-1',
    createdAt: new Date('2024-09-16T09:30:00Z'),
    updatedAt: new Date('2024-09-16T11:15:00Z')
  },
  {
    id: 'mock-task-3',
    title: 'Завершить настройку авторизации',
    description: 'Исправить все проблемы с RLS и тестированием',
    priority: 'urgent',
    status: 'completed',
    estimatedMinutes: 60,
    actualMinutes: 55,
    source: 'manual',
    tags: ['авторизация', 'исправления'],
    userId: 'mock-user-1',
    createdAt: new Date('2024-09-16T08:00:00Z'),
    updatedAt: new Date('2024-09-16T12:00:00Z'),
    completedAt: new Date('2024-09-16T12:00:00Z')
  }
]

// Mock данные для метрик продуктивности
const mockMetrics: ProductivityMetrics = {
  date: new Date(),
  focusTimeMinutes: 120,
  tasksCompleted: 1,
  distractionsCount: 3,
  productivityScore: 75,
  mood: 'high',
  energyLevel: 'medium',
  userId: 'mock-user-1'
}

// Mock данные для рекомендаций ИИ
const mockSuggestions: AICoachSuggestion[] = [
  {
    id: 'mock-suggestion-1',
    type: 'task_prioritization',
    title: 'Сфокусируйтесь на срочных задачах',
    description: 'У вас есть 2 срочные задачи, которые требуют немедленного внимания',
    actionText: 'Посмотреть срочные задачи',
    priority: 1,
    userId: 'mock-user-1',
    createdAt: new Date()
  },
  {
    id: 'mock-suggestion-2',
    type: 'take_break',
    title: 'Время для перерыва',
    description: 'Вы работаете уже 2 часа без перерыва. Рекомендуется сделать 5-минутный перерыв',
    actionText: 'Сделать перерыв',
    priority: 2,
    userId: 'mock-user-1',
    createdAt: new Date()
  }
]

// Функции для работы с задачами
export async function mockGetTasks(userId: string): Promise<TasksResponse> {
  console.log('🧪 MOCK РЕЖИМ: Получение задач без реальных запросов к Supabase')

  // Фильтруем задачи по пользователю
  const userTasks = mockTasks.filter(task => task.userId === userId)

  return {
    success: true,
    tasks: userTasks,
    message: 'Mock задачи загружены успешно'
  }
}

export async function mockCreateTask(userId: string, taskData: CreateTaskData): Promise<TasksResponse> {
  console.log('🧪 MOCK РЕЖИМ: Создание задачи без реальных запросов к Supabase')

  const newTask: Task = {
    id: `mock-task-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    title: taskData.title,
    description: taskData.description,
    priority: taskData.priority,
    status: 'todo',
    estimatedMinutes: taskData.estimatedMinutes,
    source: 'manual',
    tags: taskData.tags || [],
    userId: userId,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  mockTasks.push(newTask)

  return {
    success: true,
    task: newTask,
    message: 'Mock задача создана успешно'
  }
}

export async function mockUpdateTask(taskId: string, updates: UpdateTaskData): Promise<TasksResponse> {
  console.log('🧪 MOCK РЕЖИМ: Обновление задачи без реальных запросов к Supabase')

  const taskIndex = mockTasks.findIndex(task => task.id === taskId)
  if (taskIndex === -1) {
    return {
      success: false,
      error: 'Задача не найдена'
    }
  }

  const updatedTask = {
    ...mockTasks[taskIndex],
    ...updates,
    updatedAt: new Date()
  }

  mockTasks[taskIndex] = updatedTask

  return {
    success: true,
    task: updatedTask,
    message: 'Mock задача обновлена успешно'
  }
}

export async function mockDeleteTask(taskId: string): Promise<TasksResponse> {
  console.log('🧪 MOCK РЕЖИМ: Удаление задачи без реальных запросов к Supabase')

  const taskIndex = mockTasks.findIndex(task => task.id === taskId)
  if (taskIndex === -1) {
    return {
      success: false,
      error: 'Задача не найдена'
    }
  }

  mockTasks.splice(taskIndex, 1)

  return {
    success: true,
    message: 'Mock задача удалена успешно'
  }
}

export async function mockCompleteTask(taskId: string, actualMinutes?: number): Promise<TasksResponse> {
  console.log('🧪 MOCK РЕЖИМ: Завершение задачи без реальных запросов к Supabase')

  const taskIndex = mockTasks.findIndex(task => task.id === taskId)
  if (taskIndex === -1) {
    return {
      success: false,
      error: 'Задача не найдена'
    }
  }

  const updatedTask = {
    ...mockTasks[taskIndex],
    status: 'completed' as TaskStatus,
    completedAt: new Date(),
    actualMinutes: actualMinutes || mockTasks[taskIndex].estimatedMinutes,
    updatedAt: new Date()
  }

  mockTasks[taskIndex] = updatedTask

  return {
    success: true,
    task: updatedTask,
    message: 'Mock задача завершена успешно'
  }
}

export async function mockGetTasksStats(userId: string): Promise<{
  success: boolean
  stats?: {
    total: number
    completed: number
    pending: number
    overdue: number
    completionRate: number
    averageCompletionTime: number
  }
  error?: string
}> {
  console.log('🧪 MOCK РЕЖИМ: Получение статистики задач без реальных запросов к Supabase')

  const userTasks = mockTasks.filter(task => task.userId === userId)
  const now = new Date()

  const total = userTasks.length
  const completed = userTasks.filter(task => task.status === 'completed').length
  const pending = userTasks.filter(task => task.status === 'todo' || task.status === 'in_progress').length
  const overdue = userTasks.filter(task =>
    (task.status === 'todo' || task.status === 'in_progress') &&
    task.dueDate &&
    task.dueDate < now
  ).length

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  const completedTasks = userTasks.filter(task => task.status === 'completed' && task.actualMinutes)
  const averageCompletionTime = completedTasks.length > 0
    ? Math.round(completedTasks.reduce((sum, task) => sum + (task.actualMinutes || 0), 0) / completedTasks.length)
    : 0

  return {
    success: true,
    stats: {
      total,
      completed,
      pending,
      overdue,
      completionRate,
      averageCompletionTime
    }
  }
}

export async function mockSyncTasks(userId: string): Promise<TasksResponse> {
  console.log('🧪 MOCK РЕЖИМ: Синхронизация задач без реальных запросов к Supabase')

  const userTasks = mockTasks.filter(task => task.userId === userId)

  return {
    success: true,
    tasks: userTasks,
    message: 'Mock задачи синхронизированы успешно'
  }
}

// Функции для работы с метриками
export async function mockGetProductivityMetrics(userId: string): Promise<ProductivityMetrics | null> {
  console.log('🧪 MOCK РЕЖИМ: Получение метрик продуктивности без реальных запросов к Supabase')

  return mockMetrics
}

// Функции для работы с рекомендациями ИИ
export async function mockGetAISuggestions(userId: string): Promise<AICoachSuggestion[]> {
  console.log('🧪 MOCK РЕЖИМ: Получение рекомендаций ИИ без реальных запросов к Supabase')

  return mockSuggestions.filter(suggestion => suggestion.userId === userId)
}


// Функция для добавления тестовых задач
export function addMockTask(task: Task): void {
  console.log('🧪 MOCK РЕЖИМ: Добавление тестовой задачи')
  mockTasks.push(task)
}

// Функция для получения mock задач по пользователю
export function getMockTasksByUser(userId: string): Task[] {
  return mockTasks.filter(task => task.userId === userId)
}

export function clearMockTasks(): void {
  console.log('🧪 MOCK РЕЖИМ: Очистка mock задач')
  // Очищаем массив mockTasks полностью
  mockTasks.length = 0
}

// Функция для обновления mock задач
export function updateMockTasks(tasks: Task[]): void {
  console.log('🧪 MOCK РЕЖИМ: Обновление mock задач')
  mockTasks.length = 0
  mockTasks.push(...tasks)
}
