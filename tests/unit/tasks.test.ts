// 🧪 Unit тесты для tasks.ts
import {
    completeTask,
    createTask,
    deleteTask,
    getTasks,
    getTasksStats,
    syncTasks,
    updateTask
} from '@/lib/tasks'

// Mock Supabase
const mockSupabaseClient = {
    from: jest.fn(() => ({
        select: jest.fn(() => ({
            eq: jest.fn(() => ({
                order: jest.fn(() => ({
                    data: [],
                    error: null
                }))
            }))
        })),
        insert: jest.fn(() => ({
            select: jest.fn(() => ({
                single: jest.fn(() => ({
                    data: null,
                    error: null
                }))
            }))
        })),
        update: jest.fn(() => ({
            eq: jest.fn(() => ({
                select: jest.fn(() => ({
                    single: jest.fn(() => ({
                        data: null,
                        error: null
                    }))
                }))
            }))
        })),
        delete: jest.fn(() => ({
            eq: jest.fn(() => ({
                data: null,
                error: null
            }))
        }))
    }))
}

jest.mock('@/lib/supabase', () => ({
    getSupabaseClient: jest.fn(() => mockSupabaseClient)
}))

const mockSupabase = mockSupabaseClient

describe('Tasks API', () => {
    const mockUserId = 'test-user-id'
    const mockTaskId = 'test-task-id'

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('getTasks', () => {
        it('должен успешно получить задачи пользователя', async () => {
            const mockTasks = [
                {
                    id: '1',
                    title: 'Test Task 1',
                    description: 'Test Description 1',
                    priority: 'high',
                    status: 'todo',
                    due_date: '2024-01-01T00:00:00Z',
                    completed_at: null,
                    estimated_minutes: 30,
                    actual_minutes: null,
                    source: 'manual',
                    tags: ['work'],
                    user_id: mockUserId,
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z'
                }
            ]

            // Настраиваем мок для возврата данных
            mockSupabase.from.mockReturnValue({
                select: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        order: jest.fn(() => ({
                            data: mockTasks,
                            error: null
                        }))
                    }))
                }))
            } as any)

            const result = await getTasks(mockUserId)

            expect(result.success).toBe(true)
            expect(result.tasks).toHaveLength(1)
            expect(result.tasks![0].title).toBe('Test Task 1')
            expect(result.tasks![0].priority).toBe('high')
        })

        it('должен обработать ошибку получения задач', async () => {
            // Настраиваем мок для возврата ошибки
            mockSupabase.from.mockReturnValue({
                select: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        order: jest.fn(() => ({
                            data: null,
                            error: { message: 'Database error' }
                        }))
                    }))
                }))
            } as any)

            const result = await getTasks(mockUserId)

            expect(result.success).toBe(false)
            expect(result.error).toBe('Database error')
        })
    })

    describe('createTask', () => {
        it('должен успешно создать задачу', async () => {
            const mockTaskData = {
                title: 'New Task',
                description: 'New Description',
                priority: 'medium' as const,
                dueDate: new Date('2030-01-01'), // future date
                estimatedMinutes: 60,
                tags: ['personal']
            }

            const mockCreatedTask = {
                id: 'new-task-id',
                title: 'New Task',
                description: 'New Description',
                priority: 'medium',
                status: 'todo',
                due_date: '2030-01-01T00:00:00Z',
                completed_at: null,
                estimated_minutes: 60,
                actual_minutes: null,
                source: 'manual',
                tags: ['personal'],
                user_id: mockUserId,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z'
            }

            mockSupabase.from.mockReturnValue({
                insert: jest.fn(() => ({
                    select: jest.fn(() => ({
                        single: jest.fn(() => ({
                            data: mockCreatedTask,
                            error: null
                        }))
                    }))
                }))
            } as any)

            const result = await createTask(mockUserId, mockTaskData)

            expect(result.success).toBe(true)
            expect(result.task).toBeDefined()
            expect(result.task!.title).toBe('New Task')
            expect(result.message).toBe('Задача успешно создана')
        })

        it('должен обработать ошибку создания задачи', async () => {
            const mockTaskData = {
                title: 'New Task',
                description: 'New Description',
                priority: 'medium' as const,
                estimatedMinutes: 60,
                tags: ['personal']
            }

            mockSupabase.from.mockReturnValue({
                insert: jest.fn(() => ({
                    select: jest.fn(() => ({
                        single: jest.fn(() => ({
                            data: null,
                            error: { message: 'Database error' }
                        }))
                    }))
                }))
            } as any)

            const result = await createTask(mockUserId, mockTaskData)

            expect(result.success).toBe(false)
            expect(result.error).toBe('Database error')
        })
    })

    describe('updateTask', () => {
        it('должен успешно обновить задачу', async () => {
            const mockUpdates = {
                title: 'Updated Task',
                priority: 'high' as const,
                status: 'in_progress' as const
            }

            const mockUpdatedTask = {
                id: mockTaskId,
                title: 'Updated Task',
                description: 'Updated Description',
                priority: 'high',
                status: 'in_progress',
                due_date: null,
                completed_at: null,
                estimated_minutes: 30,
                actual_minutes: null,
                source: 'manual',
                tags: [],
                user_id: mockUserId,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z'
            }

            mockSupabase.from.mockReturnValue({
                update: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        select: jest.fn(() => ({
                            single: jest.fn(() => ({
                                data: mockUpdatedTask,
                                error: null
                            }))
                        }))
                    }))
                }))
            } as any)

            const result = await updateTask(mockTaskId, mockUpdates)

            expect(result.success).toBe(true)
            expect(result.task).toBeDefined()
            expect(result.task!.title).toBe('Updated Task')
            expect(result.message).toBe('Задача успешно обновлена')
        })

        it('должен обработать ошибку обновления задачи', async () => {
            const mockUpdates = {
                title: 'Updated Task'
            }

            mockSupabase.from.mockReturnValue({
                update: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        select: jest.fn(() => ({
                            single: jest.fn(() => ({
                                data: null,
                                error: { message: 'Update error' }
                            }))
                        }))
                    }))
                }))
            } as any)

            const result = await updateTask(mockTaskId, mockUpdates)

            expect(result.success).toBe(false)
            expect(result.error).toBe('Update error')
        })
    })

    describe('deleteTask', () => {
        it('должен успешно удалить задачу', async () => {
            mockSupabase.from.mockReturnValue({
                delete: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        data: null,
                        error: null
                    }))
                }))
            } as any)

            const result = await deleteTask(mockTaskId)

            expect(result.success).toBe(true)
            expect(result.message).toBe('Задача успешно удалена')
        })

        it('должен обработать ошибку удаления задачи', async () => {
            mockSupabase.from.mockReturnValue({
                delete: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        data: null,
                        error: { message: 'Delete error' }
                    }))
                }))
            } as any)

            const result = await deleteTask(mockTaskId)

            expect(result.success).toBe(false)
            expect(result.error).toBe('Delete error')
        })
    })

    describe('completeTask', () => {
        it('должен успешно завершить задачу', async () => {
            const mockCompletedTask = {
                id: mockTaskId,
                title: 'Completed Task',
                description: 'Task Description',
                priority: 'medium',
                status: 'completed',
                due_date: null,
                completed_at: '2024-01-01T00:00:00Z',
                estimated_minutes: 30,
                actual_minutes: 25,
                source: 'manual',
                tags: [],
                user_id: mockUserId,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z'
            }

            mockSupabase.from.mockReturnValue({
                update: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        select: jest.fn(() => ({
                            single: jest.fn(() => ({
                                data: mockCompletedTask,
                                error: null
                            }))
                        }))
                    }))
                }))
            } as any)

            const result = await completeTask(mockTaskId, 25)

            expect(result.success).toBe(true)
            expect(result.task).toBeDefined()
            expect(result.task!.status).toBe('completed')
            expect(result.task!.actualMinutes).toBe(25)
            expect(result.message).toBe('Задача успешно завершена')
        })

        it('должен обработать ошибку завершения задачи', async () => {
            mockSupabase.from.mockReturnValue({
                update: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        select: jest.fn(() => ({
                            single: jest.fn(() => ({
                                data: null,
                                error: { message: 'Complete error' }
                            }))
                        }))
                    }))
                }))
            } as any)

            const result = await completeTask(mockTaskId)

            expect(result.success).toBe(false)
            expect(result.error).toBe('Complete error')
        })
    })

    describe('getTasksStats', () => {
        it('должен успешно получить статистику задач', async () => {
            const mockTasks = [
                { status: 'completed', due_date: null, completed_at: '2024-01-01T00:00:00Z', actual_minutes: 30 },
                { status: 'todo', due_date: '2030-01-02T00:00:00Z', completed_at: null, actual_minutes: null }, // future date
                { status: 'completed', due_date: null, completed_at: '2024-01-01T00:00:00Z', actual_minutes: 20 },
                { status: 'todo', due_date: '2023-12-31T00:00:00Z', completed_at: null, actual_minutes: null } // overdue
            ]

            mockSupabase.from.mockReturnValue({
                select: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        data: mockTasks,
                        error: null
                    }))
                }))
            } as any)

            const result = await getTasksStats(mockUserId)

            expect(result.success).toBe(true)
            expect(result.stats).toBeDefined()
            expect(result.stats!.total).toBe(4)
            expect(result.stats!.completed).toBe(2)
            expect(result.stats!.pending).toBe(2)
            expect(result.stats!.overdue).toBe(1)
            expect(result.stats!.completionRate).toBe(50)
        })

        it('должен обработать ошибку получения статистики', async () => {
            mockSupabase.from.mockReturnValue({
                select: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        data: null,
                        error: { message: 'Stats error' }
                    }))
                }))
            } as any)

            const result = await getTasksStats(mockUserId)

            expect(result.success).toBe(false)
            expect(result.error).toBe('Stats error')
        })
    })

    describe('syncTasks', () => {
        it('должен успешно синхронизировать задачи', async () => {
            const mockTasks = [
                {
                    id: '1',
                    title: 'Synced Task',
                    description: 'Synced Description',
                    priority: 'medium',
                    status: 'todo',
                    due_date: null,
                    completed_at: null,
                    estimated_minutes: 30,
                    actual_minutes: null,
                    tags: [],
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z'
                }
            ]

            mockSupabase.from.mockReturnValue({
                select: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        order: jest.fn(() => ({
                            data: mockTasks,
                            error: null
                        }))
                    }))
                }))
            } as any)

            const result = await syncTasks(mockUserId)

            expect(result.success).toBe(true)
            expect(result.tasks).toHaveLength(1)
            expect(result.message).toBe('Задачи успешно синхронизированы')
        })
    })
})
