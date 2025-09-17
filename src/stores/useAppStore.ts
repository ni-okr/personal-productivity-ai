import { signOut as supabaseSignOut } from '@/lib/auth'
import {
  completeTask,
  createTask,
  CreateTaskData,
  deleteTask as deleteTaskApi,
  getTasks,
  getTasksStats,
  syncTasks,
  updateTask as updateTaskApi,
  UpdateTaskData
} from '@/lib/tasks'
import { AICoachSuggestion, AppState, ProductivityMetrics, Task, User } from '@/types'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// 🚨 ЗАЩИТА ОТ ТЕСТИРОВАНИЯ С РЕАЛЬНЫМИ EMAIL
const DISABLE_EMAIL = process.env.NEXT_PUBLIC_DISABLE_EMAIL === 'true'

// 🧪 DEPENDENCY INJECTION для тестирования
interface TaskAPI {
  getTasks: (userId: string) => Promise<any>
  createTask: (userId: string, taskData: CreateTaskData) => Promise<any>
  updateTask: (id: string, updates: UpdateTaskData) => Promise<any>
  deleteTask: (id: string) => Promise<any>
  completeTask: (id: string, actualDuration?: number) => Promise<any>
  syncTasks: (userId: string) => Promise<any>
  getTasksStats: (userId: string) => Promise<any>
  getProductivityMetrics: (userId: string) => Promise<any>
  getAISuggestions: (userId: string) => Promise<any>
}

// 🧪 Mock API для тестирования
let mockTaskAPI: TaskAPI | null = null

export const setMockTaskAPI = (api: TaskAPI | null) => {
  mockTaskAPI = api
}

// 🧪 Функция для получения API (реального или mock)
const getTaskAPI = async (): Promise<TaskAPI> => {
  if (mockTaskAPI) {
    return mockTaskAPI
  }

  if (DISABLE_EMAIL) {
    const mockModule = await import('@/lib/tasks-mock')
    return {
      getTasks: mockModule.mockGetTasks,
      createTask: mockModule.mockCreateTask,
      updateTask: mockModule.mockUpdateTask,
      deleteTask: mockModule.mockDeleteTask,
      completeTask: mockModule.mockCompleteTask,
      syncTasks: mockModule.mockSyncTasks,
      getTasksStats: mockModule.mockGetTasksStats,
      getProductivityMetrics: mockModule.mockGetProductivityMetrics,
      getAISuggestions: mockModule.mockGetAISuggestions
    }
  }

  return {
    getTasks,
    createTask,
    updateTask: updateTaskApi,
    deleteTask: deleteTaskApi,
    completeTask,
    syncTasks,
    getTasksStats,
    getProductivityMetrics: async () => null,
    getAISuggestions: async () => []
  }
}

interface AppStore extends AppState {
  // Actions
  setUser: (user: User | null) => void
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  setSuggestions: (suggestions: AICoachSuggestion[]) => void
  dismissSuggestion: (id: string) => void
  setMetrics: (metrics: ProductivityMetrics | null) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void

  // Auth actions
  signOut: () => Promise<void>
  clearUserData: () => void

  // Supabase tasks actions
  loadTasks: () => Promise<void>
  createTaskAsync: (taskData: CreateTaskData) => Promise<void>
  updateTaskAsync: (id: string, updates: UpdateTaskData) => Promise<void>
  deleteTaskAsync: (id: string) => Promise<void>
  completeTaskAsync: (id: string, actualDuration?: number) => Promise<void>
  syncTasksAsync: () => Promise<void>
  loadTasksStats: () => Promise<void>

  // Computed values
  completedTasksToday: () => Task[]
  pendingTasks: () => Task[]
  urgentTasks: () => Task[]
  todayProductivityScore: () => number
}

export const useAppStore = create<AppStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      user: null,
      tasks: [],
      suggestions: [],
      metrics: null,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => {
        set({ user })
        // В mock режиме автоматически загружаем задачи при установке пользователя
        if (DISABLE_EMAIL && user) {
          // Загружаем задачи асинхронно
          setTimeout(() => {
            get().loadTasks()
          }, 0)
        }
      },

      setTasks: (tasks) => set({ tasks }),

      addTask: (task) => set((state) => ({
        tasks: [...state.tasks, task]
      })),

      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map(task =>
          task.id === id ? { ...task, ...updates } : task
        )
      })),

      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(task => task.id !== id)
      })),

      setSuggestions: (suggestions) => set({ suggestions }),

      dismissSuggestion: (id) => set((state) => ({
        suggestions: state.suggestions.filter(s => s.id !== id)
      })),

      setMetrics: (metrics) => set({ metrics }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Auth actions
      signOut: async () => {
        try {
          set({ isLoading: true, error: null })
          await supabaseSignOut()
          set({ user: null, tasks: [], suggestions: [], metrics: null })
        } catch (error: any) {
          set({ error: error.message || 'Ошибка при выходе' })
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      clearUserData: () => set({
        user: null,
        tasks: [],
        suggestions: [],
        metrics: null,
        error: null
      }),

      // Supabase tasks actions
      loadTasks: async () => {
        const { user } = get()
        if (!user) {
          console.log('🚨 loadTasks: Пользователь не найден')
          return
        }

        console.log('🚨 loadTasks: Начинаем загрузку задач для пользователя', user.id)
        console.log('🚨 loadTasks: DISABLE_EMAIL =', DISABLE_EMAIL)

        try {
          set({ isLoading: true, error: null })

          const api = await getTaskAPI()
          const result = await api.getTasks(user.id)

          // Загружаем метрики и рекомендации
          const metrics = await api.getProductivityMetrics(user.id)
          const suggestions = await api.getAISuggestions(user.id)

          if (metrics) {
            set({ metrics })
          }
          if (suggestions) {
            set({ suggestions })
          }

          if (result.success && result.tasks) {
            console.log('🚨 loadTasks: Успешно загружены задачи', result.tasks.length)
            set({ tasks: result.tasks })
          } else {
            console.log('🚨 loadTasks: Ошибка загрузки задач', result.error)
            set({ error: result.error || 'Ошибка загрузки задач' })
          }
        } catch (error: any) {
          console.log('🚨 loadTasks: Исключение', error)
          set({ error: error.message || 'Ошибка загрузки задач' })
        } finally {
          set({ isLoading: false })
        }
      },

      createTaskAsync: async (taskData: CreateTaskData) => {
        const { user } = get()
        if (!user) return

        try {
          set({ isLoading: true, error: null })

          const api = await getTaskAPI()
          const result = await api.createTask(user.id, taskData)

          if (result.success && result.task) {
            set((state) => ({
              tasks: [result.task!, ...state.tasks]
            }))
          } else {
            set({ error: result.error || 'Ошибка создания задачи' })
          }
        } catch (error: any) {
          set({ error: error.message || 'Ошибка создания задачи' })
        } finally {
          set({ isLoading: false })
        }
      },

      updateTaskAsync: async (id: string, updates: UpdateTaskData) => {
        try {
          set({ isLoading: true, error: null })

          const api = await getTaskAPI()
          const result = await api.updateTask(id, updates)

          if (result.success && result.task) {
            set((state) => ({
              tasks: state.tasks.map(task =>
                task.id === id ? result.task! : task
              )
            }))
          } else {
            set({ error: result.error || 'Ошибка обновления задачи' })
          }
        } catch (error: any) {
          set({ error: error.message || 'Ошибка обновления задачи' })
        } finally {
          set({ isLoading: false })
        }
      },

      deleteTaskAsync: async (id: string) => {
        try {
          set({ isLoading: true, error: null })

          const api = await getTaskAPI()
          const result = await api.deleteTask(id)

          if (result.success) {
            set((state) => ({
              tasks: state.tasks.filter(task => task.id !== id)
            }))
          } else {
            set({ error: result.error || 'Ошибка удаления задачи' })
          }
        } catch (error: any) {
          set({ error: error.message || 'Ошибка удаления задачи' })
        } finally {
          set({ isLoading: false })
        }
      },

      completeTaskAsync: async (id: string, actualDuration?: number) => {
        try {
          set({ isLoading: true, error: null })

          const api = await getTaskAPI()
          const result = await api.completeTask(id, actualDuration)

          if (result.success && result.task) {
            set((state) => ({
              tasks: state.tasks.map(task =>
                task.id === id ? result.task! : task
              )
            }))
          } else {
            set({ error: result.error || 'Ошибка завершения задачи' })
          }
        } catch (error: any) {
          set({ error: error.message || 'Ошибка завершения задачи' })
        } finally {
          set({ isLoading: false })
        }
      },

      syncTasksAsync: async () => {
        const { user } = get()
        if (!user) return

        try {
          set({ isLoading: true, error: null })
          const api = await getTaskAPI()
          const result = await api.syncTasks(user.id)

          if (result.success && result.tasks) {
            set({ tasks: result.tasks })
          } else {
            set({ error: result.error || 'Ошибка синхронизации задач' })
          }
        } catch (error: any) {
          set({ error: error.message || 'Ошибка синхронизации задач' })
        } finally {
          set({ isLoading: false })
        }
      },

      loadTasksStats: async () => {
        const { user } = get()
        if (!user) return

        try {
          set({ isLoading: true, error: null })
          const api = await getTaskAPI()
          const stats = await api.getTasksStats(user.id)
          // Можно добавить статистику в store или использовать для обновления метрик
          console.log('Tasks stats:', stats)
        } catch (error: any) {
          console.error('Ошибка загрузки статистики задач:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      // Computed values
      completedTasksToday: () => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        return get().tasks.filter(task =>
          task.status === 'completed' &&
          task.completedAt &&
          task.completedAt >= today
        )
      },

      pendingTasks: () => {
        return get().tasks.filter(task =>
          task.status === 'todo' || task.status === 'in_progress'
        ).sort((a, b) => {
          // Sort by priority and due date
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
          const aPriority = priorityOrder[a.priority]
          const bPriority = priorityOrder[b.priority]

          if (aPriority !== bPriority) {
            return bPriority - aPriority
          }

          if (a.dueDate && b.dueDate) {
            return a.dueDate.getTime() - b.dueDate.getTime()
          }

          return 0
        })
      },

      urgentTasks: () => {
        const now = new Date()
        const tomorrow = new Date(now)
        tomorrow.setDate(tomorrow.getDate() + 1)

        return get().tasks.filter(task =>
          (task.priority === 'urgent' || task.priority === 'high') &&
          (task.status === 'todo' || task.status === 'in_progress') &&
          (!task.dueDate || task.dueDate <= tomorrow)
        )
      },

      todayProductivityScore: () => {
        const metrics = get().metrics
        if (!metrics) return 0

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (metrics.date >= today) {
          return metrics.productivityScore
        }

        return 0
      }
    }),
    {
      name: 'personal-ai-store'
    }
  )
)
