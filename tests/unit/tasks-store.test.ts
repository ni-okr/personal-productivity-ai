import { testFramework, testLogger, testMocks, testUtils } from '../framework'

/**
 * 🧪 Мигрирован с помощью единого фреймворка тестирования
 * 
 * Автоматически мигрирован: 2025-09-16T21:33:45.023Z
 * Оригинальный файл сохранен как: tests/unit/tasks-store.test.ts.backup
 * 
 * ВАЖНО: Все новые тесты должны использовать единый фреймворк!
 * См. документацию: tests/docs/TESTING_FRAMEWORK.md
 */

// 🧪 Unit тесты для обновленного useAppStore с Supabase интеграцией
import * as tasksApi from '@/lib/tasks'
import * as tasksMockApi from '@/lib/tasks-mock'
import { useAppStore } from '@/stores/useAppStore'
import { act, renderHook } from '@testing-library/react'
import { TEST_CONFIGS, MOCK_CONFIGS } from '@/tests/framework'

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

// Mock tasks-mock API
jest.mock('@/lib/tasks-mock', () => ({
    mockGetTasks: jest.fn(),
    mockCreateTask: jest.fn(),
    mockUpdateTask: jest.fn(),
    mockDeleteTask: jest.fn(),
    mockCompleteTask: jest.fn(),
    mockGetProductivityMetrics: jest.fn(),
    mockGetAISuggestions: jest.fn()
}))

const mockTasksApi = tasksApi as jest.Mocked<typeof tasksApi>
const mockTasksMockApi = tasksMockApi as jest.Mocked<typeof tasksMockApi>

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
    // Настройка единого фреймворка тестирования
    testFramework.updateConfig(TEST_CONFIGS.UNIT)
    testMocks.updateConfig(MOCK_CONFIGS.MINIMAL)
    testMocks.setupAllMocks()
    testLogger.startTest('Test Suite')
        jest.clearAllMocks()
        // Устанавливаем mock режим для тестов
        process.env.NEXT_PUBLIC_DISABLE_EMAIL = 'true'
        // Reset store state
        testUtils.testUtils.act(() => {
            useAppStore.getState().clearUserData()
        })
    })

    afterEach(() => {
    testMocks.clearAllMocks()
    testLogger.endTest('Test Suite', true)
        // Восстанавливаем mock режим после каждого теста
        process.env.NEXT_PUBLIC_DISABLE_EMAIL = 'true'
    })

    describe('loadTasks', () => {
        it('должен успешно загрузить задачи', async () => {
            mockTasksMockApi.mockGetTasks.mockResolvedValue({
                success: true,
                tasks: [mockTask]
            })
            mockTasksMockApi.mockGetProductivityMetrics.mockResolvedValue(null)
            mockTasksMockApi.mockGetAISuggestions.mockResolvedValue(null)

            const { result } = testUtils.renderHook(() => useAppStore())

            testUtils.testUtils.act(() => {
                result.current.setUser(mockUser)
            })

            await testUtils.testUtils.act(async () => {
                await result.current.loadTasks()
            })

            expect(mockTasksMockApi.mockGetTasks).toHaveBeenCalledWith(mockUser.id)
            expect(result.current.tasks).toHaveLength(1)
            expect(result.current.tasks[0]).toEqual(mockTask)
            expect(result.current.isLoading).toBe(false)
            expect(result.current.error).toBeNull()
        })

        it('должен обработать ошибку загрузки задач', async () => {
            mockTasksMockApi.mockGetTasks.mockResolvedValue({
                success: false,
                error: 'Failed to load tasks'
            })
            mockTasksMockApi.mockGetProductivityMetrics.mockResolvedValue(null)
            mockTasksMockApi.mockGetAISuggestions.mockResolvedValue(null)

            const { result } = testUtils.renderHook(() => useAppStore())

            testUtils.testUtils.act(() => {
                result.current.setUser(mockUser)
            })

            await testUtils.testUtils.act(async () => {
                await result.current.loadTasks()
            })

            expect(result.current.tasks).toHaveLength(0)
            expect(result.current.error).toBe('Failed to load tasks')
            expect(result.current.isLoading).toBe(false)
        })

        it('не должен загружать задачи без пользователя', async () => {
            const { result } = testUtils.renderHook(() => useAppStore())

            await testUtils.testUtils.act(async () => {
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

            mockTasksMockApi.mockCreateTask.mockResolvedValue({
                success: true,
                task: mockTask
            })

            const { result } = testUtils.renderHook(() => useAppStore())

            testUtils.testUtils.act(() => {
                result.current.setUser(mockUser)
            })

            await testUtils.testUtils.act(async () => {
                await result.current.createTaskAsync(taskData)
            })

            expect(mockTasksMockApi.mockCreateTask).toHaveBeenCalledWith(mockUser.id, taskData)
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

            mockTasksMockApi.mockCreateTask.mockResolvedValue({
                success: false,
                error: 'Failed to create task'
            })

            const { result } = testUtils.renderHook(() => useAppStore())

            // Устанавливаем пользователя без автоматической загрузки задач
            testUtils.testUtils.act(() => {
                result.current.setUser(mockUser)
            })

            // Ждем завершения автоматической загрузки задач
            await testUtils.testUtils.act(async () => {
                await new Promise(resolve => setTimeout(resolve, 10))
            })

            // Очищаем ошибку от loadTasks
            testUtils.testUtils.act(() => {
                result.current.setError(null)
            })

            await testUtils.testUtils.act(async () => {
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

            const { result } = testUtils.renderHook(() => useAppStore())

            await testUtils.testUtils.act(async () => {
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

            mockTasksMockApi.mockUpdateTask.mockResolvedValue({
                success: true,
                task: updatedTask
            })

            const { result } = testUtils.renderHook(() => useAppStore())

            testUtils.testUtils.act(() => {
                result.current.setTasks([mockTask])
            })

            await testUtils.testUtils.act(async () => {
                await result.current.updateTaskAsync(mockTask.id, updates)
            })

            expect(mockTasksMockApi.mockUpdateTask).toHaveBeenCalledWith(mockTask.id, updates)
            expect(result.current.tasks[0]).toEqual(updatedTask)
            expect(result.current.isLoading).toBe(false)
            expect(result.current.error).toBeNull()
        })

        it('должен обработать ошибку обновления задачи', async () => {
            const updates = {
                title: 'Updated Task'
            }

            mockTasksMockApi.mockUpdateTask.mockResolvedValue({
                success: false,
                error: 'Задача не найдена'
            })

            const { result } = testUtils.renderHook(() => useAppStore())

            testUtils.testUtils.act(() => {
                result.current.setTasks([mockTask])
            })

            await testUtils.testUtils.act(async () => {
                await result.current.updateTaskAsync(mockTask.id, updates)
            })

            expect(result.current.tasks[0]).toEqual(mockTask) // Task should remain unchanged
            expect(result.current.error).toBe('Задача не найдена')
            expect(result.current.isLoading).toBe(false)
        })
    })

    describe('deleteTaskAsync', () => {
        it('должен успешно удалить задачу', async () => {
            mockTasksMockApi.mockDeleteTask.mockResolvedValue({
                success: true,
                message: 'Task deleted'
            })

            const { result } = testUtils.renderHook(() => useAppStore())

            testUtils.testUtils.act(() => {
                result.current.setTasks([mockTask])
            })

            await testUtils.testUtils.act(async () => {
                await result.current.deleteTaskAsync(mockTask.id)
            })

            expect(mockTasksMockApi.mockDeleteTask).toHaveBeenCalledWith(mockTask.id)
            expect(result.current.tasks).toHaveLength(0)
            expect(result.current.isLoading).toBe(false)
            expect(result.current.error).toBeNull()
        })

        it('должен обработать ошибку удаления задачи', async () => {
            mockTasksMockApi.mockDeleteTask.mockResolvedValue({
                success: false,
                error: 'Задача не найдена'
            })

            const { result } = testUtils.renderHook(() => useAppStore())

            testUtils.testUtils.act(() => {
                result.current.setTasks([mockTask])
            })

            await testUtils.testUtils.act(async () => {
                await result.current.deleteTaskAsync(mockTask.id)
            })

            expect(result.current.tasks).toHaveLength(1) // Task should remain
            expect(result.current.error).toBe('Задача не найдена')
            expect(result.current.isLoading).toBe(false)
        })
    })

    describe('completeTaskAsync', () => {
        it('должен успешно завершить задачу', async () => {
            const completedTask = { ...mockTask, status: 'completed' as const, actualMinutes: 25, source: 'manual' as const, userId: 'test-user-id' }

            mockTasksMockApi.mockCompleteTask.mockResolvedValue({
                success: true,
                task: completedTask
            })

            const { result } = testUtils.renderHook(() => useAppStore())

            testUtils.testUtils.act(() => {
                result.current.setTasks([mockTask])
            })

            await testUtils.testUtils.act(async () => {
                await result.current.completeTaskAsync(mockTask.id, 25)
            })

            expect(mockTasksMockApi.mockCompleteTask).toHaveBeenCalledWith(mockTask.id, 25)
            expect(result.current.tasks[0]).toEqual(completedTask)
            expect(result.current.isLoading).toBe(false)
            expect(result.current.error).toBeNull()
        })

        it('должен обработать ошибку завершения задачи', async () => {
            mockTasksMockApi.mockCompleteTask.mockResolvedValue({
                success: false,
                error: 'Задача не найдена'
            })

            const { result } = testUtils.renderHook(() => useAppStore())

            testUtils.testUtils.act(() => {
                result.current.setTasks([mockTask])
            })

            await testUtils.testUtils.act(async () => {
                await result.current.completeTaskAsync(mockTask.id)
            })

            expect(result.current.tasks[0]).toEqual(mockTask) // Task should remain unchanged
            expect(result.current.error).toBe('Задача не найдена')
            expect(result.current.isLoading).toBe(false)
        })
    })

    describe('syncTasksAsync', () => {
        it('должен успешно синхронизировать задачи', async () => {
            mockTasksApi.syncTasks.mockResolvedValue({
                success: true,
                tasks: [mockTask]
            })

            const { result } = testUtils.renderHook(() => useAppStore())

            testUtils.testUtils.act(() => {
                result.current.setUser(mockUser)
            })

            // Ждем завершения автоматической загрузки задач
            await testUtils.testUtils.act(async () => {
                await new Promise(resolve => setTimeout(resolve, 10))
            })

            // Очищаем ошибку от loadTasks
            testUtils.testUtils.act(() => {
                result.current.setError(null)
            })

            await testUtils.testUtils.act(async () => {
                await result.current.syncTasksAsync()
            })

            expect(mockTasksApi.syncTasks).toHaveBeenCalledWith(mockUser.id)
            expect(result.current.tasks).toHaveLength(1)
            expect(result.current.tasks[0]).toEqual(mockTask)
            expect(result.current.isLoading).toBe(false)
            expect(result.current.error).toBeNull()
        })

        it('должен обработать ошибку синхронизации', async () => {
            // Отключаем mock режим для этого теста
            process.env.NEXT_PUBLIC_DISABLE_EMAIL = 'false'

            mockTasksApi.syncTasks.mockResolvedValue({
                success: false,
                error: 'Failed to sync tasks'
            })

            const { result } = testUtils.renderHook(() => useAppStore())

            // Устанавливаем пользователя напрямую в store без автоматической загрузки
            testUtils.testUtils.act(() => {
                result.current.setUser(mockUser)
            })

            // Ждем завершения автоматической загрузки задач
            await testUtils.testUtils.act(async () => {
                await new Promise(resolve => setTimeout(resolve, 10))
            })

            // Очищаем ошибку от loadTasks
            testUtils.testUtils.act(() => {
                result.current.setError(null)
            })

            await testUtils.testUtils.act(async () => {
                await result.current.syncTasksAsync()
            })

            expect(result.current.tasks).toHaveLength(0)
            expect(result.current.error).toBe('Failed to sync tasks')
            expect(result.current.isLoading).toBe(false)

            // Включаем mock режим обратно
            process.env.NEXT_PUBLIC_DISABLE_EMAIL = 'true'
        })

        it('не должен синхронизировать без пользователя', async () => {
            const { result } = testUtils.renderHook(() => useAppStore())

            await testUtils.testUtils.act(async () => {
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
                stats: {
                    ...mockStats,
                    averageCompletionTime: 25
                }
            })

            const { result } = testUtils.renderHook(() => useAppStore())

            testUtils.testUtils.act(() => {
                result.current.setUser(mockUser)
            })

            await testUtils.testUtils.act(async () => {
                await result.current.loadTasksStats()
            })

            expect(mockTasksApi.getTasksStats).toHaveBeenCalledWith(mockUser.id)
            // Stats are logged to console, not stored in state
        })

        it('не должен загружать статистику без пользователя', async () => {
            const { result } = testUtils.renderHook(() => useAppStore())

            await testUtils.testUtils.act(async () => {
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

            const { result } = testUtils.renderHook(() => useAppStore())

            testUtils.testUtils.act(() => {
                result.current.setUser(mockUser)
            })

            testUtils.testUtils.act(() => {
                result.current.loadTasks()
            })

            expect(result.current.isLoading).toBe(true)

            await testUtils.testUtils.act(async () => {
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
