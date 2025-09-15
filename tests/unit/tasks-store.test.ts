// 🧪 Unit тесты для обновленного useAppStore с Supabase интеграцией
import * as tasksApi from '@/lib/tasks'
import { useAppStore } from '@/stores/useAppStore'
import { act, renderHook } from '@testing-library/react'

// Mock tasks API
jest.mock('@/lib/tasks', () => ({
    getTasks: jest.fn(),
    createTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    completeTask: jest.fn(),
    getTasksStats: jest.fn(),
    syncTasks: jest.fn()
}))

const mockTasksApi = tasksApi as jest.Mocked<typeof tasksApi>

describe('useAppStore with Supabase integration', () => {
    const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        avatar: undefined,
        timezone: 'Europe/Moscow',
        subscription: 'free' as const,
        subscriptionStatus: 'active' as const,
        preferences: {
            workingHours: { start: '09:00', end: '18:00' },
            focusTime: 25,
            breakTime: 5,
            notifications: { email: true, push: true, desktop: true },
            aiCoaching: { enabled: true, frequency: 'medium' as const, style: 'gentle' as const }
        },
        createdAt: new Date(),
        updatedAt: new Date()
    }

    const mockTask = {
        id: 'test-task-id',
        title: 'Test Task',
        description: 'Test Description',
        priority: 'high' as const,
        status: 'todo' as const,
        dueDate: new Date('2024-01-01'),
        completedAt: undefined,
        estimatedMinutes: 30,
        actualMinutes: undefined,
        source: 'manual' as const,
        userId: 'test-user-id',
        tags: ['work'],
        createdAt: new Date(),
        updatedAt: new Date()
    }

    beforeEach(() => {
        jest.clearAllMocks()
        // Reset store state
        act(() => {
            useAppStore.getState().clearUserData()
        })
    })

    describe('loadTasks', () => {
        it('должен успешно загрузить задачи', async () => {
            mockTasksApi.getTasks.mockResolvedValue({
                success: true,
                tasks: [mockTask]
            })

            const { result } = renderHook(() => useAppStore())

            act(() => {
                result.current.setUser(mockUser)
            })

            await act(async () => {
                await result.current.loadTasks()
            })

            expect(mockTasksApi.getTasks).toHaveBeenCalledWith(mockUser.id)
            expect(result.current.tasks).toHaveLength(1)
            expect(result.current.tasks[0]).toEqual(mockTask)
            expect(result.current.isLoading).toBe(false)
            expect(result.current.error).toBeNull()
        })

        it('должен обработать ошибку загрузки задач', async () => {
            mockTasksApi.getTasks.mockResolvedValue({
                success: false,
                error: 'Failed to load tasks'
            })

            const { result } = renderHook(() => useAppStore())

            act(() => {
                result.current.setUser(mockUser)
            })

            await act(async () => {
                await result.current.loadTasks()
            })

            expect(result.current.tasks).toHaveLength(0)
            expect(result.current.error).toBe('Failed to load tasks')
            expect(result.current.isLoading).toBe(false)
        })

        it('не должен загружать задачи без пользователя', async () => {
            const { result } = renderHook(() => useAppStore())

            await act(async () => {
                await result.current.loadTasks()
            })

            expect(mockTasksApi.getTasks).not.toHaveBeenCalled()
        })
    })

    describe('createTaskAsync', () => {
        it('должен успешно создать задачу', async () => {
            const taskData = {
                title: 'New Task',
                description: 'New Description',
                priority: 'medium' as const,
                estimatedMinutes: 60,
                tags: ['personal']
            }

            mockTasksApi.createTask.mockResolvedValue({
                success: true,
                task: mockTask
            })

            const { result } = renderHook(() => useAppStore())

            act(() => {
                result.current.setUser(mockUser)
            })

            await act(async () => {
                await result.current.createTaskAsync(taskData)
            })

            expect(mockTasksApi.createTask).toHaveBeenCalledWith(mockUser.id, taskData)
            expect(result.current.tasks).toHaveLength(1)
            expect(result.current.tasks[0]).toEqual(mockTask)
            expect(result.current.isLoading).toBe(false)
            expect(result.current.error).toBeNull()
        })

        it('должен обработать ошибку создания задачи', async () => {
            const taskData = {
                title: 'New Task',
                description: 'New Description',
                priority: 'medium' as const,
                estimatedMinutes: 60,
                tags: ['personal']
            }

            mockTasksApi.createTask.mockResolvedValue({
                success: false,
                error: 'Failed to create task'
            })

            const { result } = renderHook(() => useAppStore())

            act(() => {
                result.current.setUser(mockUser)
            })

            await act(async () => {
                await result.current.createTaskAsync(taskData)
            })

            expect(result.current.tasks).toHaveLength(0)
            expect(result.current.error).toBe('Failed to create task')
            expect(result.current.isLoading).toBe(false)
        })

        it('не должен создавать задачу без пользователя', async () => {
            const taskData = {
                title: 'New Task',
                description: 'New Description',
                priority: 'medium' as const,
                estimatedMinutes: 60,
                tags: ['personal']
            }

            const { result } = renderHook(() => useAppStore())

            await act(async () => {
                await result.current.createTaskAsync(taskData)
            })

            expect(mockTasksApi.createTask).not.toHaveBeenCalled()
        })
    })

    describe('updateTaskAsync', () => {
        it('должен успешно обновить задачу', async () => {
            const updates = {
                title: 'Updated Task',
                priority: 'urgent' as const
            }

            const updatedTask = { ...mockTask, title: 'Updated Task', priority: 'urgent' as const, source: 'manual' as const, userId: 'test-user-id' }

            mockTasksApi.updateTask.mockResolvedValue({
                success: true,
                task: updatedTask
            })

            const { result } = renderHook(() => useAppStore())

            act(() => {
                result.current.setTasks([mockTask])
            })

            await act(async () => {
                await result.current.updateTaskAsync(mockTask.id, updates)
            })

            expect(mockTasksApi.updateTask).toHaveBeenCalledWith(mockTask.id, updates)
            expect(result.current.tasks[0]).toEqual(updatedTask)
            expect(result.current.isLoading).toBe(false)
            expect(result.current.error).toBeNull()
        })

        it('должен обработать ошибку обновления задачи', async () => {
            const updates = {
                title: 'Updated Task'
            }

            mockTasksApi.updateTask.mockResolvedValue({
                success: false,
                error: 'Failed to update task'
            })

            const { result } = renderHook(() => useAppStore())

            act(() => {
                result.current.setTasks([mockTask])
            })

            await act(async () => {
                await result.current.updateTaskAsync(mockTask.id, updates)
            })

            expect(result.current.tasks[0]).toEqual(mockTask) // Task should remain unchanged
            expect(result.current.error).toBe('Failed to update task')
            expect(result.current.isLoading).toBe(false)
        })
    })

    describe('deleteTaskAsync', () => {
        it('должен успешно удалить задачу', async () => {
            mockTasksApi.deleteTask.mockResolvedValue({
                success: true,
                message: 'Task deleted'
            })

            const { result } = renderHook(() => useAppStore())

            act(() => {
                result.current.setTasks([mockTask])
            })

            await act(async () => {
                await result.current.deleteTaskAsync(mockTask.id)
            })

            expect(mockTasksApi.deleteTask).toHaveBeenCalledWith(mockTask.id)
            expect(result.current.tasks).toHaveLength(0)
            expect(result.current.isLoading).toBe(false)
            expect(result.current.error).toBeNull()
        })

        it('должен обработать ошибку удаления задачи', async () => {
            mockTasksApi.deleteTask.mockResolvedValue({
                success: false,
                error: 'Failed to delete task'
            })

            const { result } = renderHook(() => useAppStore())

            act(() => {
                result.current.setTasks([mockTask])
            })

            await act(async () => {
                await result.current.deleteTaskAsync(mockTask.id)
            })

            expect(result.current.tasks).toHaveLength(1) // Task should remain
            expect(result.current.error).toBe('Failed to delete task')
            expect(result.current.isLoading).toBe(false)
        })
    })

    describe('completeTaskAsync', () => {
        it('должен успешно завершить задачу', async () => {
            const completedTask = { ...mockTask, status: 'completed' as const, actualMinutes: 25, source: 'manual' as const, userId: 'test-user-id' }

            mockTasksApi.completeTask.mockResolvedValue({
                success: true,
                task: completedTask
            })

            const { result } = renderHook(() => useAppStore())

            act(() => {
                result.current.setTasks([mockTask])
            })

            await act(async () => {
                await result.current.completeTaskAsync(mockTask.id, 25)
            })

            expect(mockTasksApi.completeTask).toHaveBeenCalledWith(mockTask.id, 25)
            expect(result.current.tasks[0]).toEqual(completedTask)
            expect(result.current.isLoading).toBe(false)
            expect(result.current.error).toBeNull()
        })

        it('должен обработать ошибку завершения задачи', async () => {
            mockTasksApi.completeTask.mockResolvedValue({
                success: false,
                error: 'Failed to complete task'
            })

            const { result } = renderHook(() => useAppStore())

            act(() => {
                result.current.setTasks([mockTask])
            })

            await act(async () => {
                await result.current.completeTaskAsync(mockTask.id)
            })

            expect(result.current.tasks[0]).toEqual(mockTask) // Task should remain unchanged
            expect(result.current.error).toBe('Failed to complete task')
            expect(result.current.isLoading).toBe(false)
        })
    })

    describe('syncTasksAsync', () => {
        it('должен успешно синхронизировать задачи', async () => {
            mockTasksApi.syncTasks.mockResolvedValue({
                success: true,
                tasks: [mockTask]
            })

            const { result } = renderHook(() => useAppStore())

            act(() => {
                result.current.setUser(mockUser)
            })

            await act(async () => {
                await result.current.syncTasksAsync()
            })

            expect(mockTasksApi.syncTasks).toHaveBeenCalledWith(mockUser.id)
            expect(result.current.tasks).toHaveLength(1)
            expect(result.current.tasks[0]).toEqual(mockTask)
            expect(result.current.isLoading).toBe(false)
            expect(result.current.error).toBeNull()
        })

        it('должен обработать ошибку синхронизации', async () => {
            mockTasksApi.syncTasks.mockResolvedValue({
                success: false,
                error: 'Failed to sync tasks'
            })

            const { result } = renderHook(() => useAppStore())

            act(() => {
                result.current.setUser(mockUser)
            })

            await act(async () => {
                await result.current.syncTasksAsync()
            })

            expect(result.current.tasks).toHaveLength(0)
            expect(result.current.error).toBe('Failed to sync tasks')
            expect(result.current.isLoading).toBe(false)
        })

        it('не должен синхронизировать без пользователя', async () => {
            const { result } = renderHook(() => useAppStore())

            await act(async () => {
                await result.current.syncTasksAsync()
            })

            expect(mockTasksApi.syncTasks).not.toHaveBeenCalled()
        })
    })

    describe('loadTasksStats', () => {
        it('должен успешно загрузить статистику задач', async () => {
            const mockStats = {
                total: 10,
                completed: 7,
                pending: 3,
                overdue: 1,
                completionRate: 70
            }

            mockTasksApi.getTasksStats.mockResolvedValue({
                success: true,
                stats: mockStats
            })

            const { result } = renderHook(() => useAppStore())

            act(() => {
                result.current.setUser(mockUser)
            })

            await act(async () => {
                await result.current.loadTasksStats()
            })

            expect(mockTasksApi.getTasksStats).toHaveBeenCalledWith(mockUser.id)
            // Stats are logged to console, not stored in state
        })

        it('не должен загружать статистику без пользователя', async () => {
            const { result } = renderHook(() => useAppStore())

            await act(async () => {
                await result.current.loadTasksStats()
            })

            expect(mockTasksApi.getTasksStats).not.toHaveBeenCalled()
        })
    })

    describe('Loading states', () => {
        it('должен устанавливать loading состояние во время операций', async () => {
            let resolvePromise: (value: any) => void
            const promise = new Promise(resolve => {
                resolvePromise = resolve
            })

            mockTasksApi.getTasks.mockReturnValue(promise as any)

            const { result } = renderHook(() => useAppStore())

            act(() => {
                result.current.setUser(mockUser)
            })

            act(() => {
                result.current.loadTasks()
            })

            expect(result.current.isLoading).toBe(true)

            await act(async () => {
                resolvePromise!({
                    success: true,
                    tasks: []
                })
                await promise
            })

            expect(result.current.isLoading).toBe(false)
        })
    })
})
