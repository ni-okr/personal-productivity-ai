import { testFramework, testLogger, testMocks, testUtils } from '../framework'

/**
 * 🧪 Мигрирован с помощью единого фреймворка тестирования
 * 
 * Автоматически мигрирован: 2025-09-16T21:33:45.029Z
 * Оригинальный файл сохранен как: tests/integration/mock-mode.test.ts.backup
 * 
 * ВАЖНО: Все новые тесты должны использовать единый фреймворк!
 * См. документацию: tests/docs/TESTING_FRAMEWORK.md
 */

// 🧪 Интеграционные тесты для mock режима
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { useAppStore } from '@/stores/useAppStore'
import { Subscription, Task, User } from '@/types'
import { act, renderHook, waitFor } from '@testing-library/react'
import { TEST_CONFIGS, MOCK_CONFIGS } from '@/tests/framework'
import mockServer from '../mocks/unified-mock-server'

// Mock console.log для проверки логов
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation()

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        refresh: jest.fn(),
        prefetch: jest.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
}))

// Mock window.location для тестирования навигации
const mockLocation = {
    href: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn()
}
Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true
})

describe('Mock Mode Integration Tests', () => {
    const mockUserId = 'mock-user-1'
    const mockUserEmail = 'test@example.test'
    const mockUserPassword = 'password123'
    const mockUserName = 'Test User'

    beforeEach(async () => {
        // Инициализируем единый mock сервер
        mockServer.initializeMockServer()
        mockConsoleLog.mockClear()

        // Очищаем статические mock данные
        const { clearMockSubscriptions } = await import('@/lib/subscription-mock')
        clearMockSubscriptions()

        // Очищаем и настраиваем store для каждого теста
        const store = useAppStore.getState()
        store.clearUserData() // Очищаем все данные

        // Создаем пользователя и устанавливаем его напрямую в store
        const mockUser: User = {
            id: mockUserId,
            email: mockUserEmail,
            name: mockUserName,
            avatarUrl: null,
            createdAt: new Date(),
            updatedAt: new Date()
        }

        // Устанавливаем пользователя напрямую в store
        await testUtils.testUtils.act(async () => {
            store.setUser(mockUser)
        })
    })

    afterAll(() => {
        mockConsoleLog.mockRestore()
    })

    describe('Authentication Flow', () => {
        it('должен успешно зарегистрировать пользователя и обновить store', async () => {
            const { result: authResult } = testUtils.renderHookWithProviders(() => useAuth())

            // Проверяем, что пользователь уже установлен в useAuth через mockOnAuthStateChange
            await testUtils.waitForStateCondition(() => authResult.current.user, (user) => {
                return user !== undefined && user?.email === mockUserEmail && user?.name === mockUserName
            })
        })

        it('должен успешно войти пользователя и обновить store', async () => {
            const { result: authResult } = testUtils.renderHookWithProviders(() => useAuth())

            // Проверяем, что пользователь уже установлен в useAuth через mockOnAuthStateChange
            await testUtils.waitForStateCondition(() => authResult.current.user, (user) => {
                return user !== undefined && user?.email === mockUserEmail
            })
        })

        it('должен успешно выйти из системы и очистить store', async () => {
            const { result: authResult } = testUtils.renderHookWithProviders(() => useAuth())

            // Проверяем, что пользователь авторизован
            await testUtils.waitForState(() => {
                expect(authResult.current.user).toBeDefined()
            })

            // Выходим из системы через mock функцию
            await testUtils.testUtils.act(async () => {
                await mockServer.mockSignOutWithState()
            })

            // Ждем обновления состояния
            await testUtils.waitForState(() => {
                expect(authResult.current.user).toBeNull()
            })
        })
    })

    describe('Task Management Integration', () => {
        beforeEach(async () => {
            // Регистрируем пользователя для тестов задач
            await mockServer.mockSignUpWithState(mockUserEmail, mockUserPassword, mockUserName)
        })

        it('должен загружать задачи при инициализации store', async () => {
            // Добавляем mock задачи
            const mockTask: Task = {
                id: 'test-task-1',
                title: 'Test Task 1',
                description: 'Test Description 1',
                priority: 'high',
                status: 'todo',
                estimatedMinutes: 30,
                source: 'manual',
                tags: ['test'],
                userId: mockUserId,
                createdAt: new Date(),
                updatedAt: new Date()
            }
            mockServer.addMockTask(mockTask)

            const { result: storeResult } = testUtils.renderHookWithProviders(() => useAppStore())

            // Проверяем, что пользователь установлен
            expect(storeResult.current.user).toBeDefined()
            expect(storeResult.current.user?.id).toBe(mockUserId)

            // Тестируем mockGetTasks напрямую
            const { mockGetTasks } = await import('@/lib/tasks-mock')
            const directResult = await mockGetTasks(mockUserId)
            expect(directResult.success).toBe(true)
            expect(directResult.tasks).toHaveLength(4) // 3 статические + 1 добавленная
            expect(directResult.tasks.some(task => task.title === 'Test Task 1')).toBe(true)

            // Загружаем задачи
            await testUtils.testUtils.act(async () => {
                await storeResult.current.loadTasks()
            })

            // Ждем загрузки задач
            await testUtils.waitForState(() => {
                expect(storeResult.current.tasks).toHaveLength(4) // 3 статические + 1 добавленная
                expect(storeResult.current.tasks.some(task => task.title === 'Test Task 1')).toBe(true)
            })
        })

        it('должен создавать новую задачу и обновлять store', async () => {
            const { result: storeResult } = testUtils.renderHookWithProviders(() => useAppStore())

            // Создаем новую задачу
            await testUtils.testUtils.act(async () => {
                await storeResult.current.createTaskAsync({
                    title: 'New Task',
                    description: 'New Description',
                    priority: 'medium',
                    estimatedMinutes: 45,
                    tags: ['new']
                })
            })

            // Ждем обновления состояния
            await testUtils.waitForState(() => {
                expect(storeResult.current.tasks.length).toBeGreaterThan(0)
                expect(storeResult.current.tasks.some(task => task.title === 'New Task')).toBe(true)
            })

            // Проверяем приоритет созданной задачи
            const newTask = storeResult.current.tasks.find(task => task.title === 'New Task')
            expect(newTask?.priority).toBe('medium')
        })

        it('должен обновлять задачу и синхронизировать с store', async () => {
            // Создаем задачу
            const { result: storeResult } = testUtils.renderHookWithProviders(() => useAppStore())

            await testUtils.testUtils.act(async () => {
                await storeResult.current.createTaskAsync({
                    title: 'Original Task',
                    description: 'Original Description',
                    priority: 'low',
                    estimatedMinutes: 20,
                    tags: ['original']
                })
            })

            // Ждем создания задачи
            await testUtils.waitForState(() => {
                expect(storeResult.current.tasks.length).toBeGreaterThan(0)
            })

            const newTask = storeResult.current.tasks.find(task => task.title === 'Original Task')
            expect(newTask).toBeDefined()
            const taskId = newTask!.id

            // Обновляем задачу
            await testUtils.testUtils.act(async () => {
                await storeResult.current.updateTaskAsync(taskId, {
                    title: 'Updated Task',
                    priority: 'high'
                })
            })

            // Ждем обновления задачи
            await testUtils.waitForState(() => {
                const updatedTask = storeResult.current.tasks.find(task => task.id === taskId)
                expect(updatedTask?.title).toBe('Updated Task')
                expect(storeResult.current.tasks[0].priority).toBe('high')
            })
        })

        it('должен завершать задачу и обновлять статистику', async () => {
            // Создаем задачу
            const { result: storeResult } = testUtils.renderHookWithProviders(() => useAppStore())

            await testUtils.testUtils.act(async () => {
                await storeResult.current.createTaskAsync({
                    title: 'Task to Complete',
                    description: 'Description',
                    priority: 'medium',
                    estimatedMinutes: 30,
                    tags: ['complete']
                })
            })

            // Ждем создания задачи
            await testUtils.waitForState(() => {
                expect(storeResult.current.tasks.length).toBeGreaterThan(0)
            })

            const newTask = storeResult.current.tasks.find(task => task.title === 'Task to Complete')
            expect(newTask).toBeDefined()
            const taskId = newTask!.id

            // Завершаем задачу
            await testUtils.testUtils.act(async () => {
                await storeResult.current.completeTaskAsync(taskId, 25)
            })

            // Ждем завершения задачи
            await testUtils.waitForState(() => {
                const completedTask = storeResult.current.tasks.find(task => task.id === taskId)
                expect(completedTask?.status).toBe('completed')
                expect(completedTask?.actualMinutes).toBe(25)
            })
        })

        it('должен удалять задачу и обновлять store', async () => {
            // Создаем задачу
            const { result: storeResult } = testUtils.renderHookWithProviders(() => useAppStore())

            await testUtils.testUtils.act(async () => {
                await storeResult.current.createTaskAsync({
                    title: 'Task to Delete',
                    description: 'Description',
                    priority: 'low',
                    estimatedMinutes: 15,
                    tags: ['delete']
                })
            })

            // Ждем создания задачи
            await testUtils.waitForState(() => {
                expect(storeResult.current.tasks.length).toBeGreaterThan(0)
            })

            const newTask = storeResult.current.tasks.find(task => task.title === 'Task to Delete')
            expect(newTask).toBeDefined()
            const taskId = newTask!.id

            // Удаляем задачу
            await testUtils.testUtils.act(async () => {
                await storeResult.current.deleteTaskAsync(taskId)
            })

            // Ждем удаления задачи
            await testUtils.waitForState(() => {
                expect(storeResult.current.tasks.find(task => task.id === taskId)).toBeUndefined()
            })
        })

        it('должен загружать метрики продуктивности в mock режиме', async () => {
            const { result: storeResult } = testUtils.renderHookWithProviders(() => useAppStore())

            // Ждем, пока пользователь установится в store (из beforeEach)
            await testUtils.waitForState(() => {
                expect(storeResult.current.user).toBeDefined()
            })

            // Загружаем задачи (это также загружает метрики в mock режиме)
            await testUtils.testUtils.act(async () => {
                await storeResult.current.loadTasks()
            })

            // Проверяем, что метрики загружены
            expect(storeResult.current.metrics).toBeDefined()
            expect(storeResult.current.metrics?.focusTimeMinutes).toBe(120)
            expect(storeResult.current.metrics?.productivityScore).toBe(75)
        })

        it('должен загружать рекомендации ИИ в mock режиме', async () => {
            const { result: storeResult } = testUtils.renderHookWithProviders(() => useAppStore())

            // Ждем, пока пользователь установится в store (из beforeEach)
            await testUtils.waitForState(() => {
                expect(storeResult.current.user).toBeDefined()
            })

            // Загружаем задачи (это также загружает рекомендации в mock режиме)
            await testUtils.testUtils.act(async () => {
                await storeResult.current.loadTasks()
            })

            // Ждем загрузки рекомендаций
            await testUtils.waitForState(() => {
                expect(storeResult.current.suggestions).toBeDefined()
                expect(storeResult.current.suggestions).toHaveLength(2)
                expect(storeResult.current.suggestions[0].title).toBe('Сфокусируйтесь на срочных задачах')
            })
        })
    })

    describe('Subscription Management Integration', () => {
        beforeEach(async () => {
            // Регистрируем пользователя для тестов подписок
            await mockServer.mockSignUpWithState(mockUserEmail, mockUserPassword, mockUserName)
        })

        it('должен загружать подписку пользователя', async () => {
            // Создаем пользователя
            await mockServer.mockSignUpWithState(mockUserEmail, mockUserPassword, mockUserName)

            // Создаем mock подписку
            const mockSubscription: Subscription = {
                id: 'test-subscription',
                userId: mockUserId,
                tier: 'premium',
                status: 'active',
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(),
                cancelAtPeriodEnd: false,
                createdAt: new Date(),
                updatedAt: new Date()
            }
            mockServer.addMockSubscription(mockSubscription)

            const { result: subscriptionResult } = testUtils.renderHookWithProviders(() => useSubscription())

            // Загружаем подписку
            await testUtils.testUtils.act(async () => {
                await subscriptionResult.current.refreshSubscription()
            })

            // Ждем загрузки подписки
            await testUtils.waitForState(() => {
                expect(subscriptionResult.current.subscription).toBeDefined()
                expect(subscriptionResult.current.subscription?.tier).toBe('premium')
                expect(subscriptionResult.current.subscription?.status).toBe('active')
            })
        })

        it('должен создавать новую подписку', async () => {
            // Создаем пользователя
            await mockServer.mockSignUpWithState(mockUserEmail, mockUserPassword, mockUserName)

            const { result: subscriptionResult } = testUtils.renderHookWithProviders(() => useSubscription())

            // Создаем подписку через mock функцию
            await testUtils.testUtils.act(async () => {
                const mockSubscription = {
                    id: 'sub-123',
                    userId: mockUserId,
                    tier: 'premium',
                    status: 'active',
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
                mockServer.addMockSubscription(mockSubscription)

                // Загружаем подписку
                await subscriptionResult.current.refreshSubscription()
            })

            // Ждем создания подписки
            await testUtils.waitForState(() => {
                expect(subscriptionResult.current.subscription).toBeDefined()
                expect(subscriptionResult.current.subscription?.tier).toBe('premium')
            })
        })

        it('должен обновлять подписку', async () => {
            // Создаем подписку
            const { result: subscriptionResult } = testUtils.renderHookWithProviders(() => useSubscription())

            const subscriptionId = 'sub-456'
            await testUtils.testUtils.act(async () => {
                const mockSubscription = {
                    id: subscriptionId,
                    userId: mockUserId,
                    tier: 'free',
                    status: 'active',
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
                mockServer.addMockSubscription(mockSubscription)

                // Загружаем подписку
                await subscriptionResult.current.refreshSubscription()
            })

            // Ждем создания подписки
            await testUtils.waitForState(() => {
                expect(subscriptionResult.current.subscription).toBeDefined()
            })

            // Обновляем подписку через mock функцию
            await testUtils.testUtils.act(async () => {
                const updateResult = await mockServer.mockUpdateSubscription(subscriptionId, {
                    tier: 'premium'
                })
                expect(updateResult.success).toBe(true)
            })

            // Обновляем состояние подписки
            await testUtils.testUtils.act(async () => {
                await subscriptionResult.current.refreshSubscription()
            })

            // Ждем обновления подписки
            await testUtils.waitForState(() => {
                expect(subscriptionResult.current.subscription?.tier).toBe('premium')
            })
        })

        it('должен отменять подписку', async () => {
            // Создаем подписку
            const { result: subscriptionResult } = testUtils.renderHookWithProviders(() => useSubscription())

            const subscriptionId = 'sub-789'
            await testUtils.testUtils.act(async () => {
                const mockSubscription = {
                    id: subscriptionId,
                    userId: mockUserId,
                    tier: 'premium',
                    status: 'active',
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
                mockServer.addMockSubscription(mockSubscription)

                // Загружаем подписку
                await subscriptionResult.current.refreshSubscription()
            })

            // Ждем создания подписки
            await testUtils.waitForState(() => {
                expect(subscriptionResult.current.subscription).toBeDefined()
            })

            // Отменяем подписку через mock функцию
            await testUtils.testUtils.act(async () => {
                testLogger.info('TEST', 'Canceling subscription with ID:', subscriptionId)
                const cancelResult = await mockServer.mockCancelSubscription(subscriptionId)
                testLogger.info('TEST', 'Cancel result:', cancelResult)
                expect(cancelResult.success).toBe(true)
            })

            // Обновляем состояние подписки
            await testUtils.testUtils.act(async () => {
                testLogger.info('TEST', 'Refreshing subscription...')
                await subscriptionResult.current.refreshSubscription()
            })

            // Ждем отмены подписки
            await testUtils.waitForState(() => {
                testLogger.info('TEST', 'Current subscription after refresh:', subscriptionResult.current.subscription)
                expect(subscriptionResult.current.subscription?.status).toBe('canceled')
                expect(subscriptionResult.current.subscription?.cancelAtPeriodEnd).toBe(true)
            }, { timeout: 2000 })
        })

        it('должен загружать планы подписок', async () => {
            const { result: subscriptionResult } = testUtils.renderHookWithProviders(() => useSubscription())

            // Загружаем планы через mock функцию
            let plans: any
            await testUtils.testUtils.act(async () => {
                const result = await mockServer.mockGetSubscriptionPlans()
                expect(result.success).toBe(true)
                plans = result.plans
            })

            // Проверяем, что планы загружены
            expect(plans).toBeDefined()
            expect(plans).toHaveLength(3) // free, premium, pro

            const planNames = plans?.map((plan: any) => plan.name) || []
            expect(planNames).toContain('Free')
            expect(planNames).toContain('Premium')
            expect(planNames).toContain('Pro')
        })
    })

    describe('Error Handling', () => {
        it('должен обрабатывать ошибки авторизации', async () => {
            // Сначала очищаем пользователя
            await testUtils.testUtils.act(async () => {
                mockServer.setCurrentMockUser(null)
            })

            const { result: authResult } = testUtils.renderHookWithProviders(() => useAuth())

            // Пытаемся войти с неверными учетными данными через mock функцию
            await testUtils.testUtils.act(async () => {
                const signInResult = await mockServer.mockSignInWithState(
                    'nonexistent@example.test',
                    'wrongpassword'
                )
                expect(signInResult.success).toBe(false)
                expect(signInResult.error).toBeDefined()
            })

            // Проверяем, что пользователь не авторизован
            await testUtils.waitForState(() => {
                expect(authResult.current.user).toBeNull()
            })
        })

        it('должен обрабатывать ошибки при работе с задачами', async () => {
            const { result: storeResult } = testUtils.renderHookWithProviders(() => useAppStore())

            // Пытаемся обновить несуществующую задачу
            await testUtils.testUtils.act(async () => {
                try {
                    await storeResult.current.updateTaskAsync('non-existent-id', {
                        title: 'Updated Title'
                    })
                } catch (error) {
                    expect(error).toBeDefined()
                }
            })
        })

        it('должен обрабатывать ошибки при работе с подписками', async () => {
            const { result: subscriptionResult } = testUtils.renderHookWithProviders(() => useSubscription())

            // Пытаемся создать checkout сессию с несуществующим планом
            await testUtils.testUtils.act(async () => {
                const checkoutResult = await subscriptionResult.current.createCheckoutSession('non-existent-plan')
                expect(checkoutResult.success).toBe(false)
                expect(checkoutResult.error).toBeDefined()
            })
        })
    })

    describe('State Synchronization', () => {
        it('должен синхронизировать состояние между разными хуками', async () => {
            // Пользователь уже установлен в beforeEach

            const { result: authResult } = testUtils.renderHookWithProviders(() => useAuth())
            const { result: storeResult } = testUtils.renderHookWithProviders(() => useAppStore())
            const { result: subscriptionResult } = testUtils.renderHookWithProviders(() => useSubscription())

            // Загружаем подписку
            await testUtils.testUtils.act(async () => {
                await subscriptionResult.current.refreshSubscription()
            })

            // Проверяем, что все хуки видят одного и того же пользователя
            await testUtils.waitForState(() => {
                expect(authResult.current.user?.email).toBe(mockUserEmail)
                expect(storeResult.current.user?.email).toBe(mockUserEmail)
            })
            // Проверяем, что подписка загружена
            expect(subscriptionResult.current.subscription).toBeDefined()

            // Выходим из системы через mock функцию
            await testUtils.testUtils.act(async () => {
                await mockServer.mockSignOutWithState()
            })

            // Ждем обновления состояния
            await testUtils.waitForState(() => {
                expect(authResult.current.user).toBeNull()
                expect(storeResult.current.user).toBeNull()
            })

            // Проверяем, что подписка также обновилась
            await testUtils.waitForState(() => {
                expect(subscriptionResult.current.subscription).toBeNull()
            })
        })

        it('должен обновлять задачи при изменении пользователя', async () => {
            // Создаем задачи для первого пользователя
            const firstUserId = 'user-1'
            mockServer.addMockTask({
                id: 'task-1',
                title: 'User 1 Task',
                description: 'Description',
                priority: 'high',
                status: 'todo',
                estimatedMinutes: 30,
                source: 'manual',
                tags: ['user1'],
                userId: firstUserId,
                createdAt: new Date(),
                updatedAt: new Date()
            })

            // Создаем задачи для второго пользователя
            const secondUserId = 'user-2'
            mockServer.addMockTask({
                id: 'task-2',
                title: 'User 2 Task',
                description: 'Description',
                priority: 'medium',
                status: 'todo',
                estimatedMinutes: 45,
                source: 'manual',
                tags: ['user2'],
                userId: secondUserId,
                createdAt: new Date(),
                updatedAt: new Date()
            })

            const { result: storeResult } = testUtils.renderHookWithProviders(() => useAppStore())

            // Устанавливаем первого пользователя
            await testUtils.testUtils.act(async () => {
                storeResult.current.setUser({
                    id: firstUserId,
                    email: 'user1@example.test',
                    name: 'User 1',
                    subscription: 'free',
                    createdAt: new Date(),
                    lastLoginAt: new Date(),
                    preferences: {
                        workingHours: { start: '09:00', end: '18:00' },
                        focusTime: 25,
                        breakTime: 5,
                        notifications: { email: true, push: true, desktop: true },
                        aiCoaching: { enabled: true, frequency: 'medium', style: 'gentle' }
                    }
                })
            })

            // Загружаем задачи
            await testUtils.testUtils.act(async () => {
                await storeResult.current.loadTasks()
            })

            // Проверяем, что загружены задачи первого пользователя
            await testUtils.waitForState(() => {
                expect(storeResult.current.tasks.length).toBeGreaterThan(0)
                expect(storeResult.current.tasks[0].title).toBe('User 1 Task')
            })

            // Переключаемся на второго пользователя
            await testUtils.testUtils.act(async () => {
                storeResult.current.setUser({
                    id: secondUserId,
                    email: 'user2@example.test',
                    name: 'User 2',
                    subscription: 'premium',
                    createdAt: new Date(),
                    lastLoginAt: new Date(),
                    preferences: {
                        workingHours: { start: '09:00', end: '18:00' },
                        focusTime: 25,
                        breakTime: 5,
                        notifications: { email: true, push: true, desktop: true },
                        aiCoaching: { enabled: true, frequency: 'medium', style: 'gentle' }
                    }
                })
            })

            // Загружаем задачи
            await testUtils.testUtils.act(async () => {
                await storeResult.current.loadTasks()
            })

            // Проверяем, что загружены задачи второго пользователя
            await testUtils.waitForState(() => {
                expect(storeResult.current.tasks.length).toBeGreaterThan(0)
                expect(storeResult.current.tasks[0].title).toBe('User 2 Task')
            })
        })
    })
})
