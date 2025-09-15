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
            const { signIn } = await import('@/lib/auth')
            const mockSignIn = jest.mocked(signIn)
            mockSignIn.mockResolvedValue({
                success: true,
                user: { id: '1', email: 'test@example.com', name: 'Test User' }
            })

            render(<LoginForm />)

            fireEvent.change(screen.getByLabelText('Email'), {
                target: { value: 'test@example.com' }
            })
            fireEvent.change(screen.getByLabelText('Пароль'), {
                target: { value: 'password123' }
            })

            fireEvent.click(screen.getByRole('button', { name: 'Войти' }))

            await waitFor(() => {
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
    })

    describe('RegisterForm', () => {
        it('should render register form', () => {
            render(<RegisterForm />)

            expect(screen.getByText('Создать аккаунт')).toBeInTheDocument()
            expect(screen.getByLabelText('Имя')).toBeInTheDocument()
            expect(screen.getByLabelText('Email')).toBeInTheDocument()
            expect(screen.getByLabelText('Пароль')).toBeInTheDocument()
            expect(screen.getByLabelText('Подтвердите пароль')).toBeInTheDocument()
            expect(screen.getByRole('button', { name: 'Зарегистрироваться' })).toBeInTheDocument()
        })

        it('should handle form submission', async () => {
            const { signUp } = await import('@/lib/auth')
            const mockSignUp = jest.mocked(signUp)
            mockSignUp.mockResolvedValue({
                success: true,
                user: { id: '1', email: 'test@example.com', name: 'Test User' }
            })

            render(<RegisterForm />)

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

            await waitFor(() => {
                expect(mockSignUp).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123', name: 'Test User' })
            })
        })

        it('should show error on password mismatch', async () => {
            render(<RegisterForm />)

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

            expect(screen.getByText('Пароли не совпадают')).toBeInTheDocument()
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
            const { resetPassword } = await import('@/lib/auth')
            const mockResetPassword = jest.mocked(resetPassword)
            mockResetPassword.mockResolvedValue({
                success: true,
                message: 'Ссылка для восстановления отправлена'
            })

            render(<ResetPasswordForm />)

            fireEvent.change(screen.getByLabelText('Email'), {
                target: { value: 'test@example.com' }
            })

            fireEvent.click(screen.getByRole('button', { name: 'Отправить ссылку' }))

            await waitFor(() => {
                expect(mockResetPassword).toHaveBeenCalledWith('test@example.com')
            })
        })
    })

    describe('AuthModal', () => {
        it('should render auth modal', () => {
            render(<AuthModal isOpen={true} onClose={jest.fn()} />)

            expect(screen.getByText('Вход в аккаунт')).toBeInTheDocument()
        })

        it('should close modal when close button is clicked', () => {
            const mockOnClose = jest.fn()
            render(<AuthModal isOpen={true} onClose={mockOnClose} />)

            const closeButton = screen.getByRole('button', { name: /закрыть/i })
            fireEvent.click(closeButton)

            expect(mockOnClose).toHaveBeenCalled()
        })
    })
})
