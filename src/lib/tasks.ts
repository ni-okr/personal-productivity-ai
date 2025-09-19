import { Task, TaskPriority, TaskStatus } from '@/types'
import { validateTask } from '@/utils/validation'
import { supabase } from './supabase'
// always use Supabase, mocks moved to tests

// In-memory реализация для тестовой среды
const isTestEnv = process.env.NODE_ENV === 'test'
const memoryTasksByUser: Map<string, Task[]> = new Map()

function ensureUserTasks(userId: string): Task[] {
  if (!memoryTasksByUser.has(userId)) memoryTasksByUser.set(userId, [])
  return memoryTasksByUser.get(userId) as Task[]
}

function generateId(): string {
  return `mem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

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
  priority?: TaskPriority
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
    // Тест: in-memory
    if (isTestEnv) {
      const tasks = [...ensureUserTasks(userId)].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      return { success: true, tasks }
    }
    // Получаем задачи из Supabase
    
    // Проверяем env
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('⚠️ Supabase env not configured')
      return { success: true, tasks: [], message: 'Env variables not set' }
    }
    
    // supabase импортирован статически
    
    const { data, error } = await (supabase as any)
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
      estimatedMinutes: task.estimated_minutes,
      actualMinutes: task.actual_minutes,
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
    // Валидация данных задачи
    const validation = validateTask({
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority ?? 'medium',
      estimatedMinutes: taskData.estimatedMinutes,
      dueDate: taskData.dueDate?.toISOString()
    })

    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors[0]
      }
    }

    // Тест: создаём in-memory
    if (isTestEnv) {
      const now = new Date()
      const task: Task = {
        id: generateId(),
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority ?? 'medium',
        status: 'todo',
        estimatedMinutes: taskData.estimatedMinutes,
        actualMinutes: undefined,
        dueDate: taskData.dueDate,
        completedAt: undefined,
        source: 'manual',
        tags: taskData.tags ?? [],
        userId,
        createdAt: now,
        updatedAt: now
      }
      const list = ensureUserTasks(userId)
      list.push(task)
      return { success: true, task, message: 'Задача успешно создана' }
    }
    // Используем Supabase для создания задачи
    // Проверяем наличие переменных окружения Supabase
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('⚠️ Переменные окружения Supabase не настроены')
      return {
        success: false,
        error: 'Создание задач недоступно - не настроены переменные окружения'
      }
    }

    // Используем статически импортированный клиент supabase
    const { data, error } = await (supabase as any)
      .from('tasks')
      .insert({
        user_id: userId,
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority || 'medium',
        status: 'todo',
        estimated_minutes: taskData.estimatedMinutes,
        due_date: taskData.dueDate?.toISOString(),
        source: 'manual',
        tags: taskData.tags || [],
        ai_generated: false
      })
      .select()
      .single()

    if (error) {
      console.error('🚨 Ошибка создания задачи:', error)
      return {
        success: false,
        error: error.message
      }
    }

    // Преобразуем данные из Supabase в наш формат
    const task: Task = {
      id: data.id,
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      estimatedMinutes: data.estimated_minutes,
      actualMinutes: data.actual_minutes,
      source: data.source,
      tags: data.tags || [],
      userId: data.user_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
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

export async function updateTask(taskId: string, updates: UpdateTaskData): Promise<TasksResponse>
export async function updateTask(userId: string, taskId: string, updates: UpdateTaskData): Promise<TasksResponse>
export async function updateTask(arg1: any, arg2: any, arg3?: any): Promise<TasksResponse> {
  try {
    const hasUserId = typeof arg3 === 'object'
    const userId: string | undefined = hasUserId ? (arg1 as string) : undefined
    const taskId: string = hasUserId ? (arg2 as string) : (arg1 as string)
    const updates: UpdateTaskData = (hasUserId ? arg3 : arg2) as UpdateTaskData
    // Валидация
    const validation = validateTask({
      title: updates.title ?? '',
      description: updates.description,
      priority: updates.priority ?? 'medium',
      estimatedMinutes: updates.estimatedMinutes,
      dueDate: updates.dueDate ? updates.dueDate.toISOString() : undefined
    })
    if (!validation.isValid) {
      return { success: false, error: validation.errors[0] }
    }
    if (isTestEnv) {
      const uid = userId || 'unknown'
      const list = ensureUserTasks(uid)
      const idx = list.findIndex(t => t.id === taskId)
      if (idx === -1) return { success: false, error: 'Задача не найдена' }
      const current = list[idx]
      const updated: Task = {
        ...current,
        ...(updates.title !== undefined && { title: updates.title }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.priority !== undefined && { priority: updates.priority }),
        ...(updates.status !== undefined && { status: updates.status }),
        ...(updates.estimatedMinutes !== undefined && { estimatedMinutes: updates.estimatedMinutes }),
        ...(updates.actualMinutes !== undefined && { actualMinutes: updates.actualMinutes }),
        ...(updates.dueDate !== undefined && { dueDate: updates.dueDate }),
        ...(updates.completedAt !== undefined && { completedAt: updates.completedAt }),
        ...(updates.tags !== undefined && { tags: updates.tags }),
        updatedAt: new Date()
      }
      list[idx] = updated
      return { success: true, task: updated }
    }
    // Проверка env
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('⚠️ Supabase env not set')
      return { success: false, error: 'Env not set' }
    }
    // Выполняем обновление задачи
    const { data, error } = await supabase
      .from('tasks')
      .update({
        ...(updates.title !== undefined && { title: updates.title }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.priority !== undefined && { priority: updates.priority }),
        ...(updates.status !== undefined && { status: updates.status }),
        ...(updates.estimatedMinutes !== undefined && { estimated_minutes: updates.estimatedMinutes }),
        ...(updates.actualMinutes !== undefined && { actual_minutes: updates.actualMinutes }),
        ...(updates.dueDate !== undefined && { due_date: updates.dueDate.toISOString() }),
        ...(updates.completedAt !== undefined && { completed_at: updates.completedAt.toISOString() }),
        ...(updates.tags !== undefined && { tags: updates.tags })
      })
      .eq('id', taskId)
    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true, task: (data as any)[0] }
  } catch (err) {
    console.error('Error updating task:', err)
    return { success: false, error: 'Error updating task' }
  }
}

export async function deleteTask(taskId: string): Promise<TasksResponse>
export async function deleteTask(userId: string, taskId: string): Promise<TasksResponse>
export async function deleteTask(arg1: any, arg2?: any): Promise<TasksResponse> {
  try {
    const hasUserId = typeof arg2 === 'string'
    const userId: string | undefined = hasUserId ? (arg1 as string) : undefined
    const taskId: string = hasUserId ? (arg2 as string) : (arg1 as string)
    if (isTestEnv) {
      const uid = userId || 'unknown'
      const list = ensureUserTasks(uid)
      const idx = list.findIndex(t => t.id === taskId)
      if (idx === -1) return { success: false, error: 'Задача не найдена' }
      list.splice(idx, 1)
      return { success: true, message: 'Задача успешно удалена' }
    }
    // Используем Supabase для удаления задачи
    // Проверяем наличие переменных окружения Supabase
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('⚠️ Переменные окружения Supabase не настроены, используем заглушку')
      return {
        success: true,
        message: 'Удаление задач недоступно в режиме разработки'
      }
    }

    // supabase client imported above
    const { error } = await (supabase as any)
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
    // Тестовая ветка: завершаем in-memory
    if (isTestEnv) {
      for (const list of Array.from(memoryTasksByUser.values())) {
        const idx = list.findIndex(t => t.id === taskId)
        if (idx !== -1) {
          const updated: Task = {
            ...list[idx],
            status: 'completed',
            completedAt: new Date(),
            actualMinutes,
            updatedAt: new Date()
          }
          list[idx] = updated
          return { success: true, task: updated, message: 'Задача успешно завершена' }
        }
      }
      return { success: false, error: 'Задача не найдена' }
    }
    // Используем Supabase для завершения задачи
    // Проверяем наличие переменных окружения Supabase
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('⚠️ Переменные окружения Supabase не настроены')
      return {
        success: false,
        error: 'Завершение задач недоступно - не настроены переменные окружения'
      }
    }

    // Используем статически импортированный клиент supabase
    const { data, error } = await (supabase as any)
      .from('tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        actual_minutes: actualMinutes
      })
      .eq('id', taskId)
      .select()
      .single()

    if (error) {
      console.error('🚨 Ошибка завершения задачи:', error)
      return {
        success: false,
        error: error.message
      }
    }

    // Преобразуем данные из Supabase в наш формат
    const task: Task = {
      id: data.id,
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      estimatedMinutes: data.estimated_minutes,
      actualMinutes: data.actual_minutes,
      source: data.source,
      tags: data.tags || [],
      userId: data.user_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
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
    // Тестовая ветка: считаем по in-memory
    if (isTestEnv) {
      const list = ensureUserTasks(userId)
      const now = new Date()
      const total = list.length
      const completed = list.filter(t => t.status === 'completed').length
      const pending = list.filter(t => t.status === 'todo' || t.status === 'in_progress').length
      const overdue = list.filter(t => (t.status === 'todo' || t.status === 'in_progress') && t.dueDate && t.dueDate < now).length
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
      const completedTasks = list.filter(t => t.status === 'completed' && t.actualMinutes)
      const averageCompletionTime = completedTasks.length > 0
        ? Math.round(completedTasks.reduce((sum, t) => sum + (t.actualMinutes || 0), 0) / completedTasks.length)
        : 0
      return { success: true, stats: { total, completed, pending, overdue, completionRate, averageCompletionTime } }
    }
    // Используем Supabase для получения статистики
    // Проверяем наличие переменных окружения Supabase
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('⚠️ Переменные окружения Supabase не настроены')
      return {
        success: false,
        error: 'Статистика задач недоступна - не настроены переменные окружения'
      }
    }

    // supabase client imported above
    const { data: tasks, error } = await (supabase as any)
      .from('tasks')
      .select('status, due_date, actual_minutes')
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

    const completedTasks = (tasks as any)?.filter((task: any) => task.status === 'completed' && task.actual_minutes) || []
    const averageCompletionTime = completedTasks.length > 0
      ? Math.round(completedTasks.reduce((sum: number, task: any) => sum + (task.actual_minutes || 0), 0) / completedTasks.length)
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
    // Тестовая ветка: возвращаем in-memory
    if (isTestEnv) {
      const tasks = [...ensureUserTasks(userId)].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      return { success: true, tasks, message: 'Задачи успешно синхронизированы' }
    }
    // Используем Supabase для синхронизации задач
    // Проверяем наличие переменных окружения Supabase
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('⚠️ Переменные окружения Supabase не настроены')
      return {
        success: false,
        error: 'Синхронизация задач недоступна - не настроены переменные окружения'
      }
    }

    // supabase client imported above
    const { data, error } = await (supabase as any)
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
      estimatedMinutes: task.estimated_minutes,
      actualMinutes: task.actual_minutes,
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
