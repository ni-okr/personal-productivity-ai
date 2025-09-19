/**
 * 🧪 Простые тесты авторизации - без сложных импортов
 */

import { LoginForm } from '@/components/auth/LoginForm'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { act } from 'react'

// Мок для useAuth хука
const mockSignIn = jest.fn()
const mockSignInWithGoogle = jest.fn()
const mockClearError = jest.fn()

jest.mock('@/hooks/useAuth', () => ({
    useAuth: () => ({
        signIn: mockSignIn,
        signInWithGoogle: mockSignInWithGoogle,
        isLoading: false,
        error: null,
        clearError: mockClearError,
    })
}))

// Мок для useAppStore
jest.mock('@/stores/useAppStore', () => ({
    useAppStore: () => ({
        user: null,
        setUser: jest.fn(),
        clearUserData: jest.fn(),
    })
}))

// Мок для next/navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
    })
}))

describe('Auth Components - Simple Tests', () => {
    beforeEach(() => {
        mockSignIn.mockClear()
    })

    test('should render login form', () => {
        render(
            <LoginForm
                onSuccess={() => { }}
                onSwitchToRegister={() => { }}
                onSwitchToReset={() => { }}
            />
        )

        expect(screen.getByText('Вход в аккаунт')).toBeInTheDocument()
        expect(screen.getByLabelText('Email')).toBeInTheDocument()
        expect(screen.getByLabelText('Пароль')).toBeInTheDocument()
    })

    test('should handle form submission', async () => {
        mockSignIn.mockResolvedValue({ success: true })

        const mockOnSuccess = jest.fn()
        render(
            <LoginForm
                onSuccess={mockOnSuccess}
                onSwitchToRegister={() => { }}
                onSwitchToReset={() => { }}
            />
        )

        await act(async () => {
            fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@taskai.space' } })
            fireEvent.change(screen.getByLabelText('Пароль'), { target: { value: 'password123' } })
            fireEvent.click(screen.getByRole('button', { name: 'Войти' }))
        })

        await waitFor(() => {
            expect(mockSignIn).toHaveBeenCalledWith('test@taskai.space', 'password123')
            expect(mockOnSuccess).toHaveBeenCalled()
        })
    })

    test('should call signIn with correct parameters on failed login', async () => {
        mockSignIn.mockResolvedValue({ success: false, error: 'Неверный email или пароль' })

        render(
            <LoginForm
                onSuccess={() => { }}
                onSwitchToRegister={() => { }}
                onSwitchToReset={() => { }}
            />
        )

        await act(async () => {
            fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'wrong@example.com' } })
            fireEvent.change(screen.getByLabelText('Пароль'), { target: { value: 'wrongpassword' } })
            fireEvent.click(screen.getByRole('button', { name: 'Войти' }))
        })

        await waitFor(() => {
            expect(mockSignIn).toHaveBeenCalledWith('wrong@example.com', 'wrongpassword')
        })
    })
})
