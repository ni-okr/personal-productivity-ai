/**
 * 🧪 Тесты хуков авторизации - адаптированы под существующую модель
 * 
 * Следует паттернам:
 * - Единый фреймворк тестирования
 * - Mock режим для безопасности
 * - Структурированное логирование
 * - Соответствие TEST_CONFIGS и MOCK_CONFIGS
 */

import { useAuth } from '@/hooks/useAuth'
import { MOCK_CONFIGS, TEST_CONFIGS, testFramework, testLogger, testMocks, testUtils } from '@/tests/framework'
import { act, renderHook } from '@testing-library/react'

// Мокаем Next.js router
const mockPush = jest.fn()
const mockReplace = jest.fn()
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: mockReplace,
        back: jest.fn(),
        forward: jest.fn(),
        refresh: jest.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/',
}))

// Мокаем auth функции
jest.mock('@/lib/auth')

describe('Auth Hooks - Adapted Tests', () => {
    beforeEach(() => {
        // Настройка единого фреймворка тестирования
        testFramework.updateConfig(TEST_CONFIGS.UNIT)
        testMocks.updateConfig(MOCK_CONFIGS.MINIMAL)
        testMocks.setupAllMocks()
        testLogger.startTest('Auth Hooks')

        // Очищаем моки
        mockPush.mockClear()
        mockReplace.mockClear()
    })

    afterEach(() => {
        testMocks.clearAllMocks()
        testLogger.endTest('Auth Hooks', true)
    })

    describe('useAuth', () => {
        test('should initialize with default state', async () => {
            testLogger.step('Testing useAuth initialization')

            const { result } = renderHook(() => useAuth())

            testLogger.assertion('Hook initialized correctly', true)
            expect(result.current.user).toBeNull()
            expect(result.current.isLoading).toBe(false)
            expect(result.current.error).toBe('')
        })

        test('should handle successful sign in', async () => {
            testLogger.step('Testing successful sign in')

            // Настраиваем мок для успешного входа
            testMocks.mockAuthSuccess()
            testMocks.mockAuthUser(testUtils.generateUser())

            const { result } = renderHook(() => useAuth())

            await act(async () => {
                await result.current.signIn('test@taskai.space', 'password123')
            })

            testLogger.assertion('Sign in successful', true)
            expect(result.current.user).toBeTruthy()
            expect(result.current.isLoading).toBe(false)
            expect(result.current.error).toBe('')
        })

        test('should handle sign in error', async () => {
            testLogger.step('Testing sign in error')

            // Настраиваем мок для ошибки
            testMocks.mockAuthError('Неверный email или пароль')

            const { result } = renderHook(() => useAuth())

            await act(async () => {
                await result.current.signIn('wrong@example.com', 'wrongpassword')
            })

            testLogger.assertion('Sign in error handled', true)
            expect(result.current.user).toBeNull()
            expect(result.current.isLoading).toBe(false)
            expect(result.current.error).toBe('Неверный email или пароль')
        })

        test('should handle successful sign up', async () => {
            testLogger.step('Testing successful sign up')

            // Настраиваем мок для успешной регистрации
            testMocks.mockAuthSuccess()
            testMocks.mockAuthUser(testUtils.generateUser())

            const { result } = renderHook(() => useAuth())

            await act(async () => {
                await result.current.signUp({
                    email: 'test@taskai.space',
                    password: 'password123',
                    name: 'Test User'
                })
            })

            testLogger.assertion('Sign up successful', true)
            expect(result.current.user).toBeTruthy()
            expect(result.current.isLoading).toBe(false)
            expect(result.current.error).toBe('')
        })

        test('should handle sign up error', async () => {
            testLogger.step('Testing sign up error')

            // Настраиваем мок для ошибки
            testMocks.mockAuthError('Email уже используется')

            const { result } = renderHook(() => useAuth())

            await act(async () => {
                await result.current.signUp({
                    email: 'existing@example.com',
                    password: 'password123',
                    name: 'Test User'
                })
            })

            testLogger.assertion('Sign up error handled', true)
            expect(result.current.user).toBeNull()
            expect(result.current.isLoading).toBe(false)
            expect(result.current.error).toBe('Email уже используется')
        })

        test('should handle successful sign out', async () => {
            testLogger.step('Testing successful sign out')

            // Настраиваем мок для успешного выхода
            testMocks.mockAuthSuccess()

            const { result } = renderHook(() => useAuth())

            await act(async () => {
                await result.current.signOut()
            })

            testLogger.assertion('Sign out successful', true)
            expect(result.current.user).toBeNull()
            expect(result.current.isLoading).toBe(false)
            expect(result.current.error).toBe('')
        })

        test('should handle successful password reset', async () => {
            testLogger.step('Testing successful password reset')

            // Настраиваем мок для успешного сброса пароля
            testMocks.mockAuthSuccess()

            const { result } = renderHook(() => useAuth())

            await act(async () => {
                await result.current.resetPassword('test@taskai.space')
            })

            testLogger.assertion('Password reset successful', true)
            expect(result.current.isLoading).toBe(false)
            expect(result.current.error).toBe('')
        })

        test('should handle password reset error', async () => {
            testLogger.step('Testing password reset error')

            // Настраиваем мок для ошибки
            testMocks.mockAuthError('Email не найден')

            const { result } = renderHook(() => useAuth())

            await act(async () => {
                await result.current.resetPassword('nonexistent@example.com')
            })

            testLogger.assertion('Password reset error handled', true)
            expect(result.current.isLoading).toBe(false)
            expect(result.current.error).toBe('Email не найден')
        })

        test('should handle successful password update', async () => {
            testLogger.step('Testing successful password update')

            // Настраиваем мок для успешного обновления пароля
            testMocks.mockAuthSuccess()

            const { result } = renderHook(() => useAuth())

            await act(async () => {
                await result.current.updatePassword('newpassword123')
            })

            testLogger.assertion('Password update successful', true)
            expect(result.current.isLoading).toBe(false)
            expect(result.current.error).toBe('')
        })

        test('should handle password update error', async () => {
            testLogger.step('Testing password update error')

            // Настраиваем мок для ошибки
            testMocks.mockAuthError('Неверный текущий пароль')

            const { result } = renderHook(() => useAuth())

            await act(async () => {
                await result.current.updatePassword('newpassword123')
            })

            testLogger.assertion('Password update error handled', true)
            expect(result.current.isLoading).toBe(false)
            expect(result.current.error).toBe('Неверный текущий пароль')
        })

        test('should handle successful email confirmation', async () => {
            testLogger.step('Testing successful email confirmation')

            // Настраиваем мок для успешного подтверждения email
            testMocks.mockAuthSuccess()

            const { result } = renderHook(() => useAuth())

            await act(async () => {
                await result.current.confirmEmail('test-token')
            })

            testLogger.assertion('Email confirmation successful', true)
            expect(result.current.isLoading).toBe(false)
            expect(result.current.error).toBe('')
        })

        test('should handle email confirmation error', async () => {
            testLogger.step('Testing email confirmation error')

            // Настраиваем мок для ошибки
            testMocks.mockAuthError('Неверный токен подтверждения')

            const { result } = renderHook(() => useAuth())

            await act(async () => {
                await result.current.confirmEmail('invalid-token')
            })

            testLogger.assertion('Email confirmation error handled', true)
            expect(result.current.isLoading).toBe(false)
            expect(result.current.error).toBe('Неверный токен подтверждения')
        })

        test('should handle successful Google sign in', async () => {
            testLogger.step('Testing successful Google sign in')

            // Настраиваем мок для успешного входа через Google
            testMocks.mockAuthSuccess()
            testMocks.mockAuthUser(testUtils.generateUser())

            const { result } = renderHook(() => useAuth())

            await act(async () => {
                await result.current.signInWithGoogle()
            })

            testLogger.assertion('Google sign in successful', true)
            expect(result.current.user).toBeTruthy()
            expect(result.current.isLoading).toBe(false)
            expect(result.current.error).toBe('')
        })

        test('should handle successful GitHub sign in', async () => {
            testLogger.step('Testing successful GitHub sign in')

            // Настраиваем мок для успешного входа через GitHub
            testMocks.mockAuthSuccess()
            testMocks.mockAuthUser(testUtils.generateUser())

            const { result } = renderHook(() => useAuth())

            await act(async () => {
                await result.current.signInWithGitHub()
            })

            testLogger.assertion('GitHub sign in successful', true)
            expect(result.current.user).toBeTruthy()
            expect(result.current.isLoading).toBe(false)
            expect(result.current.error).toBe('')
        })

        test('should handle network error', async () => {
            testLogger.step('Testing network error handling')

            // Настраиваем мок для сетевой ошибки
            testMocks.mockNetworkError()

            const { result } = renderHook(() => useAuth())

            await act(async () => {
                await result.current.signIn('test@taskai.space', 'password123')
            })

            testLogger.assertion('Network error handled', true)
            expect(result.current.user).toBeNull()
            expect(result.current.isLoading).toBe(false)
            expect(result.current.error).toBe('Ошибка сети')
        })
    })
})
