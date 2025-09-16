// 🧪 Mock функции для тестирования авторизации без Supabase

import { User } from '@/types'

export interface MockUser {
    id: string
    email: string
    name: string
    avatar?: string
    timezone: string
    subscription: 'free' | 'premium' | 'pro'
    subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing'
    preferences: {
        workingHours: { start: string; end: string }
        focusTime: number
        breakTime: number
        notifications: { email: boolean; push: boolean; desktop: boolean }
        aiCoaching: { enabled: boolean; frequency: 'low' | 'medium' | 'high'; style: 'gentle' | 'direct' | 'motivational' }
    }
    createdAt: Date
    updatedAt: Date
}

// Mock пользователи для тестирования
const mockUsers: MockUser[] = []

export function mockSignUp(email: string, password: string, name: string): { success: boolean; user?: User; error?: string; message?: string } {
    console.log('🧪 MOCK РЕЖИМ: Регистрация без реальных запросов к Supabase')

    // Проверяем, не существует ли уже пользователь
    const existingUser = mockUsers.find(u => u.email === email)
    if (existingUser) {
        return {
            success: false,
            error: 'Пользователь с таким email уже существует (mock)'
        }
    }

    // Создаем нового пользователя
    const newUser: MockUser = {
        id: `mock-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        email: email,
        name: name,
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

    mockUsers.push(newUser)
    currentMockUser = newUser

    return {
        success: true,
        user: newUser,
        message: 'Mock регистрация успешна'
    }
}

export function mockSignIn(email: string, password: string): { success: boolean; user?: User; error?: string; message?: string } {
    console.log('🧪 MOCK РЕЖИМ: Вход без реальных запросов к Supabase')

    const user = mockUsers.find(u => u.email === email)
    if (!user) {
        return {
            success: false,
            error: 'Неверный email или пароль (mock)'
        }
    }

    // В mock режиме мы не проверяем пароль, но для тестов можем добавить простую проверку
    if (password === 'wrongpassword') {
        return {
            success: false,
            error: 'Неверный email или пароль (mock)'
        }
    }

    // Обновляем время последнего входа
    user.updatedAt = new Date()
    currentMockUser = user

    return {
        success: true,
        user: user,
        message: 'Mock вход успешен'
    }
}

export function mockSignOut(): { success: boolean; error?: string; message?: string } {
    console.log('🧪 MOCK РЕЖИМ: Выход без реальных запросов к Supabase')
    currentMockUser = null
    return {
        success: true,
        message: 'Mock выход успешен'
    }
}

export async function mockGetCurrentUser(): Promise<User | null> {
    console.log('🧪 MOCK РЕЖИМ: Получение текущего пользователя')
    // Возвращаем текущего авторизованного пользователя
    return currentMockUser
}

// Функция для установки текущего пользователя (для тестов)
export function setCurrentMockUser(user: User | null): void {
    console.log('🧪 MOCK РЕЖИМ: Установка текущего пользователя')
    currentMockUser = user
    notifyAuthStateChange(user)
}

export function mockGetUserProfile(userId: string): { success: boolean; user?: User; error?: string } {
    console.log('🧪 MOCK РЕЖИМ: Получение профиля пользователя')

    const user = mockUsers.find(u => u.id === userId || u.email === userId)
    if (!user) {
        return {
            success: false,
            error: 'Профиль не найден'
        }
    }

    return {
        success: true,
        user: user
    }
}

export function mockUpdateUserProfile(userId: string, updates: Partial<User>): { success: boolean; user?: User; error?: string } {
    console.log('🧪 MOCK РЕЖИМ: Обновление профиля пользователя')

    const user = mockUsers.find(u => u.id === userId || u.email === userId)
    if (!user) {
        return {
            success: false,
            error: 'Профиль не найден'
        }
    }

    // Обновляем пользователя
    Object.assign(user, updates)
    user.updatedAt = new Date()

    // Обновляем currentMockUser если это тот же пользователь
    if (currentMockUser && currentMockUser.id === user.id) {
        currentMockUser = user
    }

    return {
        success: true,
        user: user
    }
}

export function clearMockUsers(): void {
    console.log('🧪 MOCK РЕЖИМ: Очистка mock пользователей')
    mockUsers.length = 0
    notifyAuthStateChange(null)
}

// Mock для onAuthStateChange
let currentMockUser: MockUser | null = null
let authStateListeners: ((user: User | null) => void)[] = []

export function mockOnAuthStateChange(callback: (user: User | null) => void) {
    console.log('🧪 MOCK РЕЖИМ: Подписка на изменения авторизации')
    authStateListeners.push(callback)

    // Сразу вызываем callback с текущим пользователем (или null если не авторизован)
    callback(currentMockUser)

    return {
        data: {
            subscription: {
                unsubscribe: () => {
                    const index = authStateListeners.indexOf(callback)
                    if (index > -1) {
                        authStateListeners.splice(index, 1)
                    }
                }
            }
        }
    }
}

// Функция для уведомления слушателей об изменении пользователя
function notifyAuthStateChange(user: User | null) {
    currentMockUser = user
    authStateListeners.forEach(callback => callback(user))

    // Обновляем состояние в useAppStore
    if (typeof window !== 'undefined') {
        // Импортируем store только в браузере
        import('@/stores/useAppStore').then(({ useAppStore }) => {
            const store = useAppStore.getState()
            if (user) {
                store.setUser(user)
            } else {
                store.clearUserData()
            }
        })
    }
}

// Обновляем mockSignUp и mockSignIn для уведомления слушателей
export function mockSignUpWithState(email: string, password: string, name: string): { success: boolean; user?: User; error?: string; message?: string } {
    const result = mockSignUp(email, password, name)
    if (result.success && result.user) {
        currentMockUser = result.user
        notifyAuthStateChange(result.user)
    }
    return result
}

export function mockSignInWithState(email: string, password: string): { success: boolean; user?: User; error?: string; message?: string } {
    const result = mockSignIn(email, password)
    if (result.success && result.user) {
        currentMockUser = result.user
        notifyAuthStateChange(result.user)
    }
    return result
}

export function mockSignOutWithState(): { success: boolean; error?: string; message?: string } {
    const result = mockSignOut()
    if (result.success) {
        currentMockUser = null
        notifyAuthStateChange(null)
    }
    return result
}
