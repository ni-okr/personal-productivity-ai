'use client'

import { ErrorBoundary } from '@/components/ErrorBoundary'
import { getCurrentUser } from '@/lib/auth'
import { useAppStore } from '@/stores/useAppStore'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AuthCallbackPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const router = useRouter()
    const searchParams = useSearchParams()
    const { setUser } = useAppStore()

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                // Получаем параметры из URL
                const code = searchParams.get('code')
                const error = searchParams.get('error')
                const errorDescription = searchParams.get('error_description')

                // Проверяем на ошибки OAuth
                if (error) {
                    setError(errorDescription || 'Ошибка авторизации')
                    setIsLoading(false)
                    return
                }

                // В реальном приложении здесь должна быть обработка OAuth callback
                // Пока что просто получаем текущего пользователя
                const user = await getCurrentUser()

                if (user) {
                    setUser(user)
                    router.push('/planner')
                } else {
                    setError('Не удалось авторизовать пользователя')
                }
            } catch (err: any) {
                setError(err.message || 'Произошла ошибка при авторизации')
            } finally {
                setIsLoading(false)
            }
        }

        handleAuthCallback()
    }, [searchParams, setUser, router])

    if (isLoading) {
        return (
            <ErrorBoundary>
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-md w-full space-y-8 p-8">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                                Завершение авторизации...
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
                                Ошибка авторизации
                            </h2>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                {error}
                            </p>
                            <div className="mt-6 space-y-3">
                                <button
                                    onClick={() => router.push('/auth/login')}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Попробовать снова
                                </button>
                                <button
                                    onClick={() => router.push('/')}
                                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    На главную
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </ErrorBoundary>
        )
    }

    // Успешная авторизация - перенаправляем
    return (
        <ErrorBoundary>
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="max-w-md w-full space-y-8 p-8">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
                            <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                            Авторизация успешна!
                        </h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Перенаправляем вас в планировщик...
                        </p>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    )
}