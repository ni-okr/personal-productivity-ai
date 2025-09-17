/**
 * 🧪 Мигрирован с помощью единого фреймворка тестирования
 * 
 * Автоматически мигрирован: 2025-09-16T21:33:45.024Z
 * Оригинальный файл сохранен как: tests/unit/tasks-integration.test.ts.backup
 * 
 * ВАЖНО: Все новые тесты должны использовать единый фреймворк!
 * См. документацию: tests/docs/TESTING_FRAMEWORK.md
 */

// 🧪 Integration тесты для tasks.ts с mock режимом
import {
    completeTask,
    createTask,
    deleteTask,
    getTasks,
    getTasksStats,
    syncTasks,
    updateTask
} from '@/lib/tasks'
import { CreateTaskData, UpdateTaskData } from '@/types'
import { MOCK_CONFIGS, TEST_CONFIGS, testFramework, testLogger, testMocks } from '../framework'


// Mock console.log для проверки логов
let mockConsoleLog: jest.SpyInstance

describe('Tasks Integration (Mock Mode)', () => {
    const mockUserId = 'mock-user-1'
    const mockTaskData: CreateTaskData = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'medium',
        estimatedMinutes: 30,
        tags: ['test', 'integration']
    }

    beforeEach(() => {
        // Настройка единого фреймворка тестирования
        testFramework.updateConfig(TEST_CONFIGS.UNIT)
        testMocks.updateConfig(MOCK_CONFIGS.MINIMAL)
        testMocks.setupAllMocks()
        testLogger.startTest('Test Suite')
        mockConsoleLog = jest.spyOn(console, 'log').mockImplementation()
    })

    afterEach(() => {
        testMocks.clearAllMocks()
        testLogger.endTest('Test Suite', true)
        mockConsoleLog.mockRestore()
        // Очищаем mock данные между тестами
        const { clearMockTasks } = require('@/lib/tasks-mock')
        clearMockTasks()
    })

    describe('getTasks', () => {
        it('должен успешно получить задачи пользователя в mock режиме', async () => {
            const result = await getTasks(mockUserId)

            expect(result.success).toBe(true)
            expect(result.tasks).toBeDefined()
            expect(result.message).toBe('Mock задачи загружены успешно')
        })

        it('должен логировать действие в mock режиме', async () => {
            await getTasks(mockUserId)

            expect(mockConsoleLog).toHaveBeenCalledWith(
                '🧪 MOCK РЕЖИМ: Получение задач без реальных запросов к Supabase'
            )
        })
    })

    describe('createTask', () => {
        it('должен успешно создать задачу в mock режиме', async () => {
            const result = await createTask(mockUserId, mockTaskData)

            expect(result.success).toBe(true)
            expect(result.task).toBeDefined()
            expect(result.task!.title).toBe(mockTaskData.title)
            expect(result.task!.description).toBe(mockTaskData.description)
            expect(result.task!.priority).toBe(mockTaskData.priority)
            expect(result.task!.status).toBe('todo')
            expect(result.task!.userId).toBe(mockUserId)
            expect(result.message).toBe('Mock задача создана успешно')
        })

        it('должен логировать действие в mock режиме', async () => {
            await createTask(mockUserId, mockTaskData)

            expect(mockConsoleLog).toHaveBeenCalledWith(
                '🧪 MOCK РЕЖИМ: Создание задачи без реальных запросов к Supabase'
            )
        })
    })

    describe('updateTask', () => {
        let taskId: string

        beforeEach(async () => {
            const result = await createTask(mockUserId, mockTaskData)
            taskId = result.task!.id
        })

        it('должен успешно обновить задачу в mock режиме', async () => {
            const updates: UpdateTaskData = {
                title: 'Updated Task',
                description: 'Updated Description',
                priority: 'high'
            }

            const result = await updateTask(taskId, updates)

            expect(result.success).toBe(true)
            expect(result.task).toBeDefined()
            expect(result.task!.title).toBe(updates.title)
            expect(result.task!.description).toBe(updates.description)
            expect(result.task!.priority).toBe(updates.priority)
            expect(result.message).toBe('Mock задача обновлена успешно')
        })

        it('должен вернуть ошибку для несуществующей задачи', async () => {
            const updates: UpdateTaskData = { title: 'Updated Title' }
            const result = await updateTask('non-existent-id', updates)

            expect(result.success).toBe(false)
            expect(result.error).toBe('Задача не найдена')
        })

        it('должен логировать действие в mock режиме', async () => {
            const updates: UpdateTaskData = { title: 'Updated Title' }
            await updateTask(taskId, updates)

            expect(mockConsoleLog).toHaveBeenCalledWith(
                '🧪 MOCK РЕЖИМ: Обновление задачи без реальных запросов к Supabase'
            )
        })
    })

    describe('deleteTask', () => {
        let taskId: string

        beforeEach(async () => {
            const result = await createTask(mockUserId, mockTaskData)
            taskId = result.task!.id
        })

        it('должен успешно удалить задачу в mock режиме', async () => {
            const result = await deleteTask(taskId)

            expect(result.success).toBe(true)
            expect(result.message).toBe('Mock задача удалена успешно')
        })

        it('должен вернуть ошибку для несуществующей задачи', async () => {
            const result = await deleteTask('non-existent-id')

            expect(result.success).toBe(false)
            expect(result.error).toBe('Задача не найдена')
        })

        it('должен логировать действие в mock режиме', async () => {
            await deleteTask(taskId)

            expect(mockConsoleLog).toHaveBeenCalledWith(
                '🧪 MOCK РЕЖИМ: Удаление задачи без реальных запросов к Supabase'
            )
        })
    })

    describe('completeTask', () => {
        let taskId: string

        beforeEach(async () => {
            const result = await createTask(mockUserId, mockTaskData)
            taskId = result.task!.id
        })

        it('должен успешно завершить задачу в mock режиме', async () => {
            const actualMinutes = 25
            const result = await completeTask(taskId, actualMinutes)

            expect(result.success).toBe(true)
            expect(result.task).toBeDefined()
            expect(result.task!.status).toBe('completed')
            expect(result.task!.completedAt).toBeInstanceOf(Date)
            expect(result.task!.actualMinutes).toBe(actualMinutes)
            expect(result.message).toBe('Mock задача завершена успешно')
        })

        it('должен использовать estimatedMinutes если actualMinutes не указан', async () => {
            const result = await completeTask(taskId)

            expect(result.success).toBe(true)
            expect(result.task!.status).toBe('completed')
            expect(result.task!.actualMinutes).toBe(mockTaskData.estimatedMinutes)
        })

        it('должен вернуть ошибку для несуществующей задачи', async () => {
            const result = await completeTask('non-existent-id')

            expect(result.success).toBe(false)
            expect(result.error).toBe('Задача не найдена')
        })

        it('должен логировать действие в mock режиме', async () => {
            await completeTask(taskId)

            expect(mockConsoleLog).toHaveBeenCalledWith(
                '🧪 MOCK РЕЖИМ: Завершение задачи без реальных запросов к Supabase'
            )
        })
    })

    describe('getTasksStats', () => {
        beforeEach(async () => {
            // Создаем различные задачи для тестирования статистики
            await createTask(mockUserId, {
                title: 'Completed Task',
                description: 'Description',
                priority: 'high',
                estimatedMinutes: 30,
                tags: ['test']
            })

            await createTask(mockUserId, {
                title: 'In Progress Task',
                description: 'Description',
                priority: 'medium',
                estimatedMinutes: 45,
                tags: ['test']
            })

            await createTask(mockUserId, {
                title: 'Todo Task',
                description: 'Description',
                priority: 'low',
                estimatedMinutes: 20,
                tags: ['test']
            })

            // Завершаем одну задачу
            const tasks = await getTasks(mockUserId)
            if (tasks.tasks && tasks.tasks.length > 0) {
                await completeTask(tasks.tasks[0].id, 25)
            }
        })

        it('должен успешно получить статистику задач в mock режиме', async () => {
            const result = await getTasksStats(mockUserId)

            expect(result.success).toBe(true)
            expect(result.stats).toBeDefined()
            // В beforeEach создается 3 задачи
            // 1 задача завершается в beforeEach = 1 завершенная
            expect(result.stats!.total).toBe(3)
            expect(result.stats!.completed).toBe(1)
            expect(result.stats!.pending).toBe(2)
            expect(result.stats!.overdue).toBe(0) // Нет задач с dueDate
            expect(result.stats!.completionRate).toBe(33) // 1 из 3 задач завершено
            expect(result.stats!.averageCompletionTime).toBe(25) // 25 минут
        })

        it('должен логировать действие в mock режиме', async () => {
            await getTasksStats(mockUserId)

            expect(mockConsoleLog).toHaveBeenCalledWith(
                '🧪 MOCK РЕЖИМ: Получение статистики задач без реальных запросов к Supabase'
            )
        })
    })

    describe('syncTasks', () => {
        beforeEach(async () => {
            await createTask(mockUserId, mockTaskData)
        })

        it('должен успешно синхронизировать задачи в mock режиме', async () => {
            const result = await syncTasks(mockUserId)

            expect(result.success).toBe(true)
            expect(result.tasks).toBeDefined()
            expect(result.tasks!.length).toBeGreaterThan(0)
            expect(result.message).toBe('Mock задачи синхронизированы успешно')
        })

        it('должен логировать действие в mock режиме', async () => {
            await syncTasks(mockUserId)

            expect(mockConsoleLog).toHaveBeenCalledWith(
                '🧪 MOCK РЕЖИМ: Синхронизация задач без реальных запросов к Supabase'
            )
        })
    })

    describe('Валидация данных', () => {
        it('должен валидировать данные задачи при создании', async () => {
            const invalidTaskData = {
                title: '', // Пустой заголовок
                description: 'Test Description',
                priority: 'medium' as const,
                estimatedMinutes: 30,
                tags: ['test']
            }

            const result = await createTask(mockUserId, invalidTaskData)

            expect(result.success).toBe(false)
            expect(result.error).toBeDefined()
        })

        it('должен валидировать данные задачи при обновлении', async () => {
            const result = await createTask(mockUserId, mockTaskData)
            const taskId = result.task!.id

            const invalidUpdates = {
                title: '', // Пустой заголовок
                priority: 'medium' as const
            }

            const updateResult = await updateTask(taskId, invalidUpdates)

            expect(updateResult.success).toBe(false)
            expect(updateResult.error).toBeDefined()
        })
    })

    describe('Обработка ошибок', () => {
        it('должен обрабатывать ошибки валидации', async () => {
            const invalidTaskData = {
                title: '',
                description: 'Test Description',
                priority: 'invalid' as any,
                estimatedMinutes: -1,
                tags: ['test']
            }

            const result = await createTask(mockUserId, invalidTaskData)

            expect(result.success).toBe(false)
            expect(result.error).toBeDefined()
        })

        it('должен обрабатывать ошибки при работе с несуществующими задачами', async () => {
            const result = await updateTask('non-existent-id', { title: 'Updated' })

            expect(result.success).toBe(false)
            expect(result.error).toBe('Задача не найдена')
        })
    })
})
