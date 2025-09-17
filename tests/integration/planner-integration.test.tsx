import { testFramework, testLogger, testMocks, testUtils } from '../framework'

/**
 * 🧪 Мигрирован с помощью единого фреймворка тестирования
 * 
 * Автоматически мигрирован: 2025-09-16T21:33:45.030Z
 * Оригинальный файл сохранен как: tests/integration/planner-integration.test.tsx.backup
 * 
 * ВАЖНО: Все новые тесты должны использовать единый фреймворк!
 * См. документацию: tests/docs/TESTING_FRAMEWORK.md
 */

// 🧪 Integration тесты для планировщика с Supabase
import PlannerPage from '@/app/planner/page'
import { useAuth } from '@/hooks/useAuth'
import * as tasksApi from '@/lib/tasks'
import { useAppStore } from '@/stores/useAppStore'
import { User } from '@/types'
import { fireEvent, screen } from '@testing-library/react'
import { MOCK_CONFIGS, TEST_CONFIGS } from '../framework'

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
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        name: 'Test User',
        avatar: undefined,
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
        id: '550e8400-e29b-41d4-a716-446655440001',
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
        // Настройка единого фреймворка тестирования
        testFramework.updateConfig(TEST_CONFIGS.INTEGRATION)
        testMocks.updateConfig(MOCK_CONFIGS.FULL)
        testMocks.setupAllMocks()
        testLogger.startTest('Integration Tests')
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
        it('должен показать экран входа для неавторизованных пользователей', async () => {
            await testUtils.act(async () => {
                testUtils.renderWithProviders(<PlannerPage />)
            })

            expect(screen.getByText('ИИ-Планировщик')).toBeTruthy()
            expect(screen.getByText('Для доступа к планировщику необходимо войти в систему')).toBeTruthy()
            expect(screen.getByText('Войти в систему')).toBeTruthy()
        })

        it('должен показать планировщик для авторизованных пользователей', async () => {
            mockUseAuth.mockReturnValue({
                user: mockUser,
                isLoading: false,
                isAuthenticated: true,
                requireAuth: jest.fn(),
                requireGuest: jest.fn()
            })

            await testUtils.act(async () => {
                testUtils.renderWithProviders(<PlannerPage />)
            })

            expect(screen.getByText('ИИ-Планировщик')).toBeTruthy()
            expect(screen.getByText('Превращаем хаос в систему')).toBeTruthy()
            expect(screen.getByText('Добавить задачу')).toBeTruthy()
        })
    })

    describe('Task Management', () => {
        beforeEach(() => {
            // Настройка единого фреймворка тестирования
            testFramework.updateConfig(TEST_CONFIGS.INTEGRATION)
            testMocks.updateConfig(MOCK_CONFIGS.FULL)
            testMocks.setupAllMocks()
            testLogger.startTest('Integration Tests')
            mockUseAuth.mockReturnValue({
                user: mockUser,
                isLoading: false,
                isAuthenticated: true,
                requireAuth: jest.fn(),
                requireGuest: jest.fn()
            })
        })

        it('должен загружать задачи при входе пользователя', async () => {
            await testUtils.act(async () => {
                testUtils.renderWithProviders(<PlannerPage />)
            })

            expect(mockStoreState.loadTasks).toHaveBeenCalled()
        })

        it('должен показывать ошибки загрузки', async () => {
            mockUseAppStore.mockReturnValue({
                ...mockStoreState,
                error: 'Ошибка загрузки задач'
            })

            await testUtils.act(async () => {
                testUtils.renderWithProviders(<PlannerPage />)
            })

            expect(screen.getByText('Ошибка загрузки задач')).toBeTruthy()
        })

        it('должен показывать состояние загрузки', async () => {
            mockUseAppStore.mockReturnValue({
                ...mockStoreState,
                isLoading: true
            })

            await testUtils.act(async () => {
                testUtils.renderWithProviders(<PlannerPage />)

            })

            expect(screen.getByText('Добавить задачу')).toBeDisabled()
        })
    })

    describe('Add Task Modal', () => {
        beforeEach(() => {
            // Настройка единого фреймворка тестирования
            testFramework.updateConfig(TEST_CONFIGS.INTEGRATION)
            testMocks.updateConfig(MOCK_CONFIGS.FULL)
            testMocks.setupAllMocks()
            testLogger.startTest('Integration Tests')
            mockUseAuth.mockReturnValue({
                user: mockUser,
                isLoading: false,
                isAuthenticated: true,
                requireAuth: jest.fn(),
                requireGuest: jest.fn()
            })
        })

        it('должен открывать модал добавления задачи', async () => {
            await testUtils.act(async () => {
                testUtils.renderWithProviders(<PlannerPage />)

            })

            fireEvent.click(screen.getByRole('button', { name: 'Добавить задачу' }))

            expect(screen.getByRole('heading', { name: 'Добавить задачу' })).toBeTruthy()
            expect(screen.getByPlaceholderText('Что нужно сделать?')).toBeTruthy()
        })

        it('должен закрывать модал при нажатии отмены', async () => {
            await testUtils.act(async () => {
                testUtils.renderWithProviders(<PlannerPage />)

            })

            fireEvent.click(screen.getByText('Добавить задачу'))
            fireEvent.click(screen.getByText('Отмена'))

            expect(screen.queryByPlaceholderText('Что нужно сделать?')).not.toBeTruthy()
        })

        it('должен создавать задачу через Supabase', async () => {
            mockStoreState.createTaskAsync.mockResolvedValue(undefined)

            await testUtils.act(async () => {
                testUtils.renderWithProviders(<PlannerPage />)

            })

            fireEvent.click(screen.getByText('Добавить задачу'))

            fireEvent.change(screen.getByPlaceholderText('Что нужно сделать?'), {
                target: { value: 'New Task' }
            })

            fireEvent.change(screen.getByPlaceholderText('Дополнительные детали...'), {
                target: { value: 'Task Description' }
            })

            fireEvent.click(screen.getByText('Добавить'))

            await testUtils.waitForState(() => {
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
            await testUtils.act(async () => {
                testUtils.renderWithProviders(<PlannerPage />)

            })

            fireEvent.click(screen.getByText('Добавить задачу'))
            fireEvent.click(screen.getByText('Добавить'))

            await testUtils.waitForState(() => {
                expect(screen.getByText('Исправьте ошибки:')).toBeTruthy()
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

            await testUtils.act(async () => {
                testUtils.renderWithProviders(<PlannerPage />)

            })

            // Попытка добавить задачу без авторизации
            fireEvent.click(screen.getByText('Войти в систему'))
        })
    })

    describe('Task Actions', () => {
        beforeEach(() => {
            // Настройка единого фреймворка тестирования
            testFramework.updateConfig(TEST_CONFIGS.INTEGRATION)
            testMocks.updateConfig(MOCK_CONFIGS.FULL)
            testMocks.setupAllMocks()
            testLogger.startTest('Integration Tests')
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

            await testUtils.act(async () => {
                testUtils.renderWithProviders(<PlannerPage />)

            })

            const taskCheckbox = screen.getAllByRole('button', { name: /toggle task test task/i })[0]
            fireEvent.click(taskCheckbox)

            await testUtils.waitForState(() => {
                expect(mockStoreState.completeTaskAsync).toHaveBeenCalledWith(mockTask.id, mockTask.estimatedMinutes)
            })
        })

        it('должен удалять задачу через Supabase', async () => {
            mockStoreState.deleteTaskAsync.mockResolvedValue(undefined)

            await testUtils.act(async () => {
                testUtils.renderWithProviders(<PlannerPage />)

            })

            const deleteButton = screen.getAllByTitle('Удалить задачу')[0]
            fireEvent.click(deleteButton)

            await testUtils.waitForState(() => {
                expect(mockStoreState.deleteTaskAsync).toHaveBeenCalledWith(mockTask.id)
            })
        })
    })

    describe('Task Display', () => {
        beforeEach(() => {
            // Настройка единого фреймворка тестирования
            testFramework.updateConfig(TEST_CONFIGS.INTEGRATION)
            testMocks.updateConfig(MOCK_CONFIGS.FULL)
            testMocks.setupAllMocks()
            testLogger.startTest('Integration Tests')
            mockUseAuth.mockReturnValue({
                user: mockUser,
                isLoading: false,
                isAuthenticated: true,
                requireAuth: jest.fn(),
                requireGuest: jest.fn()
            })
        })

        it('должен показывать срочные задачи', async () => {
            mockUseAppStore.mockReturnValue({
                ...mockStoreState,
                urgentTasks: jest.fn(() => [mockTask])
            })

            await testUtils.act(async () => {
                testUtils.renderWithProviders(<PlannerPage />)

            })

            expect(screen.getByText('Срочно')).toBeTruthy()
            expect(screen.getByText('Test Task')).toBeTruthy()
        })

        it('должен показывать задачи в работе', async () => {
            mockUseAppStore.mockReturnValue({
                ...mockStoreState,
                pendingTasks: jest.fn(() => [mockTask])
            })

            await testUtils.act(async () => {
                testUtils.renderWithProviders(<PlannerPage />)

            })

            expect(screen.getByText('В работе')).toBeTruthy()
            expect(screen.getByText('Test Task')).toBeTruthy()
        })

        it('должен показывать выполненные задачи', async () => {
            const completedTask = { ...mockTask, status: 'completed' as const }

            mockUseAppStore.mockReturnValue({
                ...mockStoreState,
                completedTasksToday: jest.fn(() => [completedTask])
            })

            await testUtils.act(async () => {
                testUtils.renderWithProviders(<PlannerPage />)

            })

            expect(screen.getByText('Выполнено сегодня')).toBeTruthy()
            expect(screen.getByText('Test Task')).toBeTruthy()
        })

        it('должен показывать пустые состояния', async () => {
            await testUtils.act(async () => {
                testUtils.renderWithProviders(<PlannerPage />)

            })

            expect(screen.getByText('🎉 Нет срочных задач')).toBeTruthy()
            expect(screen.getByText('✨ Добавьте первую задачу')).toBeTruthy()
            expect(screen.getByText('🎯 Пока ничего не выполнено')).toBeTruthy()
        })
    })

    describe('Error Handling', () => {
        beforeEach(() => {
            // Настройка единого фреймворка тестирования
            testFramework.updateConfig(TEST_CONFIGS.INTEGRATION)
            testMocks.updateConfig(MOCK_CONFIGS.FULL)
            testMocks.setupAllMocks()
            testLogger.startTest('Integration Tests')
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

            await testUtils.act(async () => {
                testUtils.renderWithProviders(<PlannerPage />)

            })

            fireEvent.click(screen.getByText('Добавить задачу'))

            fireEvent.change(screen.getByPlaceholderText('Что нужно сделать?'), {
                target: { value: 'New Task' }
            })

            fireEvent.click(screen.getByText('Добавить'))

            await testUtils.waitForState(() => {
                expect(screen.getByText('Произошла ошибка при добавлении задачи')).toBeTruthy()
            })
        })
    })
})
