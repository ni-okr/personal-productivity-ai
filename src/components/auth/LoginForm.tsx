'use client'

import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { validateEmail } from '@/utils/validation'
import { useState } from 'react'

interface LoginFormProps {
    onSuccess?: () => void
    onSwitchToRegister?: () => void
    onSwitchToReset?: () => void
}

export function LoginForm({ onSuccess, onSwitchToRegister, onSwitchToReset }: LoginFormProps) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const { signIn, signInWithGoogle, isLoading, error, clearError } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        clearError()

        // Валидация email
        const emailValidation = validateEmail(email)
        if (!emailValidation.isValid) {
            return
        }

        // Валидация пароля
        if (!password || password.length < 6) {
            return
        }

        // Авторизация через useAuth хук
        const result = await signIn(email, password)

        if (result.success) {
            onSuccess?.()
        }
    }

    const handleGoogleSignIn = async () => {
        clearError()
        const result = await signInWithGoogle()

        if (result.success) {
            onSuccess?.()
        }
    }

    return (
        <ErrorBoundary>
            <div className="w-full max-w-md mx-auto">
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                        Вход в аккаунт
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email поле */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                placeholder="your@email.com"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        {/* Пароль поле */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Пароль
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="••••••••"
                                    required
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    disabled={isLoading}
                                >
                                    {showPassword ? (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Ошибка */}
                        {error && (
                            <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-4 py-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        {/* Кнопка входа */}
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            isLoading={isLoading}
                            disabled={isLoading}
                            className="w-full"
                        >
                            {isLoading ? 'Вход...' : 'Войти'}
                        </Button>

                        {/* Google вход */}
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                            className="w-full"
                        >
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Войти через Google
                        </Button>
                    </form>

                    {/* Ссылки */}
                    <div className="mt-6 text-center space-y-2">
                        <button
                            onClick={onSwitchToReset}
                            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
                            disabled={isLoading}
                        >
                            Забыли пароль?
                        </button>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Нет аккаунта?{' '}
                            <button
                                onClick={onSwitchToRegister}
                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium"
                                disabled={isLoading}
                            >
                                Зарегистрироваться
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    )
}
