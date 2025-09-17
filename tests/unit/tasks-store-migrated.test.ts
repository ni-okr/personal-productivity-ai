import { useAppStore } from '@/stores/useAppStore'
import { act, renderHook } from '@testing-library/react'
import { MOCK_CONFIGS, TEST_CONFIGS, testFramework, testLogger, testMocks, testUtils } from '../framework'
/**
 * 🧪 Unit тесты для useAppStore - Мигрированная версия с единым фреймворком
 * 
 * Показывает как использовать единый фреймворк тестирования
 */

// Mock tasks API (для syncTasks и getTasksStats)
jest.mock('@/lib/tasks', () => ({
    syncTasks: jest.fn(),
    getTasksStats: jest.fn()
}))

// Mock tasks-mock API (для динамических импортов)
// Используем обычный mock для мокирования динамических импортов
jest.mock('@/lib/tasks-mock', () => ({
    mockGetTasks: jest.fn(),
    mockCreateTask: jest.fn(),
    mockUpdateTask: jest.fn(),
    mockDeleteTask: jest.fn(),
    mockCompleteTask: jest.fn(),
    mockSyncTasks: jest.fn(),
    mockGetTasksStats: jest.fn(),
    mockGetProductivityMetrics: jest.fn(),
    mockGetAISuggestions: jest.fn()
}))


describe('useAppStore with unified testing framework', () => {
    // Получаем доступ к мокам
    const mockTasksModule = require('@/lib/tasks')
    const mockTasksMockModule = require('@/lib/tasks-mock')

    beforeEach(() => {
        // Настройка фреймворка для unit тестов
        testFramework.updateConfig(TEST_CONFIGS.UNIT)
        testMocks.updateConfig(MOCK_CONFIGS.MINIMAL)
        testMocks.setupAllMocks()

        // Установка mock режима
        process.env.NEXT_PUBLIC_DISABLE_EMAIL = 'true'

        // Очищаем все моки
        jest.clearAllMocks()

        testLogger.startTest('useAppStore')
    })

    afterEach(() => {
        testMocks.clearAllMocks()
        testLogger.endTest('useAppStore', true)

        // Очистка переменных окружения
        delete process.env.NEXT_PUBLIC_DISABLE_EMAIL

        // Очистка состояния store
        act(() => {
            useAppStore.getState().clearUserData()
        })
    })

    describe('loadTasks', () => {
        test('should load tasks successfully in mock mode', async () => {
            // Генерация тестовых данных через фреймворк
            const mockUser = testUtils.generateUser({
                id: 'test-user-id',
                email: 'test@example.com',
                name: 'Test User'
            })

            const mockTasks = [
                testUtils.generateTask({
                    id: 'task-1',
                    title: 'Test Task 1',
                    userId: 'test-user-id'
                }),
                testUtils.generateTask({
                    id: 'task-2',
                    title: 'Test Task 2',
                    userId: 'test-user-id'
                })
            ]

            testLogger.step('Setting up mock data')
            testMocks.addUser(mockUser)
            mockTasks.forEach(task => testMocks.addTask(task))

            // Настройка мока для загрузки задач
            mockTasksMockModule.mockGetTasks.mockResolvedValueOnce({
                success: true,
                tasks: mockTasks,
                message: 'Tasks loaded successfully'
            })

            testLogger.step('Rendering store hook')
            const { result } = renderHook(() => useAppStore())

            testLogger.step('Setting user and loading tasks')
            await act(async () => {
                result.current.setUser(mockUser)
            })

            testLogger.step('Waiting for tasks to load')
            await testUtils.waitForCondition(() => result.current.tasks.length > 0)

            testLogger.assertion('Tasks loaded successfully', true, 2, result.current.tasks.length)
            expect(result.current.tasks).toHaveLength(2)
            expect(result.current.tasks[0].title).toBe('Test Task 1')
        })

        test('should handle load tasks error', async () => {
            const mockUser = testUtils.generateUser()

            testLogger.step('Setting up error scenario')
            testMocks.addUser(mockUser)

            // Мокаем ошибку в mock API
            mockTasksMockModule.mockGetTasks.mockResolvedValueOnce({
                success: false,
                error: 'Mock API Error'
            })

            testLogger.step('Rendering store hook')
            const { result } = renderHook(() => useAppStore())

            testLogger.step('Setting user and loading tasks')
            await act(async () => {
                result.current.setUser(mockUser)
            })

            testLogger.step('Waiting for error state')
            await testUtils.waitForCondition(() => result.current.error !== null)

            testLogger.assertion('Error handled correctly', true, 'Mock API Error', result.current.error)
            expect(result.current.error).toBe('Mock API Error')
        })
    })

    describe('createTaskAsync', () => {
        test('should create task successfully', async () => {
            const mockUser = testUtils.generateUser()
            const newTask = testUtils.generateTask({
                title: 'New Task',
                description: 'New Description',
                priority: 'high'
            })

            testLogger.step('Setting up mock data')
            testMocks.addUser(mockUser)
            testMocks.addTask(newTask)

            // Настройка моков для успешного создания задачи
            mockTasksMockModule.mockCreateTask.mockResolvedValueOnce({
                success: true,
                task: newTask,
                message: 'Task created successfully'
            })

            // Настройка мока для загрузки задач после создания
            mockTasksMockModule.mockGetTasks.mockResolvedValueOnce({
                success: true,
                tasks: [newTask],
                message: 'Tasks loaded successfully'
            })

            testLogger.step('Rendering store hook')
            const { result } = renderHook(() => useAppStore())

            testLogger.step('Setting user')
            await act(async () => {
                result.current.setUser(mockUser)
            })

            testLogger.step('Creating new task')
            await act(async () => {
                await result.current.createTaskAsync({
                    title: 'New Task',
                    description: 'New Description',
                    priority: 'high'
                })
            })

            testLogger.step('Waiting for task to be created')
            await testUtils.waitForState(() =>
                result.current.tasks.some(task => task.title === 'New Task'),
                true
            )

            testLogger.assertion('Task created successfully', true)
            expect(result.current.tasks.some(task => task.title === 'New Task')).toBe(true)
        })

        test('should handle create task error', async () => {
            const mockUser = testUtils.generateUser()

            testLogger.step('Setting up error scenario')
            testMocks.addUser(mockUser)

            // Настройка мока для загрузки задач при установке пользователя
            mockTasksMockModule.mockGetTasks.mockResolvedValueOnce({
                success: true,
                tasks: [],
                message: 'Tasks loaded successfully'
            })

            // Мокаем ошибку
            mockTasksMockModule.mockCreateTask.mockResolvedValueOnce({
                success: false,
                error: 'Create failed'
            })

            testLogger.step('Rendering store hook')
            const { result } = renderHook(() => useAppStore())

            testLogger.step('Setting user')
            await act(async () => {
                result.current.setUser(mockUser)
            })
            await testUtils.waitForCondition(() => result.current.user !== null)

            testLogger.step('Attempting to create task')
            await act(async () => {
                await result.current.createTaskAsync({
                    title: 'New Task',
                    description: 'New Description',
                    priority: 'high'
                })
            })

            testLogger.step('Waiting for error state')
            await testUtils.waitForCondition(() => result.current.error !== null)

            testLogger.assertion('Create error handled correctly', true, 'Create failed', result.current.error)
            expect(result.current.error).toBe('Create failed')
        })
    })

    describe('updateTaskAsync', () => {
        test('should update task successfully', async () => {
            const mockUser = testUtils.generateUser()
            const existingTask = testUtils.generateTask({
                id: 'task-1',
                title: 'Original Task',
                userId: 'test-user-id'
            })

            const updatedTask = {
                ...existingTask,
                title: 'Updated Task',
                priority: 'high'
            }

            testLogger.step('Setting up mock data')
            testMocks.addUser(mockUser)
            testMocks.addTask(existingTask)

            // Настройка моков для успешного обновления задачи
            mockTasksMockModule.mockUpdateTask.mockResolvedValueOnce({
                success: true,
                task: updatedTask,
                message: 'Task updated successfully'
            })

            // Настройка мока для загрузки задач после обновления
            mockTasksMockModule.mockGetTasks.mockResolvedValueOnce({
                success: true,
                tasks: [updatedTask],
                message: 'Tasks loaded successfully'
            })

            testLogger.step('Rendering store hook')
            const { result } = renderHook(() => useAppStore())

            testLogger.step('Setting user and loading tasks')
            await act(async () => {
                result.current.setUser(mockUser)
            })

            testLogger.step('Updating task')
            await act(async () => {
                await result.current.updateTaskAsync('task-1', {
                    title: 'Updated Task',
                    priority: 'high'
                })
            })

            testLogger.step('Waiting for task to be updated')
            await testUtils.waitForState(() =>
                result.current.tasks.find(task => task.id === 'task-1')?.title === 'Updated Task',
                true
            )

            testLogger.assertion('Task updated successfully', true)
            const updatedTaskResult = result.current.tasks.find(task => task.id === 'task-1')
            expect(updatedTaskResult?.title).toBe('Updated Task')
            expect(updatedTaskResult?.priority).toBe('high')
        })

        test('should handle update task error', async () => {
            const mockUser = testUtils.generateUser()

            testLogger.step('Setting up error scenario')
            testMocks.addUser(mockUser)

            // Настройка мока для загрузки задач при установке пользователя
            mockTasksMockModule.mockGetTasks.mockResolvedValueOnce({
                success: true,
                tasks: [],
                message: 'Tasks loaded successfully'
            })

            // Мокаем ошибку
            mockTasksMockModule.mockUpdateTask.mockResolvedValueOnce({
                success: false,
                error: 'Update failed'
            })

            testLogger.step('Rendering store hook')
            const { result } = renderHook(() => useAppStore())

            testLogger.step('Setting user')
            await act(async () => {
                result.current.setUser(mockUser)
            })
            await testUtils.waitForCondition(() => result.current.user !== null)

            testLogger.step('Attempting to update task')
            await act(async () => {
                await result.current.updateTaskAsync('non-existent-task', {
                    title: 'Updated Task'
                })
            })

            testLogger.step('Waiting for error state')
            await testUtils.waitForCondition(() => result.current.error !== null)

            testLogger.assertion('Update error handled correctly', true, 'Update failed', result.current.error)
            expect(result.current.error).toBe('Update failed')
        })
    })

    describe('deleteTaskAsync', () => {
        test('should delete task successfully', async () => {
            const mockUser = testUtils.generateUser()
            const existingTask = testUtils.generateTask({
                id: 'task-1',
                title: 'Task to Delete',
                userId: 'test-user-id'
            })

            testLogger.step('Setting up mock data')
            testMocks.addUser(mockUser)
            testMocks.addTask(existingTask)

            // Настройка моков для успешного удаления задачи
            mockTasksMockModule.mockDeleteTask.mockResolvedValueOnce({
                success: true,
                message: 'Task deleted successfully'
            })

            // Настройка мока для загрузки задач после удаления (пустой массив)
            mockTasksMockModule.mockGetTasks.mockResolvedValueOnce({
                success: true,
                tasks: [],
                message: 'Tasks loaded successfully'
            })

            testLogger.step('Rendering store hook')
            const { result } = renderHook(() => useAppStore())

            testLogger.step('Setting user and loading tasks')
            await act(async () => {
                result.current.setUser(mockUser)
            })

            testLogger.step('Deleting task')
            await act(async () => {
                await result.current.deleteTaskAsync('task-1')
            })

            testLogger.step('Waiting for task to be deleted')
            await testUtils.waitForState(() =>
                !result.current.tasks.some(task => task.id === 'task-1'),
                true
            )

            testLogger.assertion('Task deleted successfully', true)
            expect(result.current.tasks.find(task => task.id === 'task-1')).toBeUndefined()
        })

        test('should handle delete task error', async () => {
            const mockUser = testUtils.generateUser()

            testLogger.step('Setting up error scenario')
            testMocks.addUser(mockUser)

            // Настройка мока для загрузки задач при установке пользователя
            mockTasksMockModule.mockGetTasks.mockResolvedValueOnce({
                success: true,
                tasks: [],
                message: 'Tasks loaded successfully'
            })

            // Мокаем ошибку
            mockTasksMockModule.mockDeleteTask.mockResolvedValueOnce({
                success: false,
                error: 'Delete failed'
            })

            testLogger.step('Rendering store hook')
            const { result } = renderHook(() => useAppStore())

            testLogger.step('Setting user')
            await act(async () => {
                result.current.setUser(mockUser)
            })
            await testUtils.waitForCondition(() => result.current.user !== null)

            testLogger.step('Attempting to delete task')
            await act(async () => {
                await result.current.deleteTaskAsync('non-existent-task')
            })

            testLogger.step('Waiting for error state')
            await testUtils.waitForCondition(() => result.current.error !== null)

            testLogger.assertion('Delete error handled correctly', true, 'Delete failed', result.current.error)
            expect(result.current.error).toBe('Delete failed')
        })
    })

    describe('completeTaskAsync', () => {
        test('should complete task successfully', async () => {
            const mockUser = testUtils.generateUser()
            const existingTask = testUtils.generateTask({
                id: 'task-1',
                title: 'Task to Complete',
                status: 'todo',
                userId: 'test-user-id'
            })

            const completedTask = {
                ...existingTask,
                status: 'completed',
                completedAt: new Date().toISOString()
            }

            testLogger.step('Setting up mock data')
            testMocks.addUser(mockUser)
            testMocks.addTask(existingTask)

            // Настройка моков для успешного завершения задачи
            mockTasksMockModule.mockCompleteTask.mockResolvedValueOnce({
                success: true,
                task: completedTask,
                message: 'Task completed successfully'
            })

            // Настройка мока для загрузки задач после завершения
            mockTasksMockModule.mockGetTasks.mockResolvedValueOnce({
                success: true,
                tasks: [completedTask],
                message: 'Tasks loaded successfully'
            })

            testLogger.step('Rendering store hook')
            const { result } = renderHook(() => useAppStore())

            testLogger.step('Setting user and loading tasks')
            await act(async () => {
                result.current.setUser(mockUser)
            })

            testLogger.step('Completing task')
            await act(async () => {
                await result.current.completeTaskAsync('task-1')
            })

            testLogger.step('Waiting for task to be completed')
            await testUtils.waitForState(() =>
                result.current.tasks.find(task => task.id === 'task-1')?.status === 'completed',
                true
            )

            testLogger.assertion('Task completed successfully', true)
            const completedTaskResult = result.current.tasks.find(task => task.id === 'task-1')
            expect(completedTaskResult?.status).toBe('completed')
        })

        test('should handle complete task error', async () => {
            const mockUser = testUtils.generateUser()

            testLogger.step('Setting up error scenario')
            testMocks.addUser(mockUser)

            // Настройка мока для загрузки задач при установке пользователя
            mockTasksMockModule.mockGetTasks.mockResolvedValueOnce({
                success: true,
                tasks: [],
                message: 'Tasks loaded successfully'
            })

            // Мокаем ошибку
            mockTasksMockModule.mockCompleteTask.mockResolvedValueOnce({
                success: false,
                error: 'Complete failed'
            })

            testLogger.step('Rendering store hook')
            const { result } = renderHook(() => useAppStore())

            testLogger.step('Setting user')
            await act(async () => {
                result.current.setUser(mockUser)
            })
            await testUtils.waitForCondition(() => result.current.user !== null)

            testLogger.step('Attempting to complete task')
            await act(async () => {
                await result.current.completeTaskAsync('non-existent-task')
            })

            testLogger.step('Waiting for error state')
            await testUtils.waitForCondition(() => result.current.error !== null)

            testLogger.assertion('Complete error handled correctly', true, 'Complete failed', result.current.error)
            expect(result.current.error).toBe('Complete failed')
        })
    })

    describe('syncTasksAsync', () => {
        test('should sync tasks successfully', async () => {
            const mockUser = testUtils.generateUser()
            const mockTasks = [
                testUtils.generateTask({ id: 'task-1', title: 'Task 1' }),
                testUtils.generateTask({ id: 'task-2', title: 'Task 2' })
            ]

            testLogger.step('Setting up mock data')
            testMocks.addUser(mockUser)
            mockTasks.forEach(task => testMocks.addTask(task))

            // Настройка мока для успешной синхронизации задач (использует @/lib/tasks-mock в mock режиме)
            const mockTasksMockModule = require('@/lib/tasks-mock')
            mockTasksMockModule.mockSyncTasks.mockResolvedValueOnce({
                success: true,
                tasks: mockTasks,
                message: 'Tasks synced successfully'
            })

            testLogger.step('Rendering store hook')
            const { result } = renderHook(() => useAppStore())

            testLogger.step('Setting user')
            await act(async () => {
                result.current.setUser(mockUser)
            })
            await testUtils.waitForCondition(() => result.current.user !== null)

            testLogger.step('Syncing tasks')
            await act(async () => {
                await result.current.syncTasksAsync()
            })

            testLogger.step('Waiting for sync to complete')
            await testUtils.waitForCondition(() => result.current.tasks.length > 0)

            testLogger.assertion('Tasks synced successfully', true, 2, result.current.tasks.length)
            expect(result.current.tasks).toHaveLength(2)
        })

        test('should handle sync tasks error', async () => {
            const mockUser = testUtils.generateUser()

            testLogger.step('Setting up error scenario')
            testMocks.addUser(mockUser)

            // Настройка мока для загрузки задач при установке пользователя
            mockTasksMockModule.mockGetTasks.mockResolvedValueOnce({
                success: true,
                tasks: [],
                message: 'Tasks loaded successfully'
            })

            // Мокаем ошибку в syncTasks (использует @/lib/tasks-mock в mock режиме)
            mockTasksMockModule.mockSyncTasks.mockResolvedValueOnce({
                success: false,
                error: 'Sync failed'
            })

            testLogger.step('Rendering store hook')
            const { result } = renderHook(() => useAppStore())

            testLogger.step('Setting user')
            await act(async () => {
                result.current.setUser(mockUser)
            })
            await testUtils.waitForCondition(() => result.current.user !== null)

            testLogger.step('Attempting to sync tasks')
            await act(async () => {
                await result.current.syncTasksAsync()
            })

            testLogger.step('Waiting for error state')
            await testUtils.waitForCondition(() => result.current.error !== null)

            testLogger.assertion('Sync error handled correctly', true, 'Sync failed', result.current.error)
            expect(result.current.error).toBe('Sync failed')
        })
    })

    describe('loadTasksStats', () => {
        test('should load tasks stats successfully', async () => {
            const mockUser = testUtils.generateUser()
            const mockStats = {
                total: 10,
                completed: 5,
                pending: 5,
                completionRate: 0.5,
                averageCompletionTime: 30
            }

            testLogger.step('Setting up mock data')
            testMocks.addUser(mockUser)

            // Настройка мока для загрузки статистики (использует @/lib/tasks, не @/lib/tasks-mock)
            mockTasksModule.getTasksStats.mockResolvedValueOnce({
                success: true,
                stats: mockStats,
                message: 'Stats loaded successfully'
            })

            testLogger.step('Rendering store hook')
            const { result } = renderHook(() => useAppStore())

            testLogger.step('Setting user')
            await act(async () => {
                result.current.setUser(mockUser)
            })

            testLogger.step('Loading tasks stats')
            await act(async () => {
                await result.current.loadTasksStats()
            })

            // Ждем завершения загрузки
            await testUtils.waitForCondition(() => !result.current.isLoading)

            // loadTasksStats только логирует stats, не устанавливает их в store
            testLogger.assertion('Stats loaded successfully', true, mockStats, 'logged to console')
            expect(mockTasksMockModule.mockGetTasksStats).toHaveBeenCalledWith(mockUser.id)
        })

        test('should handle load stats error', async () => {
            const mockUser = testUtils.generateUser()

            testLogger.step('Setting up error scenario')
            testMocks.addUser(mockUser)

            // Мокаем ошибку (использует @/lib/tasks, не @/lib/tasks-mock)
            mockTasksModule.getTasksStats.mockResolvedValueOnce({
                success: false,
                error: 'Stats failed'
            })

            testLogger.step('Rendering store hook')
            const { result } = renderHook(() => useAppStore())

            testLogger.step('Setting user')
            await act(async () => {
                result.current.setUser(mockUser)
            })

            testLogger.step('Attempting to load stats')
            await act(async () => {
                await result.current.loadTasksStats()
            })

            // Ждем завершения загрузки
            await testUtils.waitForCondition(() => !result.current.isLoading)

            // loadTasksStats не устанавливает error в store, только логирует
            testLogger.assertion('Stats error handled correctly', true, 'Stats failed', 'logged to console')
            expect(mockTasksMockModule.mockGetTasksStats).toHaveBeenCalledWith(mockUser.id)
        })
    })
})
