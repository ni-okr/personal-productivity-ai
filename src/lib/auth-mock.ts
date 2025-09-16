// 🧪 Mock функции для тестирования авторизации без Supabase

import { User } from '@/types'

export interface MockUser {
    id: string
    email: string
    name: string
    subscription: 'free' | 'premium' | 'pro'
    createdAt: Date
    lastLoginAt: Date
}

// Mock пользователи для тестирования
const mockUsers: MockUser[] = []

export function mockSignUp(email: string, password: string, name: string): { success: boolean; user?: User; error?: string } {
    console.log('🧪 MOCK РЕЖИМ: Регистрация без реальных запросов к Supabase')
    
    // Проверяем, не существует ли уже пользователь
    const existingUser = mockUsers.find(u => u.email === email)
    if (existingUser) {
        return {
            success: false,
            error: 'Пользователь с таким email уже существует'
        }
    }

    // Создаем нового пользователя
    const newUser: MockUser = {
        id: `mock-${Date.now()}`,
        email: email,
        name: name,
        subscription: 'free',
        createdAt: new Date(),
        lastLoginAt: new Date()
    }

    mockUsers.push(newUser)

    return {
        success: true,
        user: newUser
    }
}

export function mockSignIn(email: string, password: string): { success: boolean; user?: User; error?: string } {
    console.log('🧪 MOCK РЕЖИМ: Вход без реальных запросов к Supabase')
    
    const user = mockUsers.find(u => u.email === email)
    if (!user) {
        return {
            success: false,
            error: 'Пользователь не найден'
        }
    }

    // Обновляем время последнего входа
    user.lastLoginAt = new Date()

    return {
        success: true,
        user: user
    }
}

export function mockSignOut(): { success: boolean; error?: string } {
    console.log('🧪 MOCK РЕЖИМ: Выход без реальных запросов к Supabase')
    return {
        success: true
    }
}

export function mockGetCurrentUser(): User | null {
    console.log('🧪 MOCK РЕЖИМ: Получение текущего пользователя')
    // Возвращаем последнего зарегистрированного пользователя
    return mockUsers[mockUsers.length - 1] || null
}

export function clearMockUsers(): void {
    console.log('🧪 MOCK РЕЖИМ: Очистка mock пользователей')
    mockUsers.length = 0
}
