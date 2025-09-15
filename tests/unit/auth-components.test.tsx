import { AuthModal } from '@/components/auth/AuthModal'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'
import { beforeEach, describe, expect, it } from '@jest/globals'
import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

// Mock auth functions
jest.mock('@/lib/auth', () => ({
    signIn: jest.fn(),
    signUp: jest.fn(),
    resetPassword: jest.fn(),
    signInWithGoogle: jest.fn(),
    signInWithGitHub: jest.fn()
}))

// Mock store
jest.mock('@/stores/useAppStore', () => ({
    useAppStore: jest.fn(() => ({
        setUser: jest.fn()
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
        jest.clearAllMocks()
    })

    describe('LoginForm', () => {
        it('should render login form', () => {
            render(<LoginForm />)

            expect(screen.getByText('Вход в аккаунт')).toBeInTheDocument()
            expect(screen.getByLabelText('Email')).toBeInTheDocument()
            expect(screen.getByLabelText('Пароль')).toBeInTheDocument()
            expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument()
        })

        it('should handle form submission', async () => {
            const mockSignIn = jest.fn().mockResolvedValue({
                success: true,
                user: { id: '1', email: 'test@example.com' }
            })

            jest.mocked(await import('@/lib/auth')).signIn = mockSignIn

            render(<LoginForm />)

            fireEvent.change(screen.getByLabelText('Email'), {
                target: { value: 'test@example.com' }
            })
            fireEvent.change(screen.getByLabelText('Пароль'), {
                target: { value: 'password123' }
            })

            fireEvent.click(screen.getByRole('button', { name: 'Войти' }))

            await waitFor(() => {
                expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
            })
        })

        it('should show error on invalid credentials', async () => {
            const mockSignIn = jest.fn().mockResolvedValue({
                success: false,
                error: 'Неверный email или пароль'
            })

            jest.mocked(await import('@/lib/auth')).signIn = mockSignIn

            render(<LoginForm />)

            fireEvent.change(screen.getByLabelText('Email'), {
                target: { value: 'test@example.com' }
            })
            fireEvent.change(screen.getByLabelText('Пароль'), {
                target: { value: 'wrongpassword' }
            })

            fireEvent.click(screen.getByRole('button', { name: 'Войти' }))

            await waitFor(() => {
                expect(screen.getByText('Неверный email или пароль')).toBeInTheDocument()
            })
        })

        it('should switch to register form', () => {
            const mockOnSwitchToRegister = jest.fn()
            render(<LoginForm onSwitchToRegister={mockOnSwitchToRegister} />)

            fireEvent.click(screen.getByText('Зарегистрироваться'))
            expect(mockOnSwitchToRegister).toHaveBeenCalled()
        })

        it('should switch to reset password form', () => {
            const mockOnSwitchToReset = jest.fn()
            render(<LoginForm onSwitchToReset={mockOnSwitchToReset} />)

            fireEvent.click(screen.getByText('Забыли пароль?'))
            expect(mockOnSwitchToReset).toHaveBeenCalled()
        })
    })

    describe('RegisterForm', () => {
        it('should render register form', () => {
            render(<RegisterForm />)

            expect(screen.getByText('Создать аккаунт')).toBeInTheDocument()
            expect(screen.getByLabelText('Email')).toBeInTheDocument()
            expect(screen.getByLabelText('Пароль')).toBeInTheDocument()
            expect(screen.getByLabelText('Подтвердите пароль')).toBeInTheDocument()
            expect(screen.getByRole('button', { name: 'Зарегистрироваться' })).toBeInTheDocument()
        })

        it('should handle form submission', async () => {
            const mockSignUp = jest.fn().mockResolvedValue({
                success: true,
                user: { id: '1', email: 'test@example.com' }
            })

            jest.mocked(await import('@/lib/auth')).signUp = mockSignUp

            render(<RegisterForm />)

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

            await waitFor(() => {
                expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123')
            })
        })

        it('should show error on password mismatch', async () => {
            render(<RegisterForm />)

            fireEvent.change(screen.getByLabelText('Пароль'), {
                target: { value: 'password123' }
            })
            fireEvent.change(screen.getByLabelText('Подтвердите пароль'), {
                target: { value: 'differentpassword' }
            })

            fireEvent.click(screen.getByRole('button', { name: 'Зарегистрироваться' }))

            await waitFor(() => {
                expect(screen.getByText('Пароли не совпадают')).toBeInTheDocument()
            })
        })

        it('should switch to login form', () => {
            const mockOnSwitchToLogin = jest.fn()
            render(<RegisterForm onSwitchToLogin={mockOnSwitchToLogin} />)

            fireEvent.click(screen.getByText('Войти'))
            expect(mockOnSwitchToLogin).toHaveBeenCalled()
        })
    })

    describe('ResetPasswordForm', () => {
        it('should render reset password form', () => {
            render(<ResetPasswordForm />)

            expect(screen.getByText('Восстановление пароля')).toBeInTheDocument()
            expect(screen.getByLabelText('Email')).toBeInTheDocument()
            expect(screen.getByRole('button', { name: 'Отправить ссылку' })).toBeInTheDocument()
        })

        it('should handle form submission', async () => {
            const mockResetPassword = jest.fn().mockResolvedValue({
                success: true,
                message: 'Проверьте почту'
            })

            jest.mocked(await import('@/lib/auth')).resetPassword = mockResetPassword

            render(<ResetPasswordForm />)

            fireEvent.change(screen.getByLabelText('Email'), {
                target: { value: 'test@example.com' }
            })

            fireEvent.click(screen.getByRole('button', { name: 'Отправить ссылку' }))

            await waitFor(() => {
                expect(mockResetPassword).toHaveBeenCalledWith('test@example.com')
            })
        })

        it('should switch to login form', () => {
            const mockOnSwitchToLogin = jest.fn()
            render(<ResetPasswordForm onSwitchToLogin={mockOnSwitchToLogin} />)

            fireEvent.click(screen.getByText('← Вернуться к входу'))
            expect(mockOnSwitchToLogin).toHaveBeenCalled()
        })
    })

    describe('AuthModal', () => {
        it('should render login form by default', () => {
            render(<AuthModal isOpen={true} onClose={jest.fn()} />)

            expect(screen.getByText('Вход в аккаунт')).toBeInTheDocument()
        })

        it('should render register form when mode is register', () => {
            render(<AuthModal isOpen={true} onClose={jest.fn()} initialMode="register" />)

            expect(screen.getByText('Создать аккаунт')).toBeInTheDocument()
        })

        it('should render reset password form when mode is reset', () => {
            render(<AuthModal isOpen={true} onClose={jest.fn()} initialMode="reset" />)

            expect(screen.getByText('Восстановление пароля')).toBeInTheDocument()
        })

        it('should not render when closed', () => {
            render(<AuthModal isOpen={false} onClose={jest.fn()} />)

            expect(screen.queryByText('Вход в аккаунт')).not.toBeInTheDocument()
        })

        it('should close on backdrop click', () => {
            const mockOnClose = jest.fn()
            render(<AuthModal isOpen={true} onClose={mockOnClose} />)

            const backdrop = screen.getByRole('button', { name: 'Закрыть' }).parentElement?.parentElement
            if (backdrop) {
                fireEvent.click(backdrop)
                expect(mockOnClose).toHaveBeenCalled()
            }
        })
    })
})
