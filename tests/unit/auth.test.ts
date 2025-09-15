import {
    confirmEmail,
    getCurrentUser,
    getUserProfile,
    resetPassword,
    signIn,
    signInWithGitHub,
    signInWithGoogle,
    signOut,
    signUp,
    updatePassword,
    updateUserProfile
} from '@/lib/auth'
import { beforeEach, describe, expect, it } from '@jest/globals'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            signUp: jest.fn(),
            signInWithPassword: jest.fn(),
            signOut: jest.fn(),
            resetPasswordForEmail: jest.fn(),
            signInWithOAuth: jest.fn(),
            getUser: jest.fn(),
            verifyOtp: jest.fn(),
            updateUser: jest.fn()
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

describe('Auth Functions', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('signUp', () => {
        it('should register user successfully', async () => {
            const mockSupabase = await import('@/lib/supabase')
            const mockSignUp = jest.mocked(mockSupabase.supabase.auth.signUp)

            mockSignUp.mockResolvedValue({
                data: {
                    user: {
                        id: 'test-user-id',
                        email: 'test@example.com',
                        email_confirmed_at: '2024-01-01T00:00:00Z',
                        user_metadata: { name: 'Test User' },
                        app_metadata: {},
                        aud: 'authenticated',
                        created_at: '2024-01-01T00:00:00Z'
                    },
                    session: null
                },
                error: null
            })

            const result = await signUp({
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User'
            })

            expect(result.success).toBe(true)
            expect(result.user).toBeDefined()
            expect(result.user?.email).toBe('test@example.com')
        })

        it('should handle registration error', async () => {
            const mockSupabase = await import('@/lib/supabase')
            const mockSignUp = jest.mocked(mockSupabase.supabase.auth.signUp)

            mockSignUp.mockResolvedValue({
                data: { user: null, session: null },
                error: {
                    message: 'User already registered',
                    code: 'user_already_registered',
                    status: 400,
                    __isAuthError: true,
                    name: 'AuthError'
                } as any
            })

            const result = await signUp({
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User'
            })

            expect(result.success).toBe(false)
            expect(result.error).toBe('Пользователь с таким email уже существует')
        })
    })

    describe('signIn', () => {
        it('should sign in user successfully', async () => {
            const mockSupabase = await import('@/lib/supabase')
            const mockSignIn = jest.mocked(mockSupabase.supabase.auth.signInWithPassword)

            mockSignIn.mockResolvedValue({
                data: {
                    user: {
                        id: 'test-user-id',
                        email: 'test@example.com',
                        user_metadata: { name: 'Test User' },
                        app_metadata: {},
                        aud: 'authenticated',
                        created_at: '2024-01-01T00:00:00Z'
                    },
                    session: {
                        access_token: 'mock-token',
                        refresh_token: 'mock-refresh-token',
                        expires_in: 3600,
                        expires_at: Date.now() + 3600000,
                        token_type: 'bearer',
                        user: {
                            id: 'test-user-id',
                            email: 'test@example.com',
                            user_metadata: { name: 'Test User' },
                            app_metadata: {},
                            aud: 'authenticated',
                            created_at: '2024-01-01T00:00:00Z'
                        }
                    }
                },
                error: null
            })

            const result = await signIn({
                email: 'test@example.com',
                password: 'password123'
            })

            expect(result.success).toBe(true)
            expect(result.user).toBeDefined()
        })

        it('should handle sign in error', async () => {
            const mockSupabase = await import('@/lib/supabase')
            const mockSignIn = jest.mocked(mockSupabase.supabase.auth.signInWithPassword)

            mockSignIn.mockResolvedValue({
                data: { user: null, session: null },
                error: {
                    message: 'Invalid login credentials',
                    code: 'invalid_credentials',
                    status: 400,
                    __isAuthError: true,
                    name: 'AuthError'
                } as any
            })

            const result = await signIn({
                email: 'test@example.com',
                password: 'wrongpassword'
            })

            expect(result.success).toBe(false)
            expect(result.error).toBe('Неверный email или пароль')
        })
    })

    describe('signOut', () => {
        it('should sign out user successfully', async () => {
            const mockSupabase = await import('@/lib/supabase')
            const mockSignOut = jest.mocked(mockSupabase.supabase.auth.signOut)

            mockSignOut.mockResolvedValue({ error: null })

            const result = await signOut()

            expect(result.success).toBe(true)
            expect(result.message).toBe('Вы успешно вышли из системы')
        })
    })

    describe('resetPassword', () => {
        it('should send reset password email', async () => {
            const mockSupabase = await import('@/lib/supabase')
            const mockResetPassword = jest.mocked(mockSupabase.supabase.auth.resetPasswordForEmail)

            mockResetPassword.mockResolvedValue({ data: {}, error: null })

            const result = await resetPassword('test@example.com')

            expect(result.success).toBe(true)
            expect(result.message).toBe('Инструкции по сбросу пароля отправлены на email')
        })
    })

    describe('signInWithGoogle', () => {
        it('should initiate Google sign in', async () => {
            const mockSupabase = await import('@/lib/supabase')
            const mockSignInWithOAuth = jest.mocked(mockSupabase.supabase.auth.signInWithOAuth)

            mockSignInWithOAuth.mockResolvedValue({
                data: { url: 'https://google.com/oauth', provider: 'google' },
                error: null
            })

            const result = await signInWithGoogle()

            expect(result.success).toBe(true)
            expect(result.message).toBe('Перенаправление на Google...')
        })
    })

    describe('signInWithGitHub', () => {
        it('should initiate GitHub sign in', async () => {
            const mockSupabase = await import('@/lib/supabase')
            const mockSignInWithOAuth = jest.mocked(mockSupabase.supabase.auth.signInWithOAuth)

            mockSignInWithOAuth.mockResolvedValue({
                data: { url: 'https://github.com/oauth', provider: 'github' },
                error: null
            })

            const result = await signInWithGitHub()

            expect(result.success).toBe(true)
            expect(result.message).toBe('Перенаправление на GitHub...')
        })
    })

    describe('getCurrentUser', () => {
        it('should get current user', async () => {
            const mockSupabase = await import('@/lib/supabase')
            const mockGetUser = jest.mocked(mockSupabase.supabase.auth.getUser)

            mockGetUser.mockResolvedValue({
                data: {
                    user: {
                        id: 'test-user-id',
                        email: 'test@example.com',
                        app_metadata: {},
                        user_metadata: {},
                        aud: 'authenticated',
                        created_at: '2024-01-01T00:00:00Z'
                    }
                },
                error: null
            })

            const result = await getCurrentUser()

            expect(result).toBeDefined()
            expect(result?.id).toBe('test-user-id')
        })
    })

    describe('getUserProfile', () => {
        it('should get user profile', async () => {
            const result = await getUserProfile('test-user-id')

            expect(result).toBeDefined()
            expect(result?.id).toBe('test-user-id')
            expect(result?.email).toBe('test@example.com')
        })
    })

    describe('updateUserProfile', () => {
        it('should update user profile', async () => {
            const result = await updateUserProfile('test-user-id', {
                name: 'Updated Name'
            })

            expect(result.success).toBe(true)
            expect(result.message).toBe('Профиль успешно обновлен')
        })
    })

    describe('confirmEmail', () => {
        it('should confirm email', async () => {
            const mockSupabase = await import('@/lib/supabase')
            const mockVerifyOtp = jest.mocked(mockSupabase.supabase.auth.verifyOtp)

            mockVerifyOtp.mockResolvedValue({
                data: {
                    user: {
                        id: 'test-user-id',
                        email: 'test@example.com',
                        app_metadata: {},
                        user_metadata: {},
                        aud: 'authenticated',
                        created_at: '2024-01-01T00:00:00Z'
                    },
                    session: {
                        access_token: 'mock-token',
                        refresh_token: 'mock-refresh-token',
                        expires_in: 3600,
                        expires_at: Date.now() + 3600000,
                        token_type: 'bearer',
                        user: {
                            id: 'test-user-id',
                            email: 'test@example.com',
                            app_metadata: {},
                            user_metadata: {},
                            aud: 'authenticated',
                            created_at: '2024-01-01T00:00:00Z'
                        }
                    }
                },
                error: null
            })

            const result = await confirmEmail('test-token')

            expect(result.success).toBe(true)
            expect(result.message).toBe('Email успешно подтвержден!')
        })
    })

    describe('updatePassword', () => {
        it('should update password', async () => {
            const mockSupabase = await import('@/lib/supabase')
            const mockUpdateUser = jest.mocked(mockSupabase.supabase.auth.updateUser)

            mockUpdateUser.mockResolvedValue({
                data: {
                    user: {
                        id: 'test-user-id',
                        email: 'test@example.com',
                        app_metadata: {},
                        user_metadata: {},
                        aud: 'authenticated',
                        created_at: '2024-01-01T00:00:00Z'
                    }
                },
                error: null
            })

            const result = await updatePassword('newpassword123')

            expect(result.success).toBe(true)
            expect(result.message).toBe('Пароль успешно обновлен')
        })
    })
})
