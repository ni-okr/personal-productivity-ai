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

// 🧪 Unit тесты для обновленного useAppStore с Dependency Injection
import { setMockTaskAPI, useAppStore } from '@/stores/useAppStore'
import { act, renderHook } from '@testing-library/react'
import { MOCK_CONFIGS, TEST_CONFIGS } from '../framework'

// Mock TaskAPI для Dependency Injection
const mockTaskAPI = {
    getTasks: jest.fn(),
    createTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    completeTask: jest.fn(),
    getTasksStats: jest.fn(),
    syncTasks: jest.fn(),
    getProductivityMetrics: jest.fn(),
    getAISuggestions: jest.fn()
}

describe('useAppStore with Dependency Injection', () => {
    const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        avatar: undefined,
        subscriptionStatus: 'free' as const,
        subscriptionTier: 'free' as const,
        subscriptionExpiresAt: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
    }

    const mockTask = {
        id: 'test-task-id',
        title: 'Test Task',
        description: 'Test Description',
        priority: 'high' as const,
        status: 'pending' as const,
        dueDate: null,
        completedAt: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        userId: 'test-user-id',
        estimatedDuration: 60,
        actualDuration: null,
        tags: [],
        aiSuggestions: []
    }

    beforeEach(() => {
        // ОБЯЗАТЕЛЬНО: Настройка фреймворка
        testFramework.updateConfig(TEST_CONFIGS.UNIT)
        testMocks.updateConfig(MOCK_CONFIGS.MINIMAL)
        testMocks.setupAllMocks()
        testLogger.startTest('useAppStore with Dependency Injection')

        // Настройка mock API
        setMockTaskAPI(mockTaskAPI)

        // Сброс всех моков
        Object.values(mockTaskAPI).forEach(mock => mock.mockReset())
    })

    afterEach(() => {
        // ОБЯЗАТЕЛЬНО: Очистка
        testMocks.clearAllMocks()
        testLogger.endTest('useAppStore with Dependency Injection', true)

        // Очистка store
        act(() => {
            useAppStore.getState().clearUserData()
        })
    })

    describe('loadTasks', () => {
        test('should load tasks successfully', async () => {
            const mockTasks = [mockTask]
            mockTaskAPI.getTasks.mockResolvedValue({
                success: true,
                tasks: mockTasks,
                message: 'Tasks loaded successfully'
            })
            mockTaskAPI.getProductivityMetrics.mockResolvedValue(null)
            mockTaskAPI.getAISuggestions.mockResolvedValue(null)

            const { result } = renderHook(() => useAppStore())

            // Устанавливаем пользователя
            await act(async () => {
                result.current.setUser(mockUser)
            })
            await testUtils.waitForCondition(() => result.current.user !== null)

            // Загружаем задачи
            await act(async () => {
                await result.current.loadTasks()
            })

            await testUtils.waitForCondition(() => result.current.tasks.length > 0)

            expect(mockTaskAPI.getTasks).toHaveBeenCalledWith(mockUser.id)
            expect(result.current.tasks).toHaveLength(1)
            expect(result.current.tasks[0]).toEqual(mockTask)
            expect(result.current.isLoading).toBe(false)
            expect(result.current.error).toBeNull()
        })

        test('should handle load tasks error', async () => {
            mockTaskAPI.getTasks.mockResolvedValue({
                success: false,
                error: 'Failed to load tasks'
            })
            mockTaskAPI.getProductivityMetrics.mockResolvedValue(null)
            mockTaskAPI.getAISuggestions.mockResolvedValue(null)

            const { result } = renderHook(() => useAppStore())

            // Устанавливаем пользователя
            await act(async () => {
                result.current.setUser(mockUser)
            })
            await testUtils.waitForCondition(() => result.current.user !== null)

            // Загружаем задачи
            await act(async () => {
                await result.current.loadTasks()
            })

            await testUtils.waitForCondition(() => result.current.error !== null)

            expect(mockTaskAPI.getTasks).toHaveBeenCalledWith(mockUser.id)
            expect(result.current.tasks).toHaveLength(0)
            expect(result.current.error).toBe('Failed to load tasks')
            expect(result.current.isLoading).toBe(false)
        })
    })

    describe('createTaskAsync', () => {
        test('should create task successfully', async () => {
            const newTask = { ...mockTask, id: 'new-task-id' }
            mockTaskAPI.createTask.mockResolvedValue({
                success: true,
                task: newTask,
                message: 'Task created successfully'
            })

            const { result } = renderHook(() => useAppStore())

            // Устанавливаем пользователя
            await act(async () => {
                result.current.setUser(mockUser)
            })
            await testUtils.waitForCondition(() => result.current.user !== null)

            // Создаем задачу
            await act(async () => {
                await result.current.createTaskAsync({
                    title: 'New Task',
                    description: 'New Description',
                    priority: 'high'
                })
            })

            expect(mockTaskAPI.createTask).toHaveBeenCalledWith(mockUser.id, {
                title: 'New Task',
                description: 'New Description',
                priority: 'high'
            })
            expect(result.current.tasks).toHaveLength(1)
            expect(result.current.tasks[0]).toEqual(newTask)
            expect(result.current.isLoading).toBe(false)
            expect(result.current.error).toBeNull()
        })

        test('should handle create task error', async () => {
            mockTaskAPI.createTask.mockResolvedValue({
                success: false,
                error: 'Failed to create task'
            })

            const { result } = renderHook(() => useAppStore())

            // Устанавливаем пользователя
            await act(async () => {
                result.current.setUser(mockUser)
            })
            await testUtils.waitForCondition(() => result.current.user !== null)

            // Создаем задачу
            await act(async () => {
                await result.current.createTaskAsync({
                    title: 'New Task',
                    description: 'New Description',
                    priority: 'high'
                })
            })

            await testUtils.waitForCondition(() => result.current.error !== null)

            expect(mockTaskAPI.createTask).toHaveBeenCalledWith(mockUser.id, {
                title: 'New Task',
                description: 'New Description',
                priority: 'high'
            })
            expect(result.current.tasks).toHaveLength(0)
            expect(result.current.error).toBe('Failed to create task')
            expect(result.current.isLoading).toBe(false)
        })
    })

    describe('syncTasksAsync', () => {
        test('should sync tasks successfully', async () => {
            const mockTasks = [mockTask]
            mockTaskAPI.syncTasks.mockResolvedValue({
                success: true,
                tasks: mockTasks,
                message: 'Tasks synced successfully'
            })

            const { result } = renderHook(() => useAppStore())

            // Устанавливаем пользователя
            await act(async () => {
                result.current.setUser(mockUser)
            })
            await testUtils.waitForCondition(() => result.current.user !== null)

            // Синхронизируем задачи
            await act(async () => {
                await result.current.syncTasksAsync()
            })

            expect(mockTaskAPI.syncTasks).toHaveBeenCalledWith(mockUser.id)
            expect(result.current.tasks).toHaveLength(1)
            expect(result.current.tasks[0]).toEqual(mockTask)
            expect(result.current.isLoading).toBe(false)
            expect(result.current.error).toBeNull()
        })

        test('should handle sync tasks error', async () => {
            mockTaskAPI.syncTasks.mockResolvedValue({
                success: false,
                error: 'Failed to sync tasks'
            })

            const { result } = renderHook(() => useAppStore())

            // Устанавливаем пользователя
            await act(async () => {
                result.current.setUser(mockUser)
            })
            await testUtils.waitForCondition(() => result.current.user !== null)

            // Синхронизируем задачи
            await act(async () => {
                await result.current.syncTasksAsync()
            })

            await testUtils.waitForCondition(() => result.current.error !== null)

            expect(mockTaskAPI.syncTasks).toHaveBeenCalledWith(mockUser.id)
            expect(result.current.tasks).toHaveLength(0)
            expect(result.current.error).toBe('Failed to sync tasks')
            expect(result.current.isLoading).toBe(false)
        })
    })

    describe('loadTasksStats', () => {
        test('should load tasks stats successfully', async () => {
            const mockStats = {
                total: 5,
                completed: 3,
                pending: 2,
                overdue: 1,
                completionRate: 0.6,
                averageCompletionTime: 120
            }

            mockTaskAPI.getTasksStats.mockResolvedValue({
                success: true,
                stats: mockStats,
                message: 'Stats loaded successfully'
            })

            const { result } = renderHook(() => useAppStore())

            // Устанавливаем пользователя
            await act(async () => {
                result.current.setUser(mockUser)
            })
            await testUtils.waitForCondition(() => result.current.user !== null)

            // Загружаем статистику
            await act(async () => {
                await result.current.loadTasksStats()
            })

            await testUtils.waitForCondition(() => !result.current.isLoading)

            expect(mockTaskAPI.getTasksStats).toHaveBeenCalledWith(mockUser.id)
            // Stats are logged to console, not stored in state
        })

        test('should handle load stats error', async () => {
            mockTaskAPI.getTasksStats.mockResolvedValue({
                success: false,
                error: 'Failed to load stats'
            })

            const { result } = renderHook(() => useAppStore())

            // Устанавливаем пользователя
            await act(async () => {
                result.current.setUser(mockUser)
            })
            await testUtils.waitForCondition(() => result.current.user !== null)

            // Загружаем статистику
            await act(async () => {
                await result.current.loadTasksStats()
            })

            await testUtils.waitForCondition(() => !result.current.isLoading)

            expect(mockTaskAPI.getTasksStats).toHaveBeenCalledWith(mockUser.id)
            // Error is logged to console, not stored in state
        })
    })
})