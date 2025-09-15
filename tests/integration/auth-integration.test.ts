import {
    getCurrentUser,
    getUserProfile,
    signIn,
    signUp,
    updateUserProfile
} from '@/lib/auth'
import { beforeEach, describe, expect, it } from '@jest/globals'

// Mock Supabase для интеграционных тестов
jest.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            signUp: jest.fn(),
            signInWithPassword: jest.fn(),
            signOut: jest.fn(),
            getUser: jest.fn()
        },
        from: jest.fn(() => ({
            insert: jest.fn(() => ({
                error: null
            })),
            update: jest.fn(() => ({
                eq: jest.fn(() => ({
                    select: jest.fn(() => ({
                        single: jest.fn(() => ({
                            data: {
                                id: 'test-user-id',
                                email: 'test@example.com',
                                name: 'Test User',
                                subscription: 'free',
                                created_at: '2024-01-01T00:00:00Z',
                                last_login_at: '2024-01-01T00:00:00Z'
                            },
                            error: null
                        }))
                    }))
                }))
            })),
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    single: jest.fn(() => ({
                        data: {
                            id: 'test-user-id',
                            email: 'test@example.com',
                            name: 'Test User',
                            subscription: 'free',
                            created_at: '2024-01-01T00:00:00Z',
                            last_login_at: '2024-01-01T00:00:00Z'
                        },
                        error: null
                    }))
                }))
            }))
        }))
    }
}))

describe('Auth Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Complete Auth Flow', () => {
        it('should complete full registration and login flow', async () => {
            const mockSupabase = await import('@/lib/supabase')
            const mockSignUp = jest.mocked(mockSupabase.supabase.auth.signUp)
            const mockSignIn = jest.mocked(mockSupabase.supabase.auth.signInWithPassword)
            const mockGetUser = jest.mocked(mockSupabase.supabase.auth.getUser)

            // Mock successful registration
            mockSignUp.mockResolvedValue({
                data: {
                    user: {
                        id: 'test-user-id',
                        email: 'test@example.com',
                        email_confirmed_at: '2024-01-01T00:00:00Z',
                        user_metadata: { name: 'Test User' }
                    }
                },
                error: null
            })

            // Mock successful login
            mockSignIn.mockResolvedValue({
                data: {
                    user: {
                        id: 'test-user-id',
                        email: 'test@example.com',
                        user_metadata: { name: 'Test User' }
                    }
                },
                error: null
            })

            // Mock get current user
            mockGetUser.mockResolvedValue({
                data: {
                    user: {
                        id: 'test-user-id',
                        email: 'test@example.com'
                    }
                },
                error: null
            })

            // Test registration
            const signUpResult = await signUp({
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User'
            })

            expect(signUpResult.success).toBe(true)
            expect(signUpResult.user).toBeDefined()

            // Test login
            const signInResult = await signIn({
                email: 'test@example.com',
                password: 'password123'
            })

            expect(signInResult.success).toBe(true)
            expect(signInResult.user).toBeDefined()

            // Test get current user
            const currentUser = await getCurrentUser()
            expect(currentUser).toBeDefined()
            expect(currentUser?.id).toBe('test-user-id')
        })

        it('should handle profile updates', async () => {
            const mockSupabase = await import('@/lib/supabase')
            const mockUpdate = jest.mocked(mockSupabase.supabase.from)

            // Mock successful profile update
            mockUpdate.mockReturnValue({
                update: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        select: vi.fn(() => ({
                            single: vi.fn(() => ({
                                data: {
                                    id: 'test-user-id',
                                    email: 'test@example.com',
                                    name: 'Updated Name',
                                    subscription: 'premium',
                                    created_at: '2024-01-01T00:00:00Z',
                                    last_login_at: '2024-01-01T00:00:00Z'
                                },
                                error: null
                            }))
                        }))
                    }))
                }))
            } as any)

            const result = await updateUserProfile('test-user-id', {
                name: 'Updated Name',
                subscription: 'premium'
            })

            expect(result.success).toBe(true)
            expect(result.user?.name).toBe('Updated Name')
            expect(result.user?.subscription).toBe('premium')
        })
    })

    describe('Error Handling', () => {
        it('should handle network errors gracefully', async () => {
            const mockSupabase = await import('@/lib/supabase')
            const mockSignIn = jest.mocked(mockSupabase.supabase.auth.signInWithPassword)

            // Mock network error
            mockSignIn.mockRejectedValue(new Error('Network error'))

            const result = await signIn({
                email: 'test@example.com',
                password: 'password123'
            })

            expect(result.success).toBe(false)
            expect(result.error).toBe('Произошла ошибка при входе')
        })

        it('should handle database errors gracefully', async () => {
            const mockSupabase = await import('@/lib/supabase')
            const mockFrom = jest.mocked(mockSupabase.supabase.from)

            // Mock database error
            mockFrom.mockReturnValue({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn(() => ({
                            data: null,
                            error: { message: 'Database connection failed' }
                        }))
                    }))
                }))
            } as any)

            const result = await getUserProfile('test-user-id')

            expect(result).toBeNull()
        })
    })

    describe('Data Consistency', () => {
        it('should maintain data consistency across operations', async () => {
            const mockSupabase = await import('@/lib/supabase')
            const mockSignUp = jest.mocked(mockSupabase.supabase.auth.signUp)
            const mockGetUser = jest.mocked(mockSupabase.supabase.auth.getUser)

            // Mock successful registration
            mockSignUp.mockResolvedValue({
                data: {
                    user: {
                        id: 'test-user-id',
                        email: 'test@example.com',
                        email_confirmed_at: '2024-01-01T00:00:00Z',
                        user_metadata: { name: 'Test User' }
                    }
                },
                error: null
            })

            // Mock get current user
            mockGetUser.mockResolvedValue({
                data: {
                    user: {
                        id: 'test-user-id',
                        email: 'test@example.com'
                    }
                },
                error: null
            })

            // Test registration
            const signUpResult = await signUp({
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User'
            })

            expect(signUpResult.success).toBe(true)
            expect(signUpResult.user?.id).toBe('test-user-id')
            expect(signUpResult.user?.email).toBe('test@example.com')

            // Test get current user returns same data
            const currentUser = await getCurrentUser()
            expect(currentUser?.id).toBe('test-user-id')
            expect(currentUser?.email).toBe('test@example.com')
        })
    })
})
