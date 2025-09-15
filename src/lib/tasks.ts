// 📋 API для работы с задачами в Supabase
import { Task, TaskPriority, TaskStatus } from '@/types'
import { supabase } from './supabase'

export interface CreateTaskData {
    title: string
    description?: string
    priority: TaskPriority
    dueDate?: Date
    estimatedMinutes?: number
    tags?: string[]
}

export interface UpdateTaskData {
    title?: string
    description?: string
    priority?: TaskPriority
    status?: TaskStatus
    dueDate?: Date
    completedAt?: Date
    estimatedMinutes?: number
    actualMinutes?: number
    tags?: string[]
}

export interface TasksResponse {
    success: boolean
    tasks?: Task[]
    task?: Task
    error?: string
    message?: string
}

/**
 * 📝 Получение всех задач пользователя
 */
export async function getTasks(userId: string): Promise<TasksResponse> {
    try {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Ошибка получения задач:', error)
            return {
                success: false,
                error: 'Не удалось загрузить задачи'
            }
        }

        // Преобразуем данные из Supabase в формат Task
        const tasks: Task[] = data.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description || '',
            priority: task.priority,
            status: task.status,
            dueDate: task.due_date ? new Date(task.due_date) : undefined,
            completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
            estimatedMinutes: task.estimated_duration,
            actualMinutes: task.actual_duration,
            source: task.source || 'manual',
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
        console.error('Ошибка получения задач:', error)
        return {
            success: false,
            error: 'Произошла ошибка при загрузке задач'
        }
    }
}

/**
 * ➕ Создание новой задачи
 */
export async function createTask(userId: string, taskData: CreateTaskData): Promise<TasksResponse> {
    try {
        const { data, error } = await supabase
            .from('tasks')
            .insert({
                user_id: userId,
                title: taskData.title,
                description: taskData.description || '',
                priority: taskData.priority,
                status: 'todo',
                due_date: taskData.dueDate?.toISOString(),
                estimated_duration: taskData.estimatedMinutes,
                tags: taskData.tags || [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single()

        if (error) {
            console.error('Ошибка создания задачи:', error)
            return {
                success: false,
                error: 'Не удалось создать задачу'
            }
        }

        const task: Task = {
            id: data.id,
            title: data.title,
            description: data.description || '',
            priority: data.priority,
            status: data.status,
            dueDate: data.due_date ? new Date(data.due_date) : undefined,
            completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
            estimatedMinutes: data.estimated_duration,
            actualMinutes: data.actual_duration,
            source: data.source || 'manual',
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
        console.error('Ошибка создания задачи:', error)
        return {
            success: false,
            error: 'Произошла ошибка при создании задачи'
        }
    }
}

/**
 * ✏️ Обновление задачи
 */
export async function updateTask(taskId: string, updates: UpdateTaskData): Promise<TasksResponse> {
    try {
        const updateData: any = {
            ...updates,
            updated_at: new Date().toISOString()
        }

        // Преобразуем даты в ISO строки
        if (updates.dueDate) {
            updateData.due_date = updates.dueDate.toISOString()
        }
        if (updates.completedAt) {
            updateData.completed_at = updates.completedAt.toISOString()
        }

        const { data, error } = await supabase
            .from('tasks')
            .update(updateData)
            .eq('id', taskId)
            .select()
            .single()

        if (error) {
            console.error('Ошибка обновления задачи:', error)
            return {
                success: false,
                error: 'Не удалось обновить задачу'
            }
        }

        const task: Task = {
            id: data.id,
            title: data.title,
            description: data.description || '',
            priority: data.priority,
            status: data.status,
            dueDate: data.due_date ? new Date(data.due_date) : undefined,
            completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
            estimatedMinutes: data.estimated_duration,
            actualMinutes: data.actual_duration,
            source: data.source || 'manual',
            tags: data.tags || [],
            userId: data.user_id,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at)
        }

        return {
            success: true,
            task,
            message: 'Задача успешно обновлена'
        }
    } catch (error) {
        console.error('Ошибка обновления задачи:', error)
        return {
            success: false,
            error: 'Произошла ошибка при обновлении задачи'
        }
    }
}

/**
 * 🗑️ Удаление задачи
 */
export async function deleteTask(taskId: string): Promise<TasksResponse> {
    try {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', taskId)

        if (error) {
            console.error('Ошибка удаления задачи:', error)
            return {
                success: false,
                error: 'Не удалось удалить задачу'
            }
        }

        return {
            success: true,
            message: 'Задача успешно удалена'
        }
    } catch (error) {
        console.error('Ошибка удаления задачи:', error)
        return {
            success: false,
            error: 'Произошла ошибка при удалении задачи'
        }
    }
}

/**
 * ✅ Отметка задачи как выполненной
 */
export async function completeTask(taskId: string, actualMinutes?: number): Promise<TasksResponse> {
    try {
        const updateData: any = {
            status: 'completed',
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }

        if (actualMinutes !== undefined) {
            updateData.actual_duration = actualMinutes
        }

        const { data, error } = await supabase
            .from('tasks')
            .update(updateData)
            .eq('id', taskId)
            .select()
            .single()

        if (error) {
            console.error('Ошибка завершения задачи:', error)
            return {
                success: false,
                error: 'Не удалось завершить задачу'
            }
        }

        const task: Task = {
            id: data.id,
            title: data.title,
            description: data.description || '',
            priority: data.priority,
            status: data.status,
            dueDate: data.due_date ? new Date(data.due_date) : undefined,
            completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
            estimatedMinutes: data.estimated_duration,
            actualMinutes: data.actual_duration,
            source: data.source || 'manual',
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
        console.error('Ошибка завершения задачи:', error)
        return {
            success: false,
            error: 'Произошла ошибка при завершении задачи'
        }
    }
}

/**
 * 📊 Получение статистики задач
 */
export async function getTasksStats(userId: string): Promise<{
    success: boolean
    stats?: {
        total: number
        completed: number
        pending: number
        overdue: number
        completionRate: number
    }
    error?: string
}> {
    try {
        const { data, error } = await supabase
            .from('tasks')
            .select('status, due_date, completed_at')
            .eq('user_id', userId)

        if (error) {
            console.error('Ошибка получения статистики:', error)
            return {
                success: false,
                error: 'Не удалось загрузить статистику'
            }
        }

        const now = new Date()
        const total = data.length
        const completed = data.filter(task => task.status === 'completed').length
        const pending = data.filter(task => task.status === 'todo' || task.status === 'in_progress').length
        const overdue = data.filter(task => {
            if (task.status === 'completed') return false
            if (!task.due_date) return false
            return new Date(task.due_date) < now
        }).length

        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

        return {
            success: true,
            stats: {
                total,
                completed,
                pending,
                overdue,
                completionRate
            }
        }
    } catch (error) {
        console.error('Ошибка получения статистики:', error)
        return {
            success: false,
            error: 'Произошла ошибка при загрузке статистики'
        }
    }
}

/**
 * 🔄 Синхронизация задач с локальным состоянием
 */
export async function syncTasks(userId: string): Promise<TasksResponse> {
    try {
        const result = await getTasks(userId)

        if (!result.success) {
            return result
        }

        return {
            success: true,
            tasks: result.tasks,
            message: 'Задачи успешно синхронизированы'
        }
    } catch (error) {
        console.error('Ошибка синхронизации задач:', error)
        return {
            success: false,
            error: 'Произошла ошибка при синхронизации задач'
        }
    }
}
