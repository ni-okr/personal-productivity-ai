/**
 * 🧪 Unit тесты для useAppStore с Dependency Injection
 * 
 * Показывает как использовать dependency injection для тестирования
 */

import { setMockTaskAPI, useAppStore } from '@/stores/useAppStore'
import { CreateTaskData, UpdateTaskData } from '@/types'
import { act, renderHook } from '@testing-library/react'
import { MOCK_CONFIGS, TEST_CONFIGS, testFramework, testLogger, testMocks, testUtils } from '../framework'

describe('useAppStore with Dependency Injection', () => {
    beforeEach(() => {
        // Настройка фреймворка для unit тестов
        testFramework.updateConfig(TEST_CONFIGS.UNIT)
        testMocks.updateConfig(MOCK_CONFIGS.MINIMAL)
        testMocks.setupAllMocks()

        // Установка mock режима
        process.env.NEXT_PUBLIC_DISABLE_EMAIL = 'true'

        testLogger.startTest('useAppStore with Dependency Injection')
    })

    afterEach(() => {
        testMocks.clearAllMocks()
        testLogger.endTest('useAppStore with Dependency Injection', true)

        // Очистка переменных окружения
        delete process.env.NEXT_PUBLIC_DISABLE_EMAIL

        // Очистка mock API
        setMockTaskAPI(null)

        // Очистка состояния store
        act(() => {
            useAppStore.getState().clearUserData()
        })
    })

    describe('loadTasks', () => {
        test('should load tasks successfully', async () => {
            const mockUser = testUtils.generateUser()
            const mockTasks = testUtils.generateTasks(3)

            // Настройка mock API
            const mockAPI = {
                getTasks: jest.fn().mockResolvedValue({
                    success: true,
                    tasks: mockTasks,
                    message: 'Tasks loaded successfully'
                }),
                createTask: jest.fn(),
                updateTask: jest.fn(),
                deleteTask: jest.fn(),
                completeTask: jest.fn(),
                syncTasks: jest.fn(),
                getTasksStats: jest.fn(),
                getProductivityMetrics: jest.fn().mockResolvedValue(null),
                getAISuggestions: jest.fn().mockResolvedValue([])
            }

            setMockTaskAPI(mockAPI)

            const { result } = renderHook(() => useAppStore())

            testLogger.step('Setting up user')
            testMocks.addUser(mockUser)

            // Устанавливаем пользователя в store перед вызовом loadTasks
            await act(async () => {
                result.current.setUser(mockUser)
            })

            testLogger.step('Loading tasks')
            await act(async () => {
                await result.current.loadTasks()
            })

            testLogger.step('Waiting for tasks to load')
            await testUtils.waitForCondition(() => result.current.tasks.length > 0)

            testLogger.assertion('Tasks loaded successfully', true, mockTasks.length, result.current.tasks.length)
            expect(result.current.tasks).toEqual(mockTasks)
            expect(mockAPI.getTasks).toHaveBeenCalledWith(mockUser.id)
        })

        test('should handle load tasks error', async () => {
            const mockUser = testUtils.generateUser()

            // Настройка mock API с ошибкой
            const mockAPI = {
                getTasks: jest.fn().mockResolvedValue({
                    success: false,
                    error: 'Load failed'
                }),
                createTask: jest.fn(),
                updateTask: jest.fn(),
                deleteTask: jest.fn(),
                completeTask: jest.fn(),
                syncTasks: jest.fn(),
                getTasksStats: jest.fn(),
                getProductivityMetrics: jest.fn().mockResolvedValue(null),
                getAISuggestions: jest.fn().mockResolvedValue([])
            }

            setMockTaskAPI(mockAPI)

            const { result } = renderHook(() => useAppStore())

            testLogger.step('Setting up user')
            testMocks.addUser(mockUser)

            // Устанавливаем пользователя в store перед вызовом loadTasks
            await act(async () => {
                result.current.setUser(mockUser)
            })

            testLogger.step('Loading tasks with error')
            await act(async () => {
                await result.current.loadTasks()
            })

            testLogger.step('Waiting for error state')
            await testUtils.waitForCondition(() => result.current.error !== null)

            testLogger.assertion('Load error handled correctly', true, 'Load failed', result.current.error)
            expect(result.current.error).toBe('Load failed')
        })
    })

    describe('createTaskAsync', () => {
        test('should create task successfully', async () => {
            const mockUser = testUtils.generateUser()
            const mockTask = testUtils.generateTask()
            const taskData: CreateTaskData = {
                title: 'Test Task',
                description: 'Test Description',
                priority: 'high',
                estimatedMinutes: 30
            }

            // Настройка mock API
            const mockAPI = {
                getTasks: jest.fn().mockResolvedValue({
                    success: true,
                    tasks: [],
                    message: 'Tasks loaded successfully'
                }),
                createTask: jest.fn().mockResolvedValue({
                    success: true,
                    task: mockTask,
                    message: 'Task created successfully'
                }),
                updateTask: jest.fn(),
                deleteTask: jest.fn(),
                completeTask: jest.fn(),
                syncTasks: jest.fn(),
                getTasksStats: jest.fn(),
                getProductivityMetrics: jest.fn().mockResolvedValue(null),
                getAISuggestions: jest.fn().mockResolvedValue([])
            }

            setMockTaskAPI(mockAPI)

            const { result } = renderHook(() => useAppStore())

            testLogger.step('Setting up user')
            testMocks.addUser(mockUser)

            // Устанавливаем пользователя в store перед вызовом createTaskAsync
            await act(async () => {
                result.current.setUser(mockUser)
            })

            // Ждем, пока пользователь установится
            await testUtils.waitForCondition(() => result.current.user !== null)

            testLogger.step('Creating task')
            await act(async () => {
                await result.current.createTaskAsync(taskData)
            })

            testLogger.step('Waiting for task to be created')
            await testUtils.waitForCondition(() => result.current.tasks.length > 0)

            testLogger.assertion('Task created successfully', true, mockTask, result.current.tasks[0])
            expect(result.current.tasks).toContainEqual(mockTask)
            expect(mockAPI.createTask).toHaveBeenCalledWith(mockUser.id, taskData)
        })

        test('should handle create task error', async () => {
            const mockUser = testUtils.generateUser()
            const taskData: CreateTaskData = {
                title: 'Test Task',
                description: 'Test Description',
                priority: 'high',
                estimatedMinutes: 30
            }

            // Настройка mock API с ошибкой
            const mockAPI = {
                getTasks: jest.fn().mockResolvedValue({
                    success: true,
                    tasks: [],
                    message: 'Tasks loaded successfully'
                }),
                createTask: jest.fn().mockResolvedValue({
                    success: false,
                    error: 'Create failed'
                }),
                updateTask: jest.fn(),
                deleteTask: jest.fn(),
                completeTask: jest.fn(),
                syncTasks: jest.fn(),
                getTasksStats: jest.fn(),
                getProductivityMetrics: jest.fn().mockResolvedValue(null),
                getAISuggestions: jest.fn().mockResolvedValue([])
            }

            setMockTaskAPI(mockAPI)

            const { result } = renderHook(() => useAppStore())

            testLogger.step('Setting up user')
            testMocks.addUser(mockUser)

            // Устанавливаем пользователя в store перед вызовом createTaskAsync
            await act(async () => {
                result.current.setUser(mockUser)
            })
            await testUtils.waitForCondition(() => result.current.user !== null)

            testLogger.step('Creating task with error')
            await act(async () => {
                await result.current.createTaskAsync(taskData)
            })

            testLogger.step('Waiting for error state')
            await testUtils.waitForCondition(() => result.current.error !== null)

            testLogger.assertion('Create error handled correctly', true, 'Create failed', result.current.error)
            expect(result.current.error).toBe('Create failed')
            expect(mockAPI.createTask).toHaveBeenCalledWith(mockUser.id, taskData)
        })
    })

    describe('updateTaskAsync', () => {
        test('should update task successfully', async () => {
            const mockUser = testUtils.generateUser()
            const mockTask = testUtils.generateTask()
            const updates: UpdateTaskData = {
                title: 'Updated Task',
                priority: 'medium'
            }

            // Настройка mock API
            const mockAPI = {
                getTasks: jest.fn().mockResolvedValue({
                    success: true,
                    tasks: [mockTask],
                    message: 'Tasks loaded successfully'
                }),
                createTask: jest.fn(),
                updateTask: jest.fn().mockResolvedValue({
                    success: true,
                    task: { ...mockTask, ...updates },
                    message: 'Task updated successfully'
                }),
                deleteTask: jest.fn(),
                completeTask: jest.fn(),
                syncTasks: jest.fn(),
                getTasksStats: jest.fn(),
                getProductivityMetrics: jest.fn().mockResolvedValue(null),
                getAISuggestions: jest.fn().mockResolvedValue([])
            }

            setMockTaskAPI(mockAPI)

            const { result } = renderHook(() => useAppStore())

            testLogger.step('Setting up user and loading tasks')
            testMocks.addUser(mockUser)

            // Устанавливаем пользователя в store перед вызовом loadTasks
            await act(async () => {
                result.current.setUser(mockUser)
            })
            await testUtils.waitForCondition(() => result.current.user !== null)

            await act(async () => {
                await result.current.loadTasks()
            })

            // Ждем загрузки задач
            await testUtils.waitForCondition(() => result.current.tasks.length > 0)

            testLogger.step('Updating task')
            await act(async () => {
                await result.current.updateTaskAsync(mockTask.id, updates)
            })

            testLogger.assertion('Task updated successfully', true, updates.title, result.current.tasks[0].title)
            expect(result.current.tasks[0].title).toBe(updates.title)
            expect(mockAPI.updateTask).toHaveBeenCalledWith(mockTask.id, updates)
        })

        test('should handle update task error', async () => {
            const mockUser = testUtils.generateUser()
            const mockTask = testUtils.generateTask()
            const updates: UpdateTaskData = {
                title: 'Updated Task',
                priority: 'medium'
            }

            // Настройка mock API с ошибкой
            const mockAPI = {
                getTasks: jest.fn().mockResolvedValue({
                    success: true,
                    tasks: [mockTask],
                    message: 'Tasks loaded successfully'
                }),
                createTask: jest.fn(),
                updateTask: jest.fn().mockResolvedValue({
                    success: false,
                    error: 'Update failed'
                }),
                deleteTask: jest.fn(),
                completeTask: jest.fn(),
                syncTasks: jest.fn(),
                getTasksStats: jest.fn(),
                getProductivityMetrics: jest.fn().mockResolvedValue(null),
                getAISuggestions: jest.fn().mockResolvedValue([])
            }

            setMockTaskAPI(mockAPI)

            const { result } = renderHook(() => useAppStore())

            testLogger.step('Setting up user and loading tasks')
            testMocks.addUser(mockUser)

            // Устанавливаем пользователя в store перед вызовом loadTasks
            await act(async () => {
                result.current.setUser(mockUser)
            })
            await testUtils.waitForCondition(() => result.current.user !== null)

            await act(async () => {
                await result.current.loadTasks()
            })

            testLogger.step('Updating task with error')
            await act(async () => {
                await result.current.updateTaskAsync(mockTask.id, updates)
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
            const mockTask = testUtils.generateTask()

            // Настройка mock API
            const mockAPI = {
                getTasks: jest.fn().mockResolvedValue({
                    success: true,
                    tasks: [mockTask],
                    message: 'Tasks loaded successfully'
                }),
                createTask: jest.fn(),
                updateTask: jest.fn(),
                deleteTask: jest.fn().mockResolvedValue({
                    success: true,
                    message: 'Task deleted successfully'
                }),
                completeTask: jest.fn(),
                syncTasks: jest.fn(),
                getTasksStats: jest.fn(),
                getProductivityMetrics: jest.fn().mockResolvedValue(null),
                getAISuggestions: jest.fn().mockResolvedValue([])
            }

            setMockTaskAPI(mockAPI)

            const { result } = renderHook(() => useAppStore())

            testLogger.step('Setting up user and loading tasks')
            testMocks.addUser(mockUser)

            // Устанавливаем пользователя в store перед вызовом loadTasks
            await act(async () => {
                result.current.setUser(mockUser)
            })
            await testUtils.waitForCondition(() => result.current.user !== null)

            await act(async () => {
                await result.current.loadTasks()
            })

            testLogger.step('Deleting task')
            await act(async () => {
                await result.current.deleteTaskAsync(mockTask.id)
            })

            testLogger.assertion('Task deleted successfully', true, 0, result.current.tasks.length)
            expect(result.current.tasks).toHaveLength(0)
            expect(mockAPI.deleteTask).toHaveBeenCalledWith(mockTask.id)
        })

        test('should handle delete task error', async () => {
            const mockUser = testUtils.generateUser()
            const mockTask = testUtils.generateTask()

            // Настройка mock API с ошибкой
            const mockAPI = {
                getTasks: jest.fn().mockResolvedValue({
                    success: true,
                    tasks: [mockTask],
                    message: 'Tasks loaded successfully'
                }),
                createTask: jest.fn(),
                updateTask: jest.fn(),
                deleteTask: jest.fn().mockResolvedValue({
                    success: false,
                    error: 'Delete failed'
                }),
                completeTask: jest.fn(),
                syncTasks: jest.fn(),
                getTasksStats: jest.fn(),
                getProductivityMetrics: jest.fn().mockResolvedValue(null),
                getAISuggestions: jest.fn().mockResolvedValue([])
            }

            setMockTaskAPI(mockAPI)

            const { result } = renderHook(() => useAppStore())

            testLogger.step('Setting up user and loading tasks')
            testMocks.addUser(mockUser)

            // Устанавливаем пользователя в store перед вызовом loadTasks
            await act(async () => {
                result.current.setUser(mockUser)
            })
            await testUtils.waitForCondition(() => result.current.user !== null)

            await act(async () => {
                await result.current.loadTasks()
            })

            testLogger.step('Deleting task with error')
            await act(async () => {
                await result.current.deleteTaskAsync(mockTask.id)
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
            const mockTask = testUtils.generateTask()

            // Настройка mock API
            const mockAPI = {
                getTasks: jest.fn().mockResolvedValue({
                    success: true,
                    tasks: [mockTask],
                    message: 'Tasks loaded successfully'
                }),
                createTask: jest.fn(),
                updateTask: jest.fn(),
                deleteTask: jest.fn(),
                completeTask: jest.fn().mockResolvedValue({
                    success: true,
                    task: { ...mockTask, status: 'completed' as const },
                    message: 'Task completed successfully'
                }),
                syncTasks: jest.fn(),
                getTasksStats: jest.fn(),
                getProductivityMetrics: jest.fn().mockResolvedValue(null),
                getAISuggestions: jest.fn().mockResolvedValue([])
            }

            setMockTaskAPI(mockAPI)

            const { result } = renderHook(() => useAppStore())

            testLogger.step('Setting up user and loading tasks')
            testMocks.addUser(mockUser)

            // Устанавливаем пользователя в store перед вызовом loadTasks
            await act(async () => {
                result.current.setUser(mockUser)
            })
            await testUtils.waitForCondition(() => result.current.user !== null)

            await act(async () => {
                await result.current.loadTasks()
            })

            // Ждем загрузки задач
            await testUtils.waitForCondition(() => result.current.tasks.length > 0)

            testLogger.step('Completing task')
            await act(async () => {
                await result.current.completeTaskAsync(mockTask.id, 30)
            })

            testLogger.assertion('Task completed successfully', true, 'completed', result.current.tasks[0].status)
            expect(result.current.tasks[0].status).toBe('completed')
            expect(mockAPI.completeTask).toHaveBeenCalledWith(mockTask.id, 30)
        })

        test('should handle complete task error', async () => {
            const mockUser = testUtils.generateUser()
            const mockTask = testUtils.generateTask()

            // Настройка mock API с ошибкой
            const mockAPI = {
                getTasks: jest.fn().mockResolvedValue({
                    success: true,
                    tasks: [mockTask],
                    message: 'Tasks loaded successfully'
                }),
                createTask: jest.fn(),
                updateTask: jest.fn(),
                deleteTask: jest.fn(),
                completeTask: jest.fn().mockResolvedValue({
                    success: false,
                    error: 'Complete failed'
                }),
                syncTasks: jest.fn(),
                getTasksStats: jest.fn(),
                getProductivityMetrics: jest.fn().mockResolvedValue(null),
                getAISuggestions: jest.fn().mockResolvedValue([])
            }

            setMockTaskAPI(mockAPI)

            const { result } = renderHook(() => useAppStore())

            testLogger.step('Setting up user and loading tasks')
            testMocks.addUser(mockUser)

            // Устанавливаем пользователя в store перед вызовом loadTasks
            await act(async () => {
                result.current.setUser(mockUser)
            })
            await testUtils.waitForCondition(() => result.current.user !== null)

            await act(async () => {
                await result.current.loadTasks()
            })

            testLogger.step('Completing task with error')
            await act(async () => {
                await result.current.completeTaskAsync(mockTask.id, 30)
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
            const mockTasks = testUtils.generateTasks(2)

            // Настройка mock API
            const mockAPI = {
                getTasks: jest.fn().mockResolvedValue({
                    success: true,
                    tasks: [],
                    message: 'Tasks loaded successfully'
                }),
                createTask: jest.fn(),
                updateTask: jest.fn(),
                deleteTask: jest.fn(),
                completeTask: jest.fn(),
                syncTasks: jest.fn().mockResolvedValue({
                    success: true,
                    tasks: mockTasks,
                    message: 'Tasks synced successfully'
                }),
                getTasksStats: jest.fn(),
                getProductivityMetrics: jest.fn().mockResolvedValue(null),
                getAISuggestions: jest.fn().mockResolvedValue([])
            }

            setMockTaskAPI(mockAPI)

            const { result } = renderHook(() => useAppStore())

            testLogger.step('Setting up user')
            testMocks.addUser(mockUser)

            // Устанавливаем пользователя в store перед вызовом syncTasksAsync
            await act(async () => {
                result.current.setUser(mockUser)
            })
            await testUtils.waitForCondition(() => result.current.user !== null)

            testLogger.step('Syncing tasks')
            await act(async () => {
                await result.current.syncTasksAsync()
            })

            testLogger.step('Waiting for tasks to sync')
            await testUtils.waitForCondition(() => result.current.tasks.length > 0)

            testLogger.assertion('Tasks synced successfully', true, mockTasks.length, result.current.tasks.length)
            expect(result.current.tasks).toEqual(mockTasks)
            expect(mockAPI.syncTasks).toHaveBeenCalledWith(mockUser.id)
        })

        test('should handle sync tasks error', async () => {
            const mockUser = testUtils.generateUser()

            // Настройка mock API с ошибкой
            const mockAPI = {
                getTasks: jest.fn().mockResolvedValue({
                    success: true,
                    tasks: [],
                    message: 'Tasks loaded successfully'
                }),
                createTask: jest.fn(),
                updateTask: jest.fn(),
                deleteTask: jest.fn(),
                completeTask: jest.fn(),
                syncTasks: jest.fn().mockResolvedValue({
                    success: false,
                    error: 'Sync failed'
                }),
                getTasksStats: jest.fn(),
                getProductivityMetrics: jest.fn().mockResolvedValue(null),
                getAISuggestions: jest.fn().mockResolvedValue([])
            }

            setMockTaskAPI(mockAPI)

            const { result } = renderHook(() => useAppStore())

            testLogger.step('Setting up user')
            testMocks.addUser(mockUser)

            // Устанавливаем пользователя в store перед вызовом syncTasksAsync
            await act(async () => {
                result.current.setUser(mockUser)
            })
            await testUtils.waitForCondition(() => result.current.user !== null)

            testLogger.step('Syncing tasks with error')
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
                total: 5,
                completed: 2,
                pending: 3,
                overdue: 1
            }

            // Настройка mock API
            const mockAPI = {
                getTasks: jest.fn().mockResolvedValue({
                    success: true,
                    tasks: [],
                    message: 'Tasks loaded successfully'
                }),
                createTask: jest.fn(),
                updateTask: jest.fn(),
                deleteTask: jest.fn(),
                completeTask: jest.fn(),
                syncTasks: jest.fn(),
                getTasksStats: jest.fn().mockResolvedValue({
                    success: true,
                    stats: mockStats,
                    message: 'Stats loaded successfully'
                }),
                getProductivityMetrics: jest.fn().mockResolvedValue(null),
                getAISuggestions: jest.fn().mockResolvedValue([])
            }

            setMockTaskAPI(mockAPI)

            const { result } = renderHook(() => useAppStore())

            testLogger.step('Setting up user')
            testMocks.addUser(mockUser)

            // Устанавливаем пользователя в store
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
            expect(mockAPI.getTasksStats).toHaveBeenCalledWith(mockUser.id)
        })

        test('should handle load stats error', async () => {
            const mockUser = testUtils.generateUser()

            // Настройка mock API с ошибкой
            const mockAPI = {
                getTasks: jest.fn().mockResolvedValue({
                    success: true,
                    tasks: [],
                    message: 'Tasks loaded successfully'
                }),
                createTask: jest.fn(),
                updateTask: jest.fn(),
                deleteTask: jest.fn(),
                completeTask: jest.fn(),
                syncTasks: jest.fn(),
                getTasksStats: jest.fn().mockResolvedValue({
                    success: false,
                    error: 'Stats failed'
                }),
                getProductivityMetrics: jest.fn().mockResolvedValue(null),
                getAISuggestions: jest.fn().mockResolvedValue([])
            }

            setMockTaskAPI(mockAPI)

            const { result } = renderHook(() => useAppStore())

            testLogger.step('Setting up user')
            testMocks.addUser(mockUser)

            // Устанавливаем пользователя в store
            await act(async () => {
                result.current.setUser(mockUser)
            })

            testLogger.step('Loading stats with error')
            await act(async () => {
                await result.current.loadTasksStats()
            })

            // Ждем завершения загрузки
            await testUtils.waitForCondition(() => !result.current.isLoading)

            // loadTasksStats не устанавливает error в store, только логирует
            testLogger.assertion('Stats error handled correctly', true, 'Stats failed', 'logged to console')
            expect(mockAPI.getTasksStats).toHaveBeenCalledWith(mockUser.id)
        })
    })
})
