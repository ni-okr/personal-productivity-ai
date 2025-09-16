/**
 * 🧪 Единая система моков для тестов
 * 
 * Обеспечивает:
 * - Централизованное управление моками
 * - Автоматическую настройку
 * - Консистентность данных
 * - Легкое масштабирование
 */

import { testLogger } from './TestLogger'

export interface MockData {
    users: any[]
    tasks: any[]
    subscriptions: any[]
    metrics: any[]
    suggestions: any[]
}

export interface MockConfig {
    enableAuth: boolean
    enableDatabase: boolean
    enableAPI: boolean
    enableNavigation: boolean
    enableStorage: boolean
    enableNotifications: boolean
}

class TestMocks {
    private static instance: TestMocks
    private data: MockData
    private config: MockConfig
    private originalFunctions: Map<string, any> = new Map()

    private constructor() {
        this.config = {
            enableAuth: true,
            enableDatabase: true,
            enableAPI: true,
            enableNavigation: true,
            enableStorage: true,
            enableNotifications: true
        }

        this.data = this.initializeMockData()
    }

    public static getInstance(): TestMocks {
        if (!TestMocks.instance) {
            TestMocks.instance = new TestMocks()
        }
        return TestMocks.instance
    }

    private initializeMockData(): MockData {
        return {
            users: [
                {
                    id: 'mock-user-1',
                    email: 'test@example.com',
                    name: 'Test User',
                    createdAt: new Date().toISOString()
                }
            ],
            tasks: [
                {
                    id: 'mock-task-1',
                    title: 'Test Task 1',
                    description: 'Test Description 1',
                    priority: 'high',
                    status: 'todo',
                    userId: 'mock-user-1',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'mock-task-2',
                    title: 'Test Task 2',
                    description: 'Test Description 2',
                    priority: 'medium',
                    status: 'in_progress',
                    userId: 'mock-user-1',
                    createdAt: new Date().toISOString()
                }
            ],
            subscriptions: [
                {
                    id: 'mock-sub-1',
                    userId: 'mock-user-1',
                    tier: 'premium',
                    status: 'active',
                    createdAt: new Date().toISOString()
                }
            ],
            metrics: [
                {
                    id: 'mock-metric-1',
                    userId: 'mock-user-1',
                    completedTasks: 5,
                    totalTasks: 10,
                    completionRate: 0.5,
                    createdAt: new Date().toISOString()
                }
            ],
            suggestions: [
                {
                    id: 'mock-suggestion-1',
                    userId: 'mock-user-1',
                    type: 'productivity',
                    message: 'Test suggestion',
                    createdAt: new Date().toISOString()
                }
            ]
        }
    }

    public setupAllMocks(): void {
        testLogger.info('MOCK', 'Setting up all mocks')

        if (this.config.enableAuth) this.setupAuthMocks()
        if (this.config.enableDatabase) this.setupDatabaseMocks()
        if (this.config.enableAPI) this.setupAPIMocks()
        if (this.config.enableNavigation) this.setupNavigationMocks()
        if (this.config.enableStorage) this.setupStorageMocks()
        if (this.config.enableNotifications) this.setupNotificationMocks()
    }

    public clearAllMocks(): void {
        testLogger.info('MOCK', 'Clearing all mocks')

        // Восстанавливаем оригинальные функции
        this.originalFunctions.forEach((originalFn, key) => {
            const [object, method] = key.split('.')
            if (object === 'global') {
                (global as any)[method] = originalFn
            } else if (object === 'window') {
                (window as any)[method] = originalFn
            }
        })

        this.originalFunctions.clear()

        // Очищаем данные
        this.data = this.initializeMockData()
    }

    private setupAuthMocks(): void {
        testLogger.debug('MOCK', 'Setting up auth mocks')

        // Mock Supabase Auth
        const mockSupabaseAuth = {
            signUp: jest.fn().mockResolvedValue({
                data: { user: this.data.users[0] },
                error: null
            }),
            signInWithPassword: jest.fn().mockResolvedValue({
                data: { user: this.data.users[0] },
                error: null
            }),
            signOut: jest.fn().mockResolvedValue({
                error: null
            }),
            getSession: jest.fn().mockResolvedValue({
                data: { session: { user: this.data.users[0] } },
                error: null
            }),
            onAuthStateChange: jest.fn().mockReturnValue({
                data: { subscription: { unsubscribe: jest.fn() } }
            })
        }

        // Mock auth functions
        global.supabase = {
            auth: mockSupabaseAuth
        } as any
    }

    private setupDatabaseMocks(): void {
        testLogger.debug('MOCK', 'Setting up database mocks')

        // Mock Supabase Database
        const mockSupabaseDB = {
            from: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: this.data.tasks[0],
                            error: null
                        }),
                        order: jest.fn().mockReturnValue({
                            limit: jest.fn().mockResolvedValue({
                                data: this.data.tasks,
                                error: null
                            })
                        })
                    }),
                    insert: jest.fn().mockResolvedValue({
                        data: [this.data.tasks[0]],
                        error: null
                    }),
                    update: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({
                            data: [this.data.tasks[0]],
                            error: null
                        })
                    }),
                    delete: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({
                            data: [],
                            error: null
                        })
                    })
                })
            })
        }

        if (global.supabase) {
            (global.supabase as any).from = mockSupabaseDB.from
        }
    }

    private setupAPIMocks(): void {
        testLogger.debug('MOCK', 'Setting up API mocks')

        // Mock fetch
        global.fetch = jest.fn().mockImplementation((url: string) => {
            testLogger.api(url, 'GET', 200)

            if (url.includes('/api/subscribe')) {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({ success: true, message: 'Subscribed successfully' })
                })
            }

            if (url.includes('/api/test')) {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({ status: 'ok', timestamp: new Date().toISOString() })
                })
            }

            return Promise.resolve({
                ok: false,
                status: 404,
                json: () => Promise.resolve({ error: 'Not found' })
            })
        })
    }

    private setupNavigationMocks(): void {
        testLogger.debug('MOCK', 'Setting up navigation mocks')

        // Mock Next.js router
        const mockRouter = {
            push: jest.fn(),
            replace: jest.fn(),
            back: jest.fn(),
            forward: jest.fn(),
            refresh: jest.fn(),
            prefetch: jest.fn(),
            pathname: '/',
            query: {},
            asPath: '/'
        }

        // Mock Next.js navigation hooks
        jest.mock('next/navigation', () => ({
            useRouter: () => mockRouter,
            usePathname: () => '/',
            useSearchParams: () => new URLSearchParams()
        }))
    }

    private setupStorageMocks(): void {
        testLogger.debug('MOCK', 'Setting up storage mocks')

        // Mock localStorage
        const mockLocalStorage = {
            getItem: jest.fn((key: string) => {
                testLogger.debug('STORAGE', `Getting item: ${key}`)
                return null
            }),
            setItem: jest.fn((key: string, value: string) => {
                testLogger.debug('STORAGE', `Setting item: ${key}`, { value })
            }),
            removeItem: jest.fn((key: string) => {
                testLogger.debug('STORAGE', `Removing item: ${key}`)
            }),
            clear: jest.fn(() => {
                testLogger.debug('STORAGE', 'Clearing all items')
            })
        }

        Object.defineProperty(window, 'localStorage', {
            value: mockLocalStorage,
            writable: true
        })

        // Mock sessionStorage
        Object.defineProperty(window, 'sessionStorage', {
            value: mockLocalStorage,
            writable: true
        })
    }

    private setupNotificationMocks(): void {
        testLogger.debug('MOCK', 'Setting up notification mocks')

        // Mock Notification API
        Object.defineProperty(window, 'Notification', {
            value: class MockNotification {
                static permission = 'granted'
                static requestPermission = jest.fn().mockResolvedValue('granted')

                constructor(public title: string, public options?: any) {
                    testLogger.debug('NOTIFICATION', `Creating notification: ${title}`, options)
                }
            },
            writable: true
        })
    }

    // Методы для работы с данными
    public addUser(user: any): void {
        this.data.users.push({ ...user, id: user.id || `mock-user-${Date.now()}` })
        testLogger.debug('MOCK', 'Added user', user)
    }

    public addTask(task: any): void {
        this.data.tasks.push({ ...task, id: task.id || `mock-task-${Date.now()}` })
        testLogger.debug('MOCK', 'Added task', task)
    }

    public addSubscription(subscription: any): void {
        this.data.subscriptions.push({ ...subscription, id: subscription.id || `mock-sub-${Date.now()}` })
        testLogger.debug('MOCK', 'Added subscription', subscription)
    }

    public getUser(id: string): any {
        return this.data.users.find(user => user.id === id)
    }

    public getTask(id: string): any {
        return this.data.tasks.find(task => task.id === id)
    }

    public getSubscription(id: string): any {
        return this.data.subscriptions.find(sub => sub.id === id)
    }

    public getTasksByUser(userId: string): any[] {
        return this.data.tasks.filter(task => task.userId === userId)
    }

    public updateTask(id: string, updates: any): any {
        const taskIndex = this.data.tasks.findIndex(task => task.id === id)
        if (taskIndex !== -1) {
            this.data.tasks[taskIndex] = { ...this.data.tasks[taskIndex], ...updates }
            testLogger.debug('MOCK', 'Updated task', { id, updates })
            return this.data.tasks[taskIndex]
        }
        return null
    }

    public deleteTask(id: string): boolean {
        const taskIndex = this.data.tasks.findIndex(task => task.id === id)
        if (taskIndex !== -1) {
            this.data.tasks.splice(taskIndex, 1)
            testLogger.debug('MOCK', 'Deleted task', { id })
            return true
        }
        return false
    }

    public clearData(): void {
        this.data = this.initializeMockData()
        testLogger.info('MOCK', 'Cleared all mock data')
    }

    public getData(): MockData {
        return { ...this.data }
    }

    public updateConfig(newConfig: Partial<MockConfig>): void {
        this.config = { ...this.config, ...newConfig }
        testLogger.info('MOCK', 'Updated mock config', this.config)
    }
}

// Экспорт синглтона
export const testMocks = TestMocks.getInstance()

// Экспорт утилит
export const {
    setupAllMocks,
    clearAllMocks,
    addUser,
    addTask,
    addSubscription,
    getUser,
    getTask,
    getSubscription,
    getTasksByUser,
    updateTask,
    deleteTask,
    clearData,
    getData,
    updateConfig
} = testMocks

// Декораторы для автоматической настройки моков
export function WithMocks(config: Partial<MockConfig> = {}) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value

        descriptor.value = async function (...args: any[]) {
            testMocks.updateConfig(config)
            testMocks.setupAllMocks()

            try {
                const result = await originalMethod.call(this, ...args)
                return result
            } finally {
                testMocks.clearAllMocks()
            }
        }
    }
}

export function WithMockData(data: Partial<MockData>) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value

        descriptor.value = async function (...args: any[]) {
            // Добавляем тестовые данные
            if (data.users) data.users.forEach(user => testMocks.addUser(user))
            if (data.tasks) data.tasks.forEach(task => testMocks.addTask(task))
            if (data.subscriptions) data.subscriptions.forEach(sub => testMocks.addSubscription(sub))

            try {
                const result = await originalMethod.call(this, ...args)
                return result
            } finally {
                testMocks.clearData()
            }
        }
    }
}

export default testMocks