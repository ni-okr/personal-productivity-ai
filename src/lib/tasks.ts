import { Task, TaskPriority, TaskStatus } from '@/types'
import type { TaskInsert, TaskUpdate } from '@/types/supabase'
import { getSupabaseClient } from './supabase'

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
    const tasks: Task[] = ((data as any[]) || []).map((task) => ({
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
    const supabase = getSupabaseClient()

    const taskInsert: TaskInsert = {
      user_id: userId,
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority || 'medium',
      status: 'todo',
      due_date: taskData.dueDate?.toISOString(),
      estimated_duration: taskData.estimatedMinutes || 30,
      source: 'manual',
      tags: taskData.tags || []
    }

    const { data, error } = await (supabase as any)
      .from('tasks')
      .insert(taskInsert)
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
      id: (data as any).id,
      title: (data as any).title,
      description: (data as any).description,
      priority: (data as any).priority,
      status: (data as any).status,
      dueDate: (data as any).due_date ? new Date((data as any).due_date) : undefined,
      completedAt: (data as any).completed_at ? new Date((data as any).completed_at) : undefined,
      estimatedMinutes: (data as any).estimated_duration,
      actualMinutes: (data as any).actual_duration,
      source: (data as any).source,
      tags: (data as any).tags || [],
      userId: (data as any).user_id,
      createdAt: new Date((data as any).created_at),
      updatedAt: new Date((data as any).updated_at)
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
    const supabase = getSupabaseClient()

    const taskUpdate: TaskUpdate = {
      title: updates.title,
      description: updates.description,
      priority: updates.priority,
      status: updates.status,
      due_date: updates.dueDate?.toISOString(),
      estimated_duration: updates.estimatedMinutes,
      tags: updates.tags
    }

    const { data, error } = await (supabase as any)
      .from('tasks')
      .update(taskUpdate)
      .eq('id', taskId)
      .select()
      .single()

    if (error) {
      console.error('🚨 Ошибка обновления задачи:', error)
      return {
        success: false,
        error: error.message
      }
    }

    // Преобразуем данные из Supabase в наш формат
    const task: Task = {
      id: (data as any).id,
      title: (data as any).title,
      description: (data as any).description,
      priority: (data as any).priority,
      status: (data as any).status,
      dueDate: (data as any).due_date ? new Date((data as any).due_date) : undefined,
      completedAt: (data as any).completed_at ? new Date((data as any).completed_at) : undefined,
      estimatedMinutes: (data as any).estimated_duration,
      actualMinutes: (data as any).actual_duration,
      source: (data as any).source,
      tags: (data as any).tags || [],
      userId: (data as any).user_id,
      createdAt: new Date((data as any).created_at),
      updatedAt: new Date((data as any).updated_at)
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
    const supabase = getSupabaseClient()

    const taskUpdate: TaskUpdate = {
      status: 'completed',
      completed_at: new Date().toISOString(),
      actual_duration: actualMinutes
    }

    const { data, error } = await (supabase as any)
      .from('tasks')
      .update(taskUpdate)
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
      id: (data as any).id,
      title: (data as any).title,
      description: (data as any).description,
      priority: (data as any).priority,
      status: (data as any).status,
      dueDate: (data as any).due_date ? new Date((data as any).due_date) : undefined,
      completedAt: (data as any).completed_at ? new Date((data as any).completed_at) : undefined,
      estimatedMinutes: (data as any).estimated_duration,
      actualMinutes: (data as any).actual_duration,
      source: (data as any).source,
      tags: (data as any).tags || [],
      userId: (data as any).user_id,
      createdAt: new Date((data as any).created_at),
      updatedAt: new Date((data as any).updated_at)
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
    const tasksArray = tasks as any[] || []
    const total = tasksArray.length
    const completed = tasksArray.filter((task) => task.status === 'completed').length
    const pending = tasksArray.filter((task) => task.status === 'todo' || task.status === 'in_progress').length
    const overdue = tasksArray.filter((task) =>
      (task.status === 'todo' || task.status === 'in_progress') &&
      task.due_date &&
      new Date(task.due_date) < now
    ).length

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    const completedTasks = tasksArray.filter((task) => task.status === 'completed' && task.actual_duration)
    const averageCompletionTime = completedTasks.length > 0
      ? Math.round(completedTasks.reduce((sum, task) => sum + (task.actual_duration || 0), 0) / completedTasks.length)
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
    const tasks: Task[] = ((data as any[]) || []).map((task) => ({
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
