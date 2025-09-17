/**
 * Единый mock сервер для всех integration тестов
 * Централизованное управление mock данными и функциями
 */

import { AISuggestion, Subscription, Task, User } from '@/types'

// Mock данные
let mockUsers: User[] = []
let mockTasks: Task[] = []
let mockAISuggestions: AISuggestion[] = []
let mockSubscriptions: Subscription[] = []

// Текущий авторизованный пользователь
let currentMockUser: User | null = null

// Слушатели изменений авторизации
const authStateListeners: Array<(user: User | null) => void> = []

/**
 * Инициализация mock сервера
 */
export function initializeMockServer() {
    console.log('🧪 Инициализация единого mock сервера')

    // Очищаем все данные
    mockUsers = []
    mockTasks = []
    mockAISuggestions = []
    mockSubscriptions = []
    currentMockUser = null

    // Уведомляем слушателей об очистке
    authStateListeners.forEach(callback => callback(null))
}

/**
 * Установка текущего пользователя (для тестов)
 */
export function setCurrentMockUser(user: User | null): void {
    console.log('🧪 MOCK РЕЖИМ: Установка текущего пользователя')
    currentMockUser = user
    notifyAuthStateChange(user)

    // Обновляем состояние в useAppStore
    import('@/stores/useAppStore').then(({ useAppStore }) => {
        const store = useAppStore.getState()
        if (user) {
            store.setUser(user)
        } else {
            store.clearUserData()
        }
    })
}

/**
 * Уведомление об изменении состояния авторизации
 */
function notifyAuthStateChange(user: User | null) {
    currentMockUser = user
    authStateListeners.forEach(callback => callback(user))

    // НЕ обновляем состояние в useAppStore автоматически
    // Это должно делаться вручную в тестах
}

/**
 * Подписка на изменения авторизации
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
    authStateListeners.push(callback)
    return () => {
        const index = authStateListeners.indexOf(callback)
        if (index > -1) {
            authStateListeners.splice(index, 1)
        }
    }
}

// ==================== ПОЛЬЗОВАТЕЛИ ====================

/**
 * Создание mock пользователя
 */
export function createMockUser(email: string, password: string, name: string): User {
    const user: User = {
        id: `user-${Date.now()}`,
        email,
        name,
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date()
    }

    mockUsers.push(user)
    return user
}

/**
 * Поиск пользователя по email
 */
export function findMockUser(email: string): User | null {
    return mockUsers.find(user => user.email === email) || null
}

/**
 * Авторизация пользователя
 */
export function mockSignUp(email: string, password: string, name: string): { success: boolean; user?: User; error?: string; message?: string } {
    console.log('🧪 MOCK РЕЖИМ: Регистрация без реальных запросов к Supabase')

    if (findMockUser(email)) {
        return {
            success: false,
            error: 'Пользователь с таким email уже существует (mock)'
        }
    }

    const user = createMockUser(email, password, name)

    return {
        success: true,
        user: user,
        message: 'Mock регистрация успешна'
    }
}

export function mockSignIn(email: string, password: string): { success: boolean; user?: User; error?: string; message?: string } {
    console.log('🧪 MOCK РЕЖИМ: Вход без реальных запросов к Supabase')

    const user = findMockUser(email)
    if (!user) {
        return {
            success: false,
            error: 'Пользователь не найден (mock)'
        }
    }

    if (password === 'wrongpassword') {
        return {
            success: false,
            error: 'Неверный email или пароль (mock)'
        }
    }

    user.updatedAt = new Date()

    return {
        success: true,
        user: user,
        message: 'Mock вход успешен'
    }
}

export function mockSignOut(): { success: boolean; error?: string; message?: string } {
    console.log('🧪 MOCK РЕЖИМ: Выход без реальных запросов к Supabase')
    return {
        success: true,
        message: 'Mock выход успешен'
    }
}

export async function mockGetCurrentUser(): Promise<User | null> {
    console.log('🧪 MOCK РЕЖИМ: Получение текущего пользователя')
    return currentMockUser
}

/**
 * Авторизация с обновлением состояния
 */
export function mockSignUpWithState(email: string, password: string, name: string): { success: boolean; user?: User; error?: string; message?: string } {
    const result = mockSignUp(email, password, name)
    if (result.success && result.user) {
        notifyAuthStateChange(result.user)
    }
    return result
}

export function mockSignInWithState(email: string, password: string): { success: boolean; user?: User; error?: string; message?: string } {
    const result = mockSignIn(email, password)
    if (result.success && result.user) {
        notifyAuthStateChange(result.user)
    }
    return result
}

export function mockSignOutWithState(): { success: boolean; error?: string; message?: string } {
    const result = mockSignOut()
    if (result.success) {
        currentMockUser = null
        notifyAuthStateChange(null)

        // Также очищаем store
        import('@/stores/useAppStore').then(({ useAppStore }) => {
            const store = useAppStore.getState()
            store.clearUserData()
        })

        // Очищаем подписки в subscription-mock.ts
        const { clearMockSubscriptions } = require('@/lib/subscription-mock')
        if (clearMockSubscriptions) {
            clearMockSubscriptions()
        }
    }
    return result
}

// ==================== ЗАДАЧИ ====================

/**
 * Добавление mock задачи
 */
export function addMockTask(task: Task): void {
    // Добавляем в локальный массив
    mockTasks.push(task)

    // Также добавляем в статический массив в tasks-mock.ts
    import('@/lib/tasks-mock').then(({ addMockTask: addStaticMockTask }) => {
        addStaticMockTask(task)
    })
}

/**
 * Получение задач пользователя
 */
export function mockGetTasks(userId: string): { success: boolean; tasks?: Task[]; error?: string } {
    console.log('🧪 MOCK РЕЖИМ: Получение задач без реальных запросов к Supabase')

    const userTasks = mockTasks.filter(task => task.userId === userId)

    return {
        success: true,
        tasks: userTasks
    }
}

/**
 * Создание задачи
 */
export function mockCreateTask(userId: string, taskData: any): { success: boolean; task?: Task; error?: string } {
    console.log('🧪 MOCK РЕЖИМ: Создание задачи без реальных запросов к Supabase')

    const task: Task = {
        id: `task-${Date.now()}`,
        title: taskData.title,
        description: taskData.description || '',
        priority: taskData.priority || 'medium',
        status: 'todo',
        estimatedMinutes: taskData.estimatedMinutes || 30,
        actualMinutes: null,
        dueDate: taskData.dueDate || null,
        completedAt: null,
        source: 'manual',
        tags: taskData.tags || [],
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date()
    }

    mockTasks.push(task)

    return {
        success: true,
        task
    }
}

/**
 * Обновление задачи
 */
export function mockUpdateTask(taskId: string, updates: any): { success: boolean; task?: Task; error?: string } {
    console.log('🧪 MOCK РЕЖИМ: Обновление задачи без реальных запросов к Supabase')

    const taskIndex = mockTasks.findIndex(task => task.id === taskId)
    if (taskIndex === -1) {
        return {
            success: false,
            error: 'Задача не найдена'
        }
    }

    const updatedTask = {
        ...mockTasks[taskIndex],
        ...updates,
        updatedAt: new Date()
    }

    mockTasks[taskIndex] = updatedTask

    return {
        success: true,
        task: updatedTask
    }
}

/**
 * Удаление задачи
 */
export function mockDeleteTask(taskId: string): { success: boolean; error?: string } {
    console.log('🧪 MOCK РЕЖИМ: Удаление задачи без реальных запросов к Supabase')

    const taskIndex = mockTasks.findIndex(task => task.id === taskId)
    if (taskIndex === -1) {
        return {
            success: false,
            error: 'Задача не найдена'
        }
    }

    mockTasks.splice(taskIndex, 1)

    return {
        success: true
    }
}

/**
 * Завершение задачи
 */
export function mockCompleteTask(taskId: string, actualDuration?: number): { success: boolean; task?: Task; error?: string } {
    console.log('🧪 MOCK РЕЖИМ: Завершение задачи без реальных запросов к Supabase')

    const taskIndex = mockTasks.findIndex(task => task.id === taskId)
    if (taskIndex === -1) {
        return {
            success: false,
            error: 'Задача не найдена'
        }
    }

    const updatedTask = {
        ...mockTasks[taskIndex],
        status: 'completed' as const,
        actualMinutes: actualDuration || null,
        completedAt: new Date(),
        updatedAt: new Date()
    }

    mockTasks[taskIndex] = updatedTask

    return {
        success: true,
        task: updatedTask
    }
}

// ==================== AI ПРЕДЛОЖЕНИЯ ====================

/**
 * Добавление mock AI предложения
 */
export function addMockAISuggestion(suggestion: AISuggestion): void {
    mockAISuggestions.push(suggestion)
}

/**
 * Получение AI предложений пользователя
 */
export function mockGetAISuggestions(userId: string): { success: boolean; suggestions?: AISuggestion[]; error?: string } {
    console.log('🧪 MOCK РЕЖИМ: Получение AI предложений без реальных запросов к Supabase')

    const userSuggestions = mockAISuggestions.filter(suggestion => suggestion.userId === userId)

    return {
        success: true,
        suggestions: userSuggestions
    }
}

// ==================== ПОДПИСКИ ====================

/**
 * Добавление mock подписки
 */
export function addMockSubscription(subscription: Subscription): void {
    // Добавляем в локальный массив для совместимости
    mockSubscriptions.push(subscription)

    // Также добавляем в статический массив в subscription-mock.ts (это основной массив)
    // Используем require для синхронного импорта
    const { addMockSubscription: addStaticMockSubscription } = require('@/lib/subscription-mock')
    if (addStaticMockSubscription) {
        addStaticMockSubscription(subscription)
    }
}

/**
 * Получение подписки пользователя
 */
export async function mockGetSubscription(userId: string): Promise<{ success: boolean; subscription?: Subscription; error?: string }> {
    console.log('🧪 MOCK РЕЖИМ: Получение подписки без реальных запросов к Supabase')

    // Читаем из subscription-mock.ts (основной источник данных)
    const { mockGetSubscription: getSubscriptionFromMock } = await import('@/lib/subscription-mock')
    const result = await getSubscriptionFromMock(userId)
    console.log('Unified mock server - getSubscription result:', result)
    return result
}

/**
 * Обновление подписки
 */
export async function mockUpdateSubscription(subscriptionId: string, updates: Partial<Subscription>): Promise<{ success: boolean; subscription?: Subscription; error?: string }> {
    console.log('🧪 MOCK РЕЖИМ: Обновление подписки без реальных запросов к Supabase')

    // Используем функцию из subscription-mock.ts
    const { mockUpdateSubscription: updateSubscriptionFromMock } = await import('@/lib/subscription-mock')
    return await updateSubscriptionFromMock(subscriptionId, updates)
}

/**
 * Отмена подписки
 */
export async function mockCancelSubscription(subscriptionId: string): Promise<{ success: boolean; subscription?: Subscription; error?: string }> {
    console.log('🧪 MOCK РЕЖИМ: Отмена подписки без реальных запросов к Supabase')
    console.log('Unified mock server - subscription ID:', subscriptionId)

    // Используем функцию из subscription-mock.ts
    const { mockCancelSubscription: cancelSubscriptionFromMock } = await import('@/lib/subscription-mock')
    const result = await cancelSubscriptionFromMock(subscriptionId)
    console.log('Unified mock server - cancel result:', result)

    // Также обновляем локальный массив для совместимости
    if (result.success && result.subscription) {
        const localIndex = mockSubscriptions.findIndex(sub => sub.id === subscriptionId)
        if (localIndex !== -1) {
            mockSubscriptions[localIndex] = result.subscription
        }
    }

    return result
}

/**
 * Получение планов подписок
 */
export function mockGetSubscriptionPlans(): { success: boolean; plans?: any[]; error?: string } {
    console.log('🧪 MOCK РЕЖИМ: Получение планов подписок без реальных запросов к Supabase')

    const plans = [
        {
            id: 'free',
            name: 'Free',
            price: 0,
            currency: 'RUB',
            interval: 'month',
            features: ['До 50 задач', 'Базовые метрики', 'Email поддержка'],
            limits: {
                tasks: 50,
                aiRequests: 10,
                storage: 100
            },
            tinkoffPriceId: null,
            isActive: true,
            description: 'Для начинающих'
        },
        {
            id: 'premium',
            name: 'Premium',
            price: 999,
            currency: 'RUB',
            interval: 'month',
            features: ['До 500 задач', 'Расширенные метрики', 'ИИ рекомендации', 'Приоритет поддержка'],
            limits: {
                tasks: 500,
                aiRequests: 100,
                storage: 1000
            },
            tinkoffPriceId: 'premium-plan',
            isActive: true,
            description: 'Для активных пользователей'
        },
        {
            id: 'pro',
            name: 'Pro',
            price: 1999,
            currency: 'RUB',
            interval: 'month',
            features: ['Неограниченные задачи', 'Все метрики', 'ИИ планирование', 'Персональный менеджер'],
            limits: {
                tasks: -1,
                aiRequests: -1,
                storage: 10000
            },
            tinkoffPriceId: 'pro-plan',
            isActive: true,
            description: 'Для профессионалов и команд'
        }
    ]

    return {
        success: true,
        plans
    }
}

// ==================== МЕТРИКИ ====================

/**
 * Получение метрик продуктивности
 */
export function mockGetProductivityMetrics(userId: string): { success: boolean; metrics?: any; error?: string } {
    console.log('🧪 MOCK РЕЖИМ: Получение метрик продуктивности без реальных запросов к Supabase')

    const metrics = {
        focusTimeMinutes: 120,
        productivityScore: 75,
        tasksCompleted: 8,
        tasksCreated: 12,
        averageTaskDuration: 25,
        mostProductiveHour: 14,
        weeklyGoal: 100,
        weeklyProgress: 75
    }

    return {
        success: true,
        metrics
    }
}

// ==================== СИНХРОНИЗАЦИЯ ====================

/**
 * Синхронизация задач
 */
export function mockSyncTasks(userId: string): { success: boolean; tasks?: Task[]; error?: string } {
    console.log('🧪 MOCK РЕЖИМ: Синхронизация задач без реальных запросов к Supabase')

    const userTasks = mockTasks.filter(task => task.userId === userId)

    return {
        success: true,
        tasks: userTasks
    }
}

/**
 * Получение статистики задач
 */
export function mockGetTasksStats(userId: string): { success: boolean; stats?: any; error?: string } {
    console.log('🧪 MOCK РЕЖИМ: Получение статистики задач без реальных запросов к Supabase')

    const userTasks = mockTasks.filter(task => task.userId === userId)
    const completedTasks = userTasks.filter(task => task.status === 'completed')

    const stats = {
        total: userTasks.length,
        completed: completedTasks.length,
        pending: userTasks.length - completedTasks.length,
        completionRate: userTasks.length > 0 ? (completedTasks.length / userTasks.length) * 100 : 0
    }

    return {
        success: true,
        stats
    }
}

// ==================== ЭКСПОРТ ====================

export default {
    initializeMockServer,
    onAuthStateChange,
    setCurrentMockUser,

    // Пользователи
    createMockUser,
    findMockUser,
    mockSignUp,
    mockSignIn,
    mockSignOut,
    mockGetCurrentUser,
    mockSignUpWithState,
    mockSignInWithState,
    mockSignOutWithState,

    // Задачи
    addMockTask,
    mockGetTasks,
    mockCreateTask,
    mockUpdateTask,
    mockDeleteTask,
    mockCompleteTask,

    // AI предложения
    addMockAISuggestion,
    mockGetAISuggestions,

    // Подписки
    addMockSubscription,
    mockGetSubscription,
    mockUpdateSubscription,
    mockCancelSubscription,
    mockGetSubscriptionPlans,

    // Метрики
    mockGetProductivityMetrics,

    // Синхронизация
    mockSyncTasks,
    mockGetTasksStats
}
