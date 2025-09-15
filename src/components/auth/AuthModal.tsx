'use client'

import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useAppStore } from '@/stores/useAppStore'
import { useEffect, useState } from 'react'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import { ResetPasswordForm } from './ResetPasswordForm'

type AuthMode = 'login' | 'register' | 'reset'

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
    initialMode?: AuthMode
    onSuccess?: () => void
}

export function AuthModal({ isOpen, onClose, initialMode = 'login', onSuccess }: AuthModalProps) {
    const [mode, setMode] = useState<AuthMode>(initialMode)
    const { user } = useAppStore()

    // Закрытие модального окна при успешной авторизации
    useEffect(() => {
        if (user && isOpen) {
            onSuccess?.()
            onClose()
        }
    }, [user, isOpen, onSuccess, onClose])

    // Сброс режима при открытии
    useEffect(() => {
        if (isOpen) {
            setMode(initialMode)
        }
    }, [isOpen, initialMode])

    if (!isOpen) return null

    const handleSuccess = () => {
        onSuccess?.()
        onClose()
    }

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    return (
        <ErrorBoundary>
            <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                onClick={handleBackdropClick}
            >
                <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                    {/* Кнопка закрытия */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10"
                        aria-label="Закрыть"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Контент */}
                    <div className="p-6">
                        {mode === 'login' && (
                            <LoginForm
                                onSuccess={handleSuccess}
                                onSwitchToRegister={() => setMode('register')}
                                onSwitchToReset={() => setMode('reset')}
                            />
                        )}

                        {mode === 'register' && (
                            <RegisterForm
                                onSuccess={handleSuccess}
                                onSwitchToLogin={() => setMode('login')}
                            />
                        )}

                        {mode === 'reset' && (
                            <ResetPasswordForm
                                onSuccess={handleSuccess}
                                onSwitchToLogin={() => setMode('login')}
                            />
                        )}
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    )
}

// Хук для управления авторизацией
export function useAuth() {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
    const [authMode, setAuthMode] = useState<AuthMode>('login')
    const { user, signOut } = useAppStore()

    const openAuthModal = (mode: AuthMode = 'login') => {
        setAuthMode(mode)
        setIsAuthModalOpen(true)
    }

    const closeAuthModal = () => {
        setIsAuthModalOpen(false)
    }

    const handleSignOut = async () => {
        try {
            await signOut()
        } catch (error) {
            console.error('Ошибка при выходе:', error)
        }
    }

    return {
        user,
        isAuthModalOpen,
        authMode,
        openAuthModal,
        closeAuthModal,
        signOut: handleSignOut,
        isAuthenticated: !!user
    }
}
