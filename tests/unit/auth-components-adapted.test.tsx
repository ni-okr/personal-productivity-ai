/**
 * 🧪 Тесты компонентов авторизации - адаптированы под существующую модель
 * 
 * Следует паттернам:
 * - Единый фреймворк тестирования
 * - Mock режим для безопасности
 * - Структурированное логирование
 * - Соответствие TEST_CONFIGS и MOCK_CONFIGS
 */

import { AuthModal } from '@/components/auth/AuthModal'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'
import { UpdatePasswordForm } from '@/components/auth/UpdatePasswordForm'
import { MOCK_CONFIGS, TEST_CONFIGS, testFramework, testLogger, testMocks, testUtils } from '@/tests/framework'
import { fireEvent, screen, waitFor } from '@testing-library/react'

// Мокаем auth функции
jest.mock('@/lib/auth')

describe('Auth Components - Adapted Tests', () => {
    beforeEach(() => {
        // Настройка единого фреймворка тестирования
        testFramework.updateConfig(TEST_CONFIGS.UNIT)
        testMocks.updateConfig(MOCK_CONFIGS.MINIMAL)
        testMocks.setupAllMocks()
        testLogger.startTest('Auth Components')
    })

    afterEach(() => {
        testMocks.clearAllMocks()
        testLogger.endTest('Auth Components', true)
    })

    describe('LoginForm', () => {
        test('should render login form correctly', async () => {
            testLogger.step('Rendering LoginForm')

            const { getByText, getByLabelText } = testUtils.renderWithProviders(
                <LoginForm onSuccess={() => { }} onSwitchToRegister={() => { }} onSwitchToReset={() => { }} />
            )

            testLogger.assertion('Form elements rendered', true)
            expect(getByText('Войти в систему')).toBeInTheDocument()
            expect(getByLabelText('Email')).toBeInTheDocument()
            expect(getByLabelText('Пароль')).toBeInTheDocument()
        })

        test('should handle form submission', async () => {
            testLogger.step('Testing form submission')

            // Настраиваем мок для успешного входа
            testMocks.mockAuthSuccess()

            const mockOnSuccess = jest.fn()
            const { getByLabelText, getByRole } = testUtils.renderWithProviders(
                <LoginForm onSuccess={mockOnSuccess} onSwitchToRegister={() => { }} onSwitchToReset={() => { }} />
            )

            // Заполняем форму
            fireEvent.change(getByLabelText('Email'), { target: { value: 'test@example.com' } })
            fireEvent.change(getByLabelText('Пароль'), { target: { value: 'password123' } })

            // Отправляем форму
            fireEvent.click(getByRole('button', { name: /войти/i }))

            await waitFor(() => {
                testLogger.assertion('Form submitted successfully', true)
                expect(mockOnSuccess).toHaveBeenCalled()
            })
        })

        test('should show error on invalid credentials', async () => {
            testLogger.step('Testing error handling')

            // Настраиваем мок для ошибки
            testMocks.mockAuthError('Неверный email или пароль')

            const { getByLabelText, getByRole } = testUtils.renderWithProviders(
                <LoginForm onSuccess={() => { }} onSwitchToRegister={() => { }} onSwitchToReset={() => { }} />
            )

            // Заполняем форму
            fireEvent.change(getByLabelText('Email'), { target: { value: 'wrong@example.com' } })
            fireEvent.change(getByLabelText('Пароль'), { target: { value: 'wrongpassword' } })

            // Отправляем форму
            fireEvent.click(getByRole('button', { name: /войти/i }))

            await waitFor(() => {
                testLogger.assertion('Error message displayed', true)
                expect(screen.getByText('Неверный email или пароль')).toBeInTheDocument()
            })
        })
    })

    describe('RegisterForm', () => {
        test('should render register form correctly', async () => {
            testLogger.step('Rendering RegisterForm')

            const { getByText, getByLabelText } = testUtils.renderWithProviders(
                <RegisterForm onSuccess={() => { }} onSwitchToLogin={() => { }} />
            )

            testLogger.assertion('Form elements rendered', true)
            expect(getByText('Создать аккаунт')).toBeInTheDocument()
            expect(getByLabelText('Имя')).toBeInTheDocument()
            expect(getByLabelText('Email')).toBeInTheDocument()
            expect(getByLabelText('Пароль')).toBeInTheDocument()
            expect(getByLabelText('Подтвердите пароль')).toBeInTheDocument()
        })

        test('should handle form submission', async () => {
            testLogger.step('Testing registration submission')

            // Настраиваем мок для успешной регистрации
            testMocks.mockAuthSuccess()

            const mockOnSuccess = jest.fn()
            const { getByLabelText, getByRole } = testUtils.renderWithProviders(
                <RegisterForm onSuccess={mockOnSuccess} onSwitchToLogin={() => { }} />
            )

            // Заполняем форму
            fireEvent.change(getByLabelText('Имя'), { target: { value: 'Test User' } })
            fireEvent.change(getByLabelText('Email'), { target: { value: 'test@example.com' } })
            fireEvent.change(getByLabelText('Пароль'), { target: { value: 'password123' } })
            fireEvent.change(getByLabelText('Подтвердите пароль'), { target: { value: 'password123' } })

            // Отправляем форму
            fireEvent.click(getByRole('button', { name: /зарегистрироваться/i }))

            await waitFor(() => {
                testLogger.assertion('Registration successful', true)
                expect(mockOnSuccess).toHaveBeenCalled()
            })
        })

        test('should show error on password mismatch', async () => {
            testLogger.step('Testing password validation')

            const { getByLabelText, getByRole } = testUtils.renderWithProviders(
                <RegisterForm onSuccess={() => { }} onSwitchToLogin={() => { }} />
            )

            // Заполняем форму с разными паролями
            fireEvent.change(getByLabelText('Имя'), { target: { value: 'Test User' } })
            fireEvent.change(getByLabelText('Email'), { target: { value: 'test@example.com' } })
            fireEvent.change(getByLabelText('Пароль'), { target: { value: 'password123' } })
            fireEvent.change(getByLabelText('Подтвердите пароль'), { target: { value: 'differentpassword' } })

            // Отправляем форму
            fireEvent.click(getByRole('button', { name: /зарегистрироваться/i }))

            await waitFor(() => {
                testLogger.assertion('Password mismatch error displayed', true)
                expect(screen.getByText('Пароли не совпадают')).toBeInTheDocument()
            })
        })
    })

    describe('ResetPasswordForm', () => {
        test('should render reset password form correctly', async () => {
            testLogger.step('Rendering ResetPasswordForm')

            const { getByText, getByLabelText } = testUtils.renderWithProviders(
                <ResetPasswordForm onSuccess={() => { }} onSwitchToLogin={() => { }} />
            )

            testLogger.assertion('Form elements rendered', true)
            expect(getByText('Восстановить пароль')).toBeInTheDocument()
            expect(getByLabelText('Email')).toBeInTheDocument()
        })

        test('should handle form submission', async () => {
            testLogger.step('Testing password reset submission')

            // Настраиваем мок для успешного сброса пароля
            testMocks.mockAuthSuccess()

            const mockOnSuccess = jest.fn()
            const { getByLabelText, getByRole } = testUtils.renderWithProviders(
                <ResetPasswordForm onSuccess={mockOnSuccess} onSwitchToLogin={() => { }} />
            )

            // Заполняем форму
            fireEvent.change(getByLabelText('Email'), { target: { value: 'test@example.com' } })

            // Отправляем форму
            fireEvent.click(getByRole('button', { name: /отправить/i }))

            await waitFor(() => {
                testLogger.assertion('Password reset successful', true)
                expect(mockOnSuccess).toHaveBeenCalled()
            })
        })
    })

    describe('UpdatePasswordForm', () => {
        test('should render update password form correctly', async () => {
            testLogger.step('Rendering UpdatePasswordForm')

            const { getByText, getByLabelText } = testUtils.renderWithProviders(
                <UpdatePasswordForm onSuccess={() => { }} onCancel={() => { }} />
            )

            testLogger.assertion('Form elements rendered', true)
            expect(getByText('Установить новый пароль')).toBeInTheDocument()
            expect(getByLabelText('Новый пароль')).toBeInTheDocument()
            expect(getByLabelText('Подтвердите новый пароль')).toBeInTheDocument()
        })

        test('should handle form submission', async () => {
            testLogger.step('Testing password update submission')

            // Настраиваем мок для успешного обновления пароля
            testMocks.mockAuthSuccess()

            const mockOnSuccess = jest.fn()
            const { getByLabelText, getByRole } = testUtils.renderWithProviders(
                <UpdatePasswordForm onSuccess={mockOnSuccess} onCancel={() => { }} />
            )

            // Заполняем форму
            fireEvent.change(getByLabelText('Новый пароль'), { target: { value: 'newpassword123' } })
            fireEvent.change(getByLabelText('Подтвердите новый пароль'), { target: { value: 'newpassword123' } })

            // Отправляем форму
            fireEvent.click(getByRole('button', { name: /обновить пароль/i }))

            await waitFor(() => {
                testLogger.assertion('Password update successful', true)
                expect(mockOnSuccess).toHaveBeenCalled()
            })
        })
    })

    describe('AuthModal', () => {
        test('should render auth modal correctly', async () => {
            testLogger.step('Rendering AuthModal')

            const { getByText } = testUtils.renderWithProviders(
                <AuthModal isOpen={true} onClose={() => { }} />
            )

            testLogger.assertion('Modal rendered', true)
            expect(getByText('Войти в систему')).toBeInTheDocument()
        })

        test('should switch between login and register modes', async () => {
            testLogger.step('Testing mode switching')

            const { getByText, getByRole } = testUtils.renderWithProviders(
                <AuthModal isOpen={true} onClose={() => { }} />
            )

            // Переключаемся на регистрацию
            fireEvent.click(getByRole('button', { name: /создать аккаунт/i }))

            await waitFor(() => {
                testLogger.assertion('Switched to register mode', true)
                expect(getByText('Создать аккаунт')).toBeInTheDocument()
            })
        })
    })
})
