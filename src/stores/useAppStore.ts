import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { AppState, User, Task, AICoachSuggestion, ProductivityMetrics } from '@/types'

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
      setUser: (user) => set({ user }),
      
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
