// 🧪 Integration тесты для планировщика с Supabase
import PlannerPage from '@/app/planner/page'
import { useAuth } from '@/hooks/useAuth'
import * as tasksApi from '@/lib/tasks'
import { useAppStore } from '@/stores/useAppStore'
import { User, SubscriptionStatus } from '@/types'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

// Mock hooks
jest.mock('@/hooks/useAuth')
jest.mock('@/lib/tasks')

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockTasksApi = tasksApi as jest.Mocked<typeof tasksApi>

// Mock store
jest.mock('@/stores/useAppStore')
const mockUseAppStore = useAppStore as jest.MockedFunction<typeof useAppStore>

describe('Planner Integration with Supabase', () => {
    const mockUser: User = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        avatar: null,
        timezone: 'Europe/Moscow',
        subscription: 'free',
        subscriptionStatus: 'active',
        preferences: {
            workingHours: { start: '09:00', end: '18:00' },
            focusTime: 25,
            breakTime: 5,
            notifications: { email: true, push: true, desktop: true },
            aiCoaching: { enabled: true, frequency: 'medium', style: 'gentle' }
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
        tags: ['work'],
        createdAt: new Date(),
        updatedAt: new Date()
    }

    const mockStoreState = {
        tasks: [],
        addTask: jest.fn(),
        updateTask: jest.fn(),
        deleteTask: jest.fn(),
        pendingTasks: jest.fn(() => []),
        urgentTasks: jest.fn(() => []),
        completedTasksToday: jest.fn(() => []),
        loadTasks: jest.fn(),
        createTaskAsync: jest.fn(),
        updateTaskAsync: jest.fn(),
        deleteTaskAsync: jest.fn(),
        completeTaskAsync: jest.fn(),
        isLoading: false,
        error: null
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseAuth.mockReturnValue({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            requireAuth: jest.fn(),
            requireGuest: jest.fn()
        })

        mockUseAppStore.mockReturnValue(mockStoreState)
    })

    describe('Authentication', () => {
        it('должен показать экран входа для неавторизованных пользователей', () => {
            render(<PlannerPage />)

            expect(screen.getByText('ИИ-Планировщик')).toBeInTheDocument()
            expect(screen.getByText('Для доступа к планировщику необходимо войти в систему')).toBeInTheDocument()
            expect(screen.getByText('Войти в систему')).toBeInTheDocument()
        })

        it('должен показать планировщик для авторизованных пользователей', () => {
            mockUseAuth.mockReturnValue({
                user: mockUser,
                isLoading: false,
                isAuthenticated: true,
                requireAuth: jest.fn(),
                requireGuest: jest.fn()
            })

            render(<PlannerPage />)

            expect(screen.getByText('ИИ-Планировщик')).toBeInTheDocument()
            expect(screen.getByText('Превращаем хаос в систему')).toBeInTheDocument()
            expect(screen.getByText('Добавить задачу')).toBeInTheDocument()
        })
    })

    describe('Task Management', () => {
        beforeEach(() => {
            mockUseAuth.mockReturnValue({
                user: mockUser,
                isLoading: false,
                isAuthenticated: true,
                requireAuth: jest.fn(),
                requireGuest: jest.fn()
            })
        })

        it('должен загружать задачи при входе пользователя', () => {
            render(<PlannerPage />)

            expect(mockStoreState.loadTasks).toHaveBeenCalled()
        })

        it('должен показывать ошибки загрузки', () => {
            mockUseAppStore.mockReturnValue({
                ...mockStoreState,
                error: 'Ошибка загрузки задач'
            })

            render(<PlannerPage />)

            expect(screen.getByText('Ошибка загрузки задач')).toBeInTheDocument()
        })

        it('должен показывать состояние загрузки', () => {
            mockUseAppStore.mockReturnValue({
                ...mockStoreState,
                isLoading: true
            })

            render(<PlannerPage />)

            expect(screen.getByText('Добавить задачу')).toBeDisabled()
        })
    })

    describe('Add Task Modal', () => {
        beforeEach(() => {
            mockUseAuth.mockReturnValue({
                user: mockUser,
                isLoading: false,
                isAuthenticated: true,
                requireAuth: jest.fn(),
                requireGuest: jest.fn()
            })
        })

        it('должен открывать модал добавления задачи', () => {
            render(<PlannerPage />)

            fireEvent.click(screen.getByText('Добавить задачу'))

            expect(screen.getByText('Добавить задачу')).toBeInTheDocument()
            expect(screen.getByPlaceholderText('Что нужно сделать?')).toBeInTheDocument()
        })

        it('должен закрывать модал при нажатии отмены', () => {
            render(<PlannerPage />)

            fireEvent.click(screen.getByText('Добавить задачу'))
            fireEvent.click(screen.getByText('Отмена'))

            expect(screen.queryByPlaceholderText('Что нужно сделать?')).not.toBeInTheDocument()
        })

        it('должен создавать задачу через Supabase', async () => {
            mockStoreState.createTaskAsync.mockResolvedValue(undefined)

            render(<PlannerPage />)

            fireEvent.click(screen.getByText('Добавить задачу'))

            fireEvent.change(screen.getByPlaceholderText('Что нужно сделать?'), {
                target: { value: 'New Task' }
            })

            fireEvent.change(screen.getByPlaceholderText('Дополнительные детали...'), {
                target: { value: 'Task Description' }
            })

            fireEvent.click(screen.getByText('Добавить'))

            await waitFor(() => {
                expect(mockStoreState.createTaskAsync).toHaveBeenCalledWith({
                    title: 'New Task',
                    description: 'Task Description',
                    priority: 'medium',
                    dueDate: undefined,
                    estimatedMinutes: 30,
                    tags: []
                })
            })
        })

        it('должен показывать ошибки валидации', async () => {
            render(<PlannerPage />)

            fireEvent.click(screen.getByText('Добавить задачу'))
            fireEvent.click(screen.getByText('Добавить'))

            await waitFor(() => {
                expect(screen.getByText('Исправьте ошибки:')).toBeInTheDocument()
            })
        })

        it('должен показывать ошибку для неавторизованных пользователей', async () => {
            mockUseAuth.mockReturnValue({
                user: null,
                isLoading: false,
                isAuthenticated: false,
                requireAuth: jest.fn(),
                requireGuest: jest.fn()
            })

            render(<PlannerPage />)

            // Попытка добавить задачу без авторизации
            fireEvent.click(screen.getByText('Войти в систему'))
        })
    })

    describe('Task Actions', () => {
        beforeEach(() => {
            mockUseAuth.mockReturnValue({
                user: mockUser,
                isLoading: false,
                isAuthenticated: true,
                requireAuth: jest.fn(),
                requireGuest: jest.fn()
            })

            mockUseAppStore.mockReturnValue({
                ...mockStoreState,
                tasks: [mockTask],
                pendingTasks: jest.fn(() => [mockTask]),
                urgentTasks: jest.fn(() => [mockTask])
            })
        })

        it('должен завершать задачу через Supabase', async () => {
            mockStoreState.completeTaskAsync.mockResolvedValue(undefined)

            render(<PlannerPage />)

            const taskCheckbox = screen.getByRole('button', { name: /toggle task/i })
            fireEvent.click(taskCheckbox)

            await waitFor(() => {
                expect(mockStoreState.completeTaskAsync).toHaveBeenCalledWith(mockTask.id, mockTask.estimatedMinutes)
            })
        })

        it('должен удалять задачу через Supabase', async () => {
            mockStoreState.deleteTaskAsync.mockResolvedValue(undefined)

            render(<PlannerPage />)

            const deleteButton = screen.getByTitle('Удалить задачу')
            fireEvent.click(deleteButton)

            await waitFor(() => {
                expect(mockStoreState.deleteTaskAsync).toHaveBeenCalledWith(mockTask.id)
            })
        })
    })

    describe('Task Display', () => {
        beforeEach(() => {
            mockUseAuth.mockReturnValue({
                user: mockUser,
                isLoading: false,
                isAuthenticated: true,
                requireAuth: jest.fn(),
                requireGuest: jest.fn()
            })
        })

        it('должен показывать срочные задачи', () => {
            mockUseAppStore.mockReturnValue({
                ...mockStoreState,
                urgentTasks: jest.fn(() => [mockTask])
            })

            render(<PlannerPage />)

            expect(screen.getByText('Срочно')).toBeInTheDocument()
            expect(screen.getByText('Test Task')).toBeInTheDocument()
        })

        it('должен показывать задачи в работе', () => {
            mockUseAppStore.mockReturnValue({
                ...mockStoreState,
                pendingTasks: jest.fn(() => [mockTask])
            })

            render(<PlannerPage />)

            expect(screen.getByText('В работе')).toBeInTheDocument()
            expect(screen.getByText('Test Task')).toBeInTheDocument()
        })

        it('должен показывать выполненные задачи', () => {
            const completedTask = { ...mockTask, status: 'completed' as const }

            mockUseAppStore.mockReturnValue({
                ...mockStoreState,
                completedTasksToday: jest.fn(() => [completedTask])
            })

            render(<PlannerPage />)

            expect(screen.getByText('Выполнено сегодня')).toBeInTheDocument()
            expect(screen.getByText('Test Task')).toBeInTheDocument()
        })

        it('должен показывать пустые состояния', () => {
            render(<PlannerPage />)

            expect(screen.getByText('🎉 Нет срочных задач')).toBeInTheDocument()
            expect(screen.getByText('✨ Добавьте первую задачу')).toBeInTheDocument()
            expect(screen.getByText('🎯 Пока ничего не выполнено')).toBeInTheDocument()
        })
    })

    describe('Error Handling', () => {
        beforeEach(() => {
            mockUseAuth.mockReturnValue({
                user: mockUser,
                isLoading: false,
                isAuthenticated: true,
                requireAuth: jest.fn(),
                requireGuest: jest.fn()
            })
        })

        it('должен обрабатывать ошибки API', async () => {
            mockStoreState.createTaskAsync.mockRejectedValue(new Error('API Error'))

            render(<PlannerPage />)

            fireEvent.click(screen.getByText('Добавить задачу'))

            fireEvent.change(screen.getByPlaceholderText('Что нужно сделать?'), {
                target: { value: 'New Task' }
            })

            fireEvent.click(screen.getByText('Добавить'))

            await waitFor(() => {
                expect(screen.getByText('Исправьте ошибки:')).toBeInTheDocument()
            })
        })
    })
})
