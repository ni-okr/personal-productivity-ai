import { useAppStore } from '@/stores/useAppStore'
import { testFramework, testLogger, testMocks, testUtils, MOCK_CONFIGS, TEST_CONFIGS, testFramework } from '../framework'
/**
 * 🧪 Unit тесты для useAppStore - Мигрированная версия с единым фреймворком
 * 
 * Показывает как использовать единый фреймворк тестирования
 */

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

describe('useAppStore with unified testing framework', () => {
    beforeEach(() => {
        // Настройка фреймворка для unit тестов
        testFramework.updateConfig(TEST_CONFIGS.UNIT)
        testMocks.updateConfig(MOCK_CONFIGS.MINIMAL)
        testMocks.setupAllMocks()

        // Установка mock режима
        process.env.NEXT_PUBLIC_DISABLE_EMAIL = 'true'

        testLogger.startTest('useAppStore')
    })

    afterEach(() => {
        testMocks.clearAllMocks()
        testLogger.endTest('useAppStore', true)

        // Очистка переменных окружения
        delete process.env.NEXT_PUBLIC_DISABLE_EMAIL
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

            testLogger.step('Rendering store hook')
            const { result } = testUtils.renderHook(() => useAppStore())

            testLogger.step('Setting user and loading tasks')
            await testUtils.testUtils.act(async () => {
                result.current.setUser(mockUser)
            })

            testLogger.step('Waiting for tasks to load')
            await testUtils.waitForState(() => result.current.tasks.length > 0, true)

            testLogger.assertion('Tasks loaded successfully', true, 2, result.current.tasks.length)
            expect(result.current.tasks).toHaveLength(2)
            expect(result.current.tasks[0].title).toBe('Test Task 1')
        })

        test('should handle load tasks error', async () => {
            const mockUser = testUtils.generateUser()

            testLogger.step('Setting up error scenario')
            testMocks.addUser(mockUser)

            // Мокаем ошибку в mock API
            const mockTasksMockApi = require('@/lib/tasks-mock')
            mockTasksMockApi.mockGetTasks.mockRejectedValueOnce(new Error('Mock API Error'))

            testLogger.step('Rendering store hook')
            const { result } = testUtils.renderHook(() => useAppStore())

            testLogger.step('Setting user and loading tasks')
            await testUtils.testUtils.act(async () => {
                result.current.setUser(mockUser)
            })

            testLogger.step('Waiting for error state')
            await testUtils.waitForState(() => result.current.error !== null, true)

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

            testLogger.step('Rendering store hook')
            const { result } = testUtils.renderHook(() => useAppStore())

            testLogger.step('Setting user')
            await testUtils.testUtils.act(async () => {
                result.current.setUser(mockUser)
            })

            testLogger.step('Creating new task')
            await testUtils.testUtils.act(async () => {
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

            // Мокаем ошибку
            const mockTasksMockApi = require('@/lib/tasks-mock')
            mockTasksMockApi.mockCreateTask.mockRejectedValueOnce(new Error('Create failed'))

            testLogger.step('Rendering store hook')
            const { result } = testUtils.renderHook(() => useAppStore())

            testLogger.step('Setting user')
            await testUtils.testUtils.act(async () => {
                result.current.setUser(mockUser)
            })

            testLogger.step('Attempting to create task')
            await testUtils.testUtils.act(async () => {
                await result.current.createTaskAsync({
                    title: 'New Task',
                    description: 'New Description',
                    priority: 'high'
                })
            })

            testLogger.step('Waiting for error state')
            await testUtils.waitForState(() => result.current.error !== null, true)

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

            testLogger.step('Setting up mock data')
            testMocks.addUser(mockUser)
            testMocks.addTask(existingTask)

            testLogger.step('Rendering store hook')
            const { result } = testUtils.renderHook(() => useAppStore())

            testLogger.step('Setting user and loading tasks')
            await testUtils.testUtils.act(async () => {
                result.current.setUser(mockUser)
            })

            testLogger.step('Updating task')
            await testUtils.testUtils.act(async () => {
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
            const updatedTask = result.current.tasks.find(task => task.id === 'task-1')
            expect(updatedTask?.title).toBe('Updated Task')
            expect(updatedTask?.priority).toBe('high')
        })

        test('should handle update task error', async () => {
            const mockUser = testUtils.generateUser()

            testLogger.step('Setting up error scenario')
            testMocks.addUser(mockUser)

            // Мокаем ошибку
            const mockTasksMockApi = require('@/lib/tasks-mock')
            mockTasksMockApi.mockUpdateTask.mockRejectedValueOnce(new Error('Update failed'))

            testLogger.step('Rendering store hook')
            const { result } = testUtils.renderHook(() => useAppStore())

            testLogger.step('Setting user')
            await testUtils.testUtils.act(async () => {
                result.current.setUser(mockUser)
            })

            testLogger.step('Attempting to update task')
            await testUtils.testUtils.act(async () => {
                await result.current.updateTaskAsync('non-existent-task', {
                    title: 'Updated Task'
                })
            })

            testLogger.step('Waiting for error state')
            await testUtils.waitForState(() => result.current.error !== null, true)

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

            testLogger.step('Rendering store hook')
            const { result } = testUtils.renderHook(() => useAppStore())

            testLogger.step('Setting user and loading tasks')
            await testUtils.testUtils.act(async () => {
                result.current.setUser(mockUser)
            })

            testLogger.step('Deleting task')
            await testUtils.testUtils.act(async () => {
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

            // Мокаем ошибку
            const mockTasksMockApi = require('@/lib/tasks-mock')
            mockTasksMockApi.mockDeleteTask.mockRejectedValueOnce(new Error('Delete failed'))

            testLogger.step('Rendering store hook')
            const { result } = testUtils.renderHook(() => useAppStore())

            testLogger.step('Setting user')
            await testUtils.testUtils.act(async () => {
                result.current.setUser(mockUser)
            })

            testLogger.step('Attempting to delete task')
            await testUtils.testUtils.act(async () => {
                await result.current.deleteTaskAsync('non-existent-task')
            })

            testLogger.step('Waiting for error state')
            await testUtils.waitForState(() => result.current.error !== null, true)

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

            testLogger.step('Setting up mock data')
            testMocks.addUser(mockUser)
            testMocks.addTask(existingTask)

            testLogger.step('Rendering store hook')
            const { result } = testUtils.renderHook(() => useAppStore())

            testLogger.step('Setting user and loading tasks')
            await testUtils.testUtils.act(async () => {
                result.current.setUser(mockUser)
            })

            testLogger.step('Completing task')
            await testUtils.testUtils.act(async () => {
                await result.current.completeTaskAsync('task-1')
            })

            testLogger.step('Waiting for task to be completed')
            await testUtils.waitForState(() =>
                result.current.tasks.find(task => task.id === 'task-1')?.status === 'completed',
                true
            )

            testLogger.assertion('Task completed successfully', true)
            const completedTask = result.current.tasks.find(task => task.id === 'task-1')
            expect(completedTask?.status).toBe('completed')
        })

        test('should handle complete task error', async () => {
            const mockUser = testUtils.generateUser()

            testLogger.step('Setting up error scenario')
            testMocks.addUser(mockUser)

            // Мокаем ошибку
            const mockTasksMockApi = require('@/lib/tasks-mock')
            mockTasksMockApi.mockCompleteTask.mockRejectedValueOnce(new Error('Complete failed'))

            testLogger.step('Rendering store hook')
            const { result } = testUtils.renderHook(() => useAppStore())

            testLogger.step('Setting user')
            await testUtils.testUtils.act(async () => {
                result.current.setUser(mockUser)
            })

            testLogger.step('Attempting to complete task')
            await testUtils.testUtils.act(async () => {
                await result.current.completeTaskAsync('non-existent-task')
            })

            testLogger.step('Waiting for error state')
            await testUtils.waitForState(() => result.current.error !== null, true)

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

            testLogger.step('Rendering store hook')
            const { result } = testUtils.renderHook(() => useAppStore())

            testLogger.step('Setting user')
            await testUtils.testUtils.act(async () => {
                result.current.setUser(mockUser)
            })

            testLogger.step('Syncing tasks')
            await testUtils.testUtils.act(async () => {
                await result.current.syncTasksAsync()
            })

            testLogger.step('Waiting for sync to complete')
            await testUtils.waitForState(() => result.current.tasks.length > 0, true)

            testLogger.assertion('Tasks synced successfully', true, 2, result.current.tasks.length)
            expect(result.current.tasks).toHaveLength(2)
        })

        test('should handle sync tasks error', async () => {
            const mockUser = testUtils.generateUser()

            testLogger.step('Setting up error scenario')
            testMocks.addUser(mockUser)

            // Мокаем ошибку в реальном API
            const mockTasksApi = require('@/lib/tasks')
            mockTasksApi.syncTasks.mockRejectedValueOnce(new Error('Sync failed'))

            testLogger.step('Rendering store hook')
            const { result } = testUtils.renderHook(() => useAppStore())

            testLogger.step('Setting user')
            await testUtils.testUtils.act(async () => {
                result.current.setUser(mockUser)
            })

            testLogger.step('Attempting to sync tasks')
            await testUtils.testUtils.act(async () => {
                await result.current.syncTasksAsync()
            })

            testLogger.step('Waiting for error state')
            await testUtils.waitForState(() => result.current.error !== null, true)

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

            // Мокаем stats API
            const mockTasksApi = require('@/lib/tasks')
            mockTasksApi.getTasksStats.mockResolvedValueOnce(mockStats)

            testLogger.step('Rendering store hook')
            const { result } = testUtils.renderHook(() => useAppStore())

            testLogger.step('Setting user')
            await testUtils.testUtils.act(async () => {
                result.current.setUser(mockUser)
            })

            testLogger.step('Loading tasks stats')
            await testUtils.testUtils.act(async () => {
                await result.current.loadTasksStats()
            })

            testLogger.step('Waiting for stats to load')
            await testUtils.waitForState(() => result.current.stats !== null, true)

            testLogger.assertion('Stats loaded successfully', true, mockStats, result.current.stats)
            expect(result.current.stats).toEqual(mockStats)
        })

        test('should handle load stats error', async () => {
            const mockUser = testUtils.generateUser()

            testLogger.step('Setting up error scenario')
            testMocks.addUser(mockUser)

            // Мокаем ошибку
            const mockTasksApi = require('@/lib/tasks')
            mockTasksApi.getTasksStats.mockRejectedValueOnce(new Error('Stats failed'))

            testLogger.step('Rendering store hook')
            const { result } = testUtils.renderHook(() => useAppStore())

            testLogger.step('Setting user')
            await testUtils.testUtils.act(async () => {
                result.current.setUser(mockUser)
            })

            testLogger.step('Attempting to load stats')
            await testUtils.testUtils.act(async () => {
                await result.current.loadTasksStats()
            })

            testLogger.step('Waiting for error state')
            await testUtils.waitForState(() => result.current.error !== null, true)

            testLogger.assertion('Stats error handled correctly', true, 'Stats failed', result.current.error)
            expect(result.current.error).toBe('Stats failed')
        })
    })
})
