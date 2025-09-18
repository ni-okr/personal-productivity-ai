'use client'

import { ErrorBoundary } from '@/components/ErrorBoundary'
import { UpdatePasswordForm } from '@/components/auth/UpdatePasswordForm'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ResetPasswordPage() {
    const [isValidToken, setIsValidToken] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setError('Токен сброса пароля не найден')
                setIsLoading(false)
                return
            }

            // В реальном приложении здесь должна быть проверка токена
            // Пока что просто симулируем валидацию
            try {
                // TODO: Добавить реальную проверку токена через Supabase
                await new Promise(resolve => setTimeout(resolve, 1000))
                setIsValidToken(true)
            } catch (err: any) {
                setError('Неверный или устаревший токен сброса пароля')
            } finally {
                setIsLoading(false)
            }
        }

        validateToken()
    }, [token])

    const handleSuccess = () => {
        router.push('/auth/login?message=password-updated')
    }

    const handleCancel = () => {
        router.push('/auth/login')
    }

    if (isLoading) {
        return (
            <ErrorBoundary>
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-md w-full space-y-8 p-8">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                                Проверка токена...
                            </h2>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Пожалуйста, подождите
                            </p>
                        </div>
                    </div>
                </div>
            </ErrorBoundary>
        )
    }

    if (error) {
        return (
            <ErrorBoundary>
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-md w-full space-y-8 p-8">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
                                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                                Ошибка
                            </h2>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                {error}
                            </p>
                            <div className="mt-6">
                                <button
                                    onClick={() => router.push('/auth/forgot-password')}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Запросить новую ссылку
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </ErrorBoundary>
        )
    }

    return (
        <ErrorBoundary>
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                            Сброс пароля
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Введите новый пароль для вашего аккаунта
                        </p>
                    </div>

                    <UpdatePasswordForm
                        onSuccess={handleSuccess}
                        onCancel={handleCancel}
                    />
                </div>
            </div>
        </ErrorBoundary>
    )
}
