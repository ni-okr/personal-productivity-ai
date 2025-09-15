import { Task, TaskPriority, TaskStatus } from '@/types'

// Временные типы
export interface TasksResponse {
  success: boolean
  tasks?: Task[]
  error?: string
}

export interface CreateTaskData {
  title: string
  description?: string
  priority: TaskPriority
  estimatedMinutes?: number
  dueDate?: Date
  tags?: string[]
}

export interface UpdateTaskData {
  title?: string
  description?: string
  priority?: TaskPriority
  status?: TaskStatus
  estimatedMinutes?: number
  actualMinutes?: number
  dueDate?: Date
  completedAt?: Date
  tags?: string[]
}

// Временные заглушки для функций
export async function getTasks(userId: string): Promise<TasksResponse> {
  try {
    // Временная заглушка
    console.log('📋 Получение задач (заглушка) для пользователя:', userId)
    return {
      success: true,
      tasks: [
        {
          id: 'test-task-1',
          userId,
          title: 'Test Task 1',
          description: 'Test Description 1',
          priority: 'high',
          status: 'todo',
          dueDate: new Date('2024-01-01'),
          estimatedMinutes: 30,
          actualMinutes: undefined,
          completedAt: undefined,
          tags: ['work'],
          source: 'manual',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    }
  } catch (error) {
    console.error('🚨 Ошибка получения задач:', error)
    return {
      success: false,
      error: 'Ошибка получения задач'
    }
  }
}

export async function createTask(userId: string, taskData: CreateTaskData): Promise<TasksResponse> {
  try {
    // Временная заглушка
    console.log('➕ Создание задачи (заглушка):', taskData)
    const newTask: Task = {
      id: 'test-task-' + Date.now(),
      userId,
      title: taskData.title,
      description: taskData.description || '',
      priority: taskData.priority || 'medium',
      status: 'todo',
      dueDate: taskData.dueDate,
      estimatedMinutes: taskData.estimatedDuration || 30,
      actualMinutes: undefined,
      completedAt: undefined,
      tags: taskData.tags || [],
      source: 'manual',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    return {
      success: true,
      task: newTask,
      message: 'Задача успешно создана'
    }
  } catch (error) {
    console.error('🚨 Ошибка создания задачи:', error)
    return {
      success: false,
      error: 'Ошибка создания задачи'
    }
  }
}

export async function updateTask(taskId: string, updates: UpdateTaskData): Promise<TasksResponse> {
  try {
    // Временная заглушка
    console.log('✏️ Обновление задачи (заглушка):', taskId, updates)
    const updatedTask: Task = {
      id: taskId,
      userId: 'test-user-id',
      title: updates.title || 'Updated Task',
      description: 'Test Description',
      priority: updates.priority || 'high',
      status: updates.status || 'in_progress',
      dueDate: new Date('2024-01-01'),
      estimatedMinutes: 30,
      actualMinutes: undefined,
      completedAt: undefined,
      tags: ['work'],
      source: 'manual',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    return {
      success: true,
      task: updatedTask,
      message: 'Задача успешно обновлена'
    }
  } catch (error) {
    console.error('🚨 Ошибка обновления задачи:', error)
    return {
      success: false,
      error: 'Ошибка обновления задачи'
    }
  }
}

export async function deleteTask(taskId: string): Promise<TasksResponse> {
  try {
    // Временная заглушка
    console.log('🗑️ Удаление задачи (заглушка):', taskId)
    return {
      success: true,
      message: 'Задача успешно удалена'
    }
  } catch (error) {
    console.error('🚨 Ошибка удаления задачи:', error)
    return {
      success: false,
      error: 'Ошибка удаления задачи'
    }
  }
}

export async function completeTask(taskId: string, actualMinutes?: number): Promise<TasksResponse> {
  try {
    // Временная заглушка
    console.log('✅ Завершение задачи (заглушка):', taskId, actualMinutes)
    const completedTask: Task = {
      id: taskId,
      userId: 'test-user-id',
      title: 'Test Task',
      description: 'Test Description',
      priority: 'high',
      status: 'completed',
      dueDate: new Date('2024-01-01'),
      estimatedMinutes: 30,
      actualMinutes: actualMinutes || 25,
      completedAt: new Date(),
      tags: ['work'],
      source: 'manual',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    return {
      success: true,
      task: completedTask,
      message: 'Задача успешно завершена'
    }
  } catch (error) {
    console.error('🚨 Ошибка завершения задачи:', error)
    return {
      success: false,
      error: 'Ошибка завершения задачи'
    }
  }
}

export async function getTasksStats(userId: string): Promise<{
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
  try {
    // Временная заглушка
    console.log('📊 Получение статистики задач (заглушка) для пользователя:', userId)
    return {
      success: true,
      stats: {
        total: 4,
        completed: 2,
        pending: 2,
        overdue: 2,
        completionRate: 50,
        averageCompletionTime: 25
      }
    }
  } catch (error) {
    console.error('🚨 Ошибка получения статистики:', error)
    return {
      success: false,
      error: 'Ошибка получения статистики'
    }
  }
}

export async function syncTasks(userId: string): Promise<TasksResponse> {
  try {
    // Временная заглушка
    console.log('🔄 Синхронизация задач (заглушка) для пользователя:', userId)
    return {
      success: true,
      tasks: [
        {
          id: 'sync-task-1',
          userId,
          title: 'Synced Task',
          description: 'Synced Description',
          priority: 'medium',
          status: 'todo',
          dueDate: new Date('2024-01-01'),
          estimatedMinutes: 45,
          actualMinutes: undefined,
          completedAt: undefined,
          tags: ['sync'],
          source: 'manual',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      message: 'Задачи успешно синхронизированы'
    }
  } catch (error) {
    console.error('🚨 Ошибка синхронизации задач:', error)
    return {
      success: false,
      error: 'Ошибка синхронизации задач'
    }
  }
}
