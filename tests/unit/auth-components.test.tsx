/**
 * 🧪 Мигрирован с помощью единого фреймворка тестирования
 * 
 * Автоматически мигрирован: 2025-09-16T21:33:45.027Z
 * Оригинальный файл сохранен как: tests/unit/auth-components.test.tsx.backup
 * 
 * ВАЖНО: Все новые тесты должны использовать единый фреймворк!
 * См. документацию: tests/docs/TESTING_FRAMEWORK.md
 */

import { AuthModal } from '@/components/auth/AuthModal'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'
import { beforeEach, describe, expect, it } from '@jest/globals'
import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { TEST_CONFIGS, MOCK_CONFIGS } from '@/tests/framework'
import { testFramework, testLogger, testMocks, testUtils, TEST_CONFIGS, MOCK_CONFIGS } from '../framework'


// Mock auth functions
jest.mock('@/lib/auth', () => ({
    signIn: jest.fn(),
    signUp: jest.fn(),
    resetPassword: jest.fn(),
    signInWithGoogle: jest.fn(),
    signInWithGitHub: jest.fn()
}))

// Mock store
const mockSetUser = jest.fn()
jest.mock('@/stores/useAppStore', () => ({
    useAppStore: jest.fn(() => ({
        setUser: mockSetUser
    }))
}))

// Mock validation
jest.mock('@/utils/validation', () => ({
    validateEmail: jest.fn((email: string) => ({
        isValid: email.includes('@'),
        errors: email.includes('@') ? [] : ['Некорректный email']
    }))
}))

describe('Auth Components', () => {
    beforeEach(() => {
    // Настройка единого фреймворка тестирования
    testFramework.updateConfig(TEST_CONFIGS.UNIT)
    testMocks.updateConfig(MOCK_CONFIGS.MINIMAL)
    testMocks.setupAllMocks()
    testLogger.startTest('Test Suite')
        jest.clearAllMocks()
    })

    describe('LoginForm', () => {
        it('should render login form', () => {
            testUtils.renderWithProviders(<LoginForm />)

            expect(screen.getByText('Вход в аккаунт')).toBeTruthy()
            expect(screen.getByLabelText('Email')).toBeTruthy()
            expect(screen.getByLabelText('Пароль')).toBeTruthy()
            expect(screen.getByRole('button', { name: 'Войти' })).toBeTruthy()
        })

        it('should handle form submission', async () => {
            const { signIn } = await import('@/lib/auth')
            const mockSignIn = jest.mocked(signIn)
            mockSignIn.mockResolvedValue({
                success: true,
                user: {
                    id: '1',
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
            })

            testUtils.renderWithProviders(<LoginForm />)

            fireEvent.change(screen.getByLabelText('Email'), {
                target: { value: 'test@example.com' }
            })
            fireEvent.change(screen.getByLabelText('Пароль'), {
                target: { value: 'password123' }
            })

            fireEvent.click(screen.getByRole('button', { name: 'Войти' }))

            await testUtils.waitForState(() => {
                expect(mockSignIn).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' })
            })
        })

        it('should show error on invalid credentials', async () => {
            const { signIn } = await import('@/lib/auth')
            const mockSignIn = jest.mocked(signIn)
            mockSignIn.mockResolvedValue({
                success: false,
                error: 'Неверный email или пароль'
            })

            testUtils.renderWithProviders(<LoginForm />)

            fireEvent.change(screen.getByLabelText('Email'), {
                target: { value: 'test@example.com' }
            })
            fireEvent.change(screen.getByLabelText('Пароль'), {
                target: { value: 'wrongpassword' }
            })

            fireEvent.click(screen.getByRole('button', { name: 'Войти' }))

            await testUtils.waitForState(() => {
                expect(screen.getByText('Неверный email или пароль')).toBeTruthy()
            })
        })
    })

    describe('RegisterForm', () => {
        it('should render register form', () => {
            testUtils.renderWithProviders(<RegisterForm />)

            expect(screen.getByText('Создать аккаунт')).toBeTruthy()
            expect(screen.getByLabelText('Имя')).toBeTruthy()
            expect(screen.getByLabelText('Email')).toBeTruthy()
            expect(screen.getByLabelText('Пароль')).toBeTruthy()
            expect(screen.getByLabelText('Подтвердите пароль')).toBeTruthy()
            expect(screen.getByRole('button', { name: 'Зарегистрироваться' })).toBeTruthy()
        })

        it('should handle form submission', async () => {
            const { signUp } = await import('@/lib/auth')
            const mockSignUp = jest.mocked(signUp)
            mockSignUp.mockResolvedValue({
                success: true,
                user: {
                    id: '1',
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
            })

            testUtils.renderWithProviders(<RegisterForm />)

            fireEvent.change(screen.getByLabelText('Имя'), {
                target: { value: 'Test User' }
            })
            fireEvent.change(screen.getByLabelText('Email'), {
                target: { value: 'test@example.com' }
            })
            fireEvent.change(screen.getByLabelText('Пароль'), {
                target: { value: 'password123' }
            })
            fireEvent.change(screen.getByLabelText('Подтвердите пароль'), {
                target: { value: 'password123' }
            })

            fireEvent.click(screen.getByRole('button', { name: 'Зарегистрироваться' }))

            await testUtils.waitForState(() => {
                expect(mockSignUp).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123', name: 'Test User' })
            })
        })

        it('should show error on password mismatch', async () => {
            testUtils.renderWithProviders(<RegisterForm />)

            // Заполняем все обязательные поля
            fireEvent.change(screen.getByLabelText('Имя'), {
                target: { value: 'Test User' }
            })
            fireEvent.change(screen.getByLabelText('Email'), {
                target: { value: 'test@example.com' }
            })
            fireEvent.change(screen.getByLabelText('Пароль'), {
                target: { value: 'password123' }
            })
            fireEvent.change(screen.getByLabelText('Подтвердите пароль'), {
                target: { value: 'differentpassword' }
            })

            fireEvent.click(screen.getByRole('button', { name: 'Зарегистрироваться' }))

            // Ждем немного для обновления состояния
            await new Promise(resolve => setTimeout(resolve, 100))

            expect(screen.getByText('Пароли не совпадают')).toBeTruthy()
        })
    })

    describe('ResetPasswordForm', () => {
        it('should render reset password form', () => {
            testUtils.renderWithProviders(<ResetPasswordForm />)

            expect(screen.getByText('Восстановление пароля')).toBeTruthy()
            expect(screen.getByLabelText('Email')).toBeTruthy()
            expect(screen.getByRole('button', { name: 'Отправить ссылку' })).toBeTruthy()
        })

        it('should handle form submission', async () => {
            const { resetPassword } = await import('@/lib/auth')
            const mockResetPassword = jest.mocked(resetPassword)
            mockResetPassword.mockResolvedValue({
                success: true,
                message: 'Ссылка для восстановления отправлена'
            })

            testUtils.renderWithProviders(<ResetPasswordForm />)

            fireEvent.change(screen.getByLabelText('Email'), {
                target: { value: 'test@example.com' }
            })

            fireEvent.click(screen.getByRole('button', { name: 'Отправить ссылку' }))

            await testUtils.waitForState(() => {
                expect(mockResetPassword).toHaveBeenCalledWith('test@example.com')
            })
        })
    })

    describe('AuthModal', () => {
        it('should render auth modal', () => {
            testUtils.renderWithProviders(<AuthModal isOpen={true} onClose={jest.fn()} />)

            expect(screen.getByText('Вход в аккаунт')).toBeTruthy()
        })

        it('should close modal when close button is clicked', () => {
            const mockOnClose = jest.fn()
            testUtils.renderWithProviders(<AuthModal isOpen={true} onClose={mockOnClose} />)

            const closeButton = screen.getByRole('button', { name: /закрыть/i })
            fireEvent.click(closeButton)

            expect(mockOnClose).toHaveBeenCalled()
        })
    })
})
