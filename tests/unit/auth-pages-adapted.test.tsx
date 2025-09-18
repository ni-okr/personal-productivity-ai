/**
 * 🧪 Тесты страниц авторизации - адаптированы под существующую модель
 * 
 * Следует паттернам:
 * - Единый фреймворк тестирования
 * - Mock режим для безопасности
 * - Структурированное логирование
 * - Соответствие TEST_CONFIGS и MOCK_CONFIGS
 */

import AuthCallbackPage from '@/app/auth/callback/page'
import ConfirmEmailPage from '@/app/auth/confirm-email/page'
import ResetPasswordPage from '@/app/auth/reset-password/page'
import { MOCK_CONFIGS, TEST_CONFIGS, testFramework, testLogger, testMocks, testUtils } from '@/tests/framework'
import { fireEvent, waitFor } from '@testing-library/react'

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

describe('Auth Pages - Adapted Tests', () => {
    beforeEach(() => {
        // Настройка единого фреймворка тестирования
        testFramework.updateConfig(TEST_CONFIGS.UNIT)
        testMocks.updateConfig(MOCK_CONFIGS.MINIMAL)
        testMocks.setupAllMocks()
        testLogger.startTest('Auth Pages')

        // Очищаем моки
        mockPush.mockClear()
        mockReplace.mockClear()
    })

    afterEach(() => {
        testMocks.clearAllMocks()
        testLogger.endTest('Auth Pages', true)
    })

    describe('ConfirmEmailPage', () => {
        test('should render confirm email page correctly', async () => {
            testLogger.step('Rendering ConfirmEmailPage')

            const { getByText } = testUtils.renderWithProviders(<ConfirmEmailPage />)

            testLogger.assertion('Page elements rendered', true)
            expect(getByText('Подтверждение email')).toBeInTheDocument()
        })

        test('should handle successful email confirmation', async () => {
            testLogger.step('Testing successful email confirmation')

            // Настраиваем мок для успешного подтверждения
            testMocks.mockAuthSuccess()

            // Мокаем searchParams с токеном
            jest.doMock('next/navigation', () => ({
                useSearchParams: () => new URLSearchParams('token_hash=test-token&type=signup'),
                useRouter: () => ({
                    push: mockPush,
                    replace: mockReplace,
                }),
            }))

            const { getByText } = testUtils.renderWithProviders(<ConfirmEmailPage />)

            await waitFor(() => {
                testLogger.assertion('Email confirmed successfully', true)
                expect(getByText('Email успешно подтвержден')).toBeInTheDocument()
            })
        })

        test('should handle email confirmation error', async () => {
            testLogger.step('Testing email confirmation error')

            // Настраиваем мок для ошибки
            testMocks.mockAuthError('Неверный токен подтверждения')

            const { getByText } = testUtils.renderWithProviders(<ConfirmEmailPage />)

            await waitFor(() => {
                testLogger.assertion('Error message displayed', true)
                expect(getByText('Ошибка подтверждения email')).toBeInTheDocument()
            })
        })
    })

    describe('ResetPasswordPage', () => {
        test('should render reset password page correctly', async () => {
            testLogger.step('Rendering ResetPasswordPage')

            const { getByText } = testUtils.renderWithProviders(<ResetPasswordPage />)

            testLogger.assertion('Page elements rendered', true)
            expect(getByText('Установить новый пароль')).toBeInTheDocument()
        })

        test('should handle successful password reset', async () => {
            testLogger.step('Testing successful password reset')

            // Настраиваем мок для успешного сброса пароля
            testMocks.mockAuthSuccess()

            const { getByLabelText, getByRole } = testUtils.renderWithProviders(<ResetPasswordPage />)

            // Заполняем форму
            fireEvent.change(getByLabelText('Новый пароль'), { target: { value: 'newpassword123' } })
            fireEvent.change(getByLabelText('Подтвердите новый пароль'), { target: { value: 'newpassword123' } })

            // Отправляем форму
            fireEvent.click(getByRole('button', { name: /обновить пароль/i }))

            await waitFor(() => {
                testLogger.assertion('Password reset successful', true)
                expect(getByText('Пароль успешно обновлен!')).toBeInTheDocument()
            })
        })

        test('should handle password reset error', async () => {
            testLogger.step('Testing password reset error')

            // Настраиваем мок для ошибки
            testMocks.mockAuthError('Ошибка обновления пароля')

            const { getByLabelText, getByRole } = testUtils.renderWithProviders(<ResetPasswordPage />)

            // Заполняем форму
            fireEvent.change(getByLabelText('Новый пароль'), { target: { value: 'newpassword123' } })
            fireEvent.change(getByLabelText('Подтвердите новый пароль'), { target: { value: 'newpassword123' } })

            // Отправляем форму
            fireEvent.click(getByRole('button', { name: /обновить пароль/i }))

            await waitFor(() => {
                testLogger.assertion('Error message displayed', true)
                expect(getByText('Ошибка обновления пароля')).toBeInTheDocument()
            })
        })
    })

    describe('AuthCallbackPage', () => {
        test('should render auth callback page correctly', async () => {
            testLogger.step('Rendering AuthCallbackPage')

            const { getByText } = testUtils.renderWithProviders(<AuthCallbackPage />)

            testLogger.assertion('Page elements rendered', true)
            expect(getByText('Обработка авторизации')).toBeInTheDocument()
        })

        test('should handle successful OAuth callback', async () => {
            testLogger.step('Testing successful OAuth callback')

            // Настраиваем мок для успешного OAuth
            testMocks.mockAuthSuccess()

            // Мокаем searchParams с кодом
            jest.doMock('next/navigation', () => ({
                useSearchParams: () => new URLSearchParams('code=test-code&state=test-state'),
                useRouter: () => ({
                    push: mockPush,
                    replace: mockReplace,
                }),
            }))

            const { getByText } = testUtils.renderWithProviders(<AuthCallbackPage />)

            await waitFor(() => {
                testLogger.assertion('OAuth callback successful', true)
                expect(getByText('Авторизация успешна')).toBeInTheDocument()
            })
        })

        test('should handle OAuth callback error', async () => {
            testLogger.step('Testing OAuth callback error')

            // Настраиваем мок для ошибки
            testMocks.mockAuthError('Ошибка авторизации')

            const { getByText } = testUtils.renderWithProviders(<AuthCallbackPage />)

            await waitFor(() => {
                testLogger.assertion('Error message displayed', true)
                expect(getByText('Ошибка авторизации')).toBeInTheDocument()
            })
        })
    })
})
