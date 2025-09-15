import {
    getCurrentUser,
    getUserProfile,
    signIn,
    signUp,
    updateUserProfile
} from '@/lib/auth'
import { beforeEach, describe, expect, it } from '@jest/globals'

// Mock Supabase для интеграционных тестов
const mockInsert = jest.fn()
const mockUpdate = jest.fn()
const mockSelect = jest.fn()
const mockSingle = jest.fn()

jest.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            signUp: jest.fn(),
            signInWithPassword: jest.fn(),
            signOut: jest.fn(),
            getUser: jest.fn()
        },
        from: jest.fn(() => ({
            insert: mockInsert,
            update: mockUpdate,
            select: mockSelect
        }))
    }
}))

describe('Auth Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        
        // Настраиваем моки по умолчанию
        mockInsert.mockReturnValue({
            error: null
        })
        
        mockUpdate.mockReturnValue({
            eq: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    single: mockSingle
                })
            })
        })
        
        mockSelect.mockReturnValue({
            eq: jest.fn().mockReturnValue({
                single: mockSingle
            })
        })
    })

    describe('User Registration Flow', () => {
        it('should register user successfully', async () => {
            const { supabase } = require('@/lib/supabase')
            
            // Настраиваем мок для успешной регистрации
            supabase.auth.signUp.mockResolvedValue({
                data: {
                    user: {
                        id: 'test-user-id',
                        email: 'test@example.com'
                    }
                },
                error: null
            })

            mockSingle.mockResolvedValue({
                data: {
                    id: 'test-user-id',
                    email: 'test@example.com',
                    name: 'Test User',
                    subscription: 'free',
                    created_at: '2024-01-01T00:00:00Z',
                    last_login_at: '2024-01-01T00:00:00Z'
                },
                error: null
            })

            const result = await signUp('test@example.com', 'password123', 'Test User')

            expect(result.success).toBe(true)
            expect(result.user?.id).toBe('test-user-id')
            expect(result.user?.email).toBe('test@example.com')
        })

        it('should handle registration errors', async () => {
            const { supabase } = require('@/lib/supabase')
            
            // Настраиваем мок для ошибки регистрации
            supabase.auth.signUp.mockResolvedValue({
                data: null,
                error: { message: 'Email already exists' }
            })

            const result = await signUp('test@example.com', 'password123', 'Test User')

            expect(result.success).toBe(false)
            expect(result.error).toBe('Email already exists')
        })
    })

    describe('User Login Flow', () => {
        it('should login user successfully', async () => {
            const { supabase } = require('@/lib/supabase')
            
            // Настраиваем мок для успешного входа
            supabase.auth.signInWithPassword.mockResolvedValue({
                data: {
                    user: {
                        id: 'test-user-id',
                        email: 'test@example.com'
                    }
                },
                error: null
            })

            mockSingle.mockResolvedValue({
                data: {
                    id: 'test-user-id',
                    email: 'test@example.com',
                    name: 'Test User',
                    subscription: 'free',
                    created_at: '2024-01-01T00:00:00Z',
                    last_login_at: '2024-01-01T00:00:00Z'
                },
                error: null
            })

            const result = await signIn('test@example.com', 'password123')

            expect(result.success).toBe(true)
            expect(result.user?.id).toBe('test-user-id')
            expect(result.user?.email).toBe('test@example.com')
        })

        it('should handle login errors', async () => {
            const { supabase } = require('@/lib/supabase')
            
            // Настраиваем мок для ошибки входа
            supabase.auth.signInWithPassword.mockResolvedValue({
                data: null,
                error: { message: 'Invalid credentials' }
            })

            const result = await signIn('test@example.com', 'wrongpassword')

            expect(result.success).toBe(false)
            expect(result.error).toBe('Invalid credentials')
        })
    })

    describe('User Profile Management', () => {
        it('should get user profile successfully', async () => {
            const { supabase } = require('@/lib/supabase')
            
            // Настраиваем мок для получения профиля
            supabase.auth.getUser.mockResolvedValue({
                data: {
                    user: {
                        id: 'test-user-id',
                        email: 'test@example.com'
                    }
                },
                error: null
            })

            mockSingle.mockResolvedValue({
                data: {
                    id: 'test-user-id',
                    email: 'test@example.com',
                    name: 'Test User',
                    subscription: 'free',
                    created_at: '2024-01-01T00:00:00Z',
                    last_login_at: '2024-01-01T00:00:00Z'
                },
                error: null
            })

            const profile = await getUserProfile()

            expect(profile).toBeDefined()
            expect(profile?.id).toBe('test-user-id')
            expect(profile?.email).toBe('test@example.com')
        })

        it('should update user profile successfully', async () => {
            const { supabase } = require('@/lib/supabase')
            
            // Настраиваем мок для обновления профиля
            supabase.auth.getUser.mockResolvedValue({
                data: {
                    user: {
                        id: 'test-user-id',
                        email: 'test@example.com'
                    }
                },
                error: null
            })

            mockSingle.mockResolvedValue({
                data: {
                    id: 'test-user-id',
                    email: 'test@example.com',
                    name: 'Updated Name',
                    subscription: 'free',
                    created_at: '2024-01-01T00:00:00Z',
                    last_login_at: '2024-01-01T00:00:00Z'
                },
                error: null
            })

            const result = await updateUserProfile({
                name: 'Updated Name'
            })

            expect(result.success).toBe(true)
            expect(result.user?.name).toBe('Updated Name')
        })
    })

    describe('Current User Management', () => {
        it('should get current user successfully', async () => {
            const { supabase } = require('@/lib/supabase')
            
            // Настраиваем мок для получения текущего пользователя
            supabase.auth.getUser.mockResolvedValue({
                data: {
                    user: {
                        id: 'test-user-id',
                        email: 'test@example.com'
                    }
                },
                error: null
            })

            mockSingle.mockResolvedValue({
                data: {
                    id: 'test-user-id',
                    email: 'test@example.com',
                    name: 'Test User',
                    subscription: 'free',
                    created_at: '2024-01-01T00:00:00Z',
                    last_login_at: '2024-01-01T00:00:00Z'
                },
                error: null
            })

            const user = await getCurrentUser()

            expect(user).toBeDefined()
            expect(user?.id).toBe('test-user-id')
            expect(user?.email).toBe('test@example.com')
        })

        it('should return null when no user is logged in', async () => {
            const { supabase } = require('@/lib/supabase')
            
            // Настраиваем мок для отсутствия пользователя
            supabase.auth.getUser.mockResolvedValue({
                data: null,
                error: null
            })

            const user = await getCurrentUser()

            expect(user).toBeNull()
        })
    })

    describe('Data Consistency', () => {
        it('should maintain data consistency across operations', async () => {
            const { supabase } = require('@/lib/supabase')
            
            // Настраиваем моки для полного цикла операций
            supabase.auth.signUp.mockResolvedValue({
                data: {
                    user: {
                        id: 'test-user-id',
                        email: 'test@example.com'
                    }
                },
                error: null
            })

            mockSingle.mockResolvedValue({
                data: {
                    id: 'test-user-id',
                    email: 'test@example.com',
                    name: 'Test User',
                    subscription: 'free',
                    created_at: '2024-01-01T00:00:00Z',
                    last_login_at: '2024-01-01T00:00:00Z'
                },
                error: null
            })

            // Регистрация
            const signUpResult = await signUp('test@example.com', 'password123', 'Test User')
            expect(signUpResult.success).toBe(true)
            expect(signUpResult.user?.id).toBe('test-user-id')
            expect(signUpResult.user?.email).toBe('test@example.com')

            // Получение профиля
            const profile = await getUserProfile()
            expect(profile).toBeDefined()
            expect(profile?.id).toBe('test-user-id')

            // Обновление профиля
            const updateResult = await updateUserProfile({
                name: 'Updated Name'
            })
            expect(updateResult.success).toBe(true)
            expect(updateResult.user?.name).toBe('Updated Name')
        })
    })
})