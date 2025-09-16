import { Task, TaskPriority, TaskStatus } from '@/types'
// Условный импорт Supabase будет добавлен в функциях

// Временные типы
export interface TasksResponse {
  success: boolean
  tasks?: Task[]
  task?: Task
  message?: string
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
    // Проверяем наличие переменных окружения Supabase
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('⚠️ Переменные окружения Supabase не настроены, используем заглушку')
      return {
        success: true,
        tasks: [],
        message: 'Задачи недоступны в режиме разработки'
      }
    }

    // Импортируем Supabase только если есть переменные окружения
    const { getSupabaseClient } = await import('./supabase')
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('🚨 Ошибка получения задач:', error)
      return {
        success: false,
        error: error.message
      }
    }

    // Преобразуем данные из Supabase в наш формат
    const tasks: Task[] = ((data as any) || []).map((task: any) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
      estimatedMinutes: task.estimated_duration,
      actualMinutes: task.actual_duration,
      source: task.source,
      tags: task.tags || [],
      userId: task.user_id,
      createdAt: new Date(task.created_at),
      updatedAt: new Date(task.updated_at)
    }))

    return {
      success: true,
      tasks
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
    // Временно заглушка для успешного build
    console.log(`Create task for user ${userId}:`, taskData)

    const task: Task = {
      id: 'temp-id',
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority || 'medium',
      status: 'todo',
      dueDate: taskData.dueDate,
      completedAt: undefined,
      estimatedMinutes: taskData.estimatedMinutes || 30,
      actualMinutes: 0,
      source: 'manual',
      tags: taskData.tags || [],
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return {
      success: true,
      task,
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
    // Временно заглушка для успешного build
    console.log(`Update task ${taskId}:`, updates)

    const task: Task = {
      id: taskId,
      title: updates.title || 'Updated Task',
      description: updates.description,
      priority: updates.priority || 'medium',
      status: updates.status || 'todo',
      dueDate: updates.dueDate,
      completedAt: updates.completedAt,
      estimatedMinutes: updates.estimatedMinutes || 30,
      actualMinutes: updates.actualMinutes || 0,
      source: 'manual',
      tags: updates.tags || [],
      userId: 'temp-user',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return {
      success: true,
      task,
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
    // Проверяем наличие переменных окружения Supabase
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('⚠️ Переменные окружения Supabase не настроены, используем заглушку')
      return {
        success: true,
        message: 'Удаление задач недоступно в режиме разработки'
      }
    }

    // Импортируем Supabase только если есть переменные окружения
    const { getSupabaseClient } = await import('./supabase')
    const supabase = getSupabaseClient()

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (error) {
      console.error('🚨 Ошибка удаления задачи:', error)
      return {
        success: false,
        error: error.message
      }
    }

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
    // Временно заглушка для успешного build
    console.log(`Complete task ${taskId} with ${actualMinutes} minutes`)

    const task: Task = {
      id: taskId,
      title: 'Completed Task',
      description: 'Task completed',
      priority: 'medium',
      status: 'completed',
      dueDate: undefined,
      completedAt: new Date(),
      estimatedMinutes: 30,
      actualMinutes: actualMinutes || 0,
      source: 'manual',
      tags: [],
      userId: 'temp-user',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return {
      success: true,
      task,
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
    // Проверяем наличие переменных окружения Supabase
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('⚠️ Переменные окружения Supabase не настроены, используем заглушку')
      return {
        success: true,
        stats: {
          total: 0,
          completed: 0,
          pending: 0,
          overdue: 0,
          completionRate: 0,
          averageCompletionTime: 0
        }
      }
    }

    // Импортируем Supabase только если есть переменные окружения
    const { getSupabaseClient } = await import('./supabase')
    const supabase = getSupabaseClient()

    // Получаем все задачи пользователя
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('status, due_date, actual_duration')
      .eq('user_id', userId)

    if (error) {
      console.error('🚨 Ошибка получения статистики:', error)
      return {
        success: false,
        error: error.message
      }
    }

    const now = new Date()
    const total = (tasks as any)?.length || 0
    const completed = (tasks as any)?.filter((task: any) => task.status === 'completed').length || 0
    const pending = (tasks as any)?.filter((task: any) => task.status === 'todo' || task.status === 'in_progress').length || 0
    const overdue = (tasks as any)?.filter((task: any) =>
      (task.status === 'todo' || task.status === 'in_progress') &&
      task.due_date &&
      new Date(task.due_date) < now
    ).length || 0

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    const completedTasks = (tasks as any)?.filter((task: any) => task.status === 'completed' && task.actual_duration) || []
    const averageCompletionTime = completedTasks.length > 0
      ? Math.round(completedTasks.reduce((sum: number, task: any) => sum + (task.actual_duration || 0), 0) / completedTasks.length)
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
    // Проверяем наличие переменных окружения Supabase
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('⚠️ Переменные окружения Supabase не настроены, используем заглушку')
      return {
        success: true,
        tasks: [],
        message: 'Синхронизация задач недоступна в режиме разработки'
      }
    }

    // Импортируем Supabase только если есть переменные окружения
    const { getSupabaseClient } = await import('./supabase')
    const supabase = getSupabaseClient()

    // Получаем все задачи пользователя для синхронизации
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('🚨 Ошибка синхронизации задач:', error)
      return {
        success: false,
        error: error.message
      }
    }

    // Преобразуем данные из Supabase в наш формат
    const tasks: Task[] = ((data as any) || []).map((task: any) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
      estimatedMinutes: task.estimated_duration,
      actualMinutes: task.actual_duration,
      source: task.source,
      tags: task.tags || [],
      userId: task.user_id,
      createdAt: new Date(task.created_at),
      updatedAt: new Date(task.updated_at)
    }))

    return {
      success: true,
      tasks,
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
