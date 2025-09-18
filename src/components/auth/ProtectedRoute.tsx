'use client'

import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'

interface ProtectedRouteProps {
    children: ReactNode
    fallback?: ReactNode
    redirectTo?: string
    requireAuth?: boolean
}

export function ProtectedRoute({ 
    children, 
    fallback, 
    redirectTo = '/auth/login',
    requireAuth = true 
}: ProtectedRouteProps) {
    const { user, isLoading, isAuthenticated } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading) {
            if (requireAuth && !isAuthenticated) {
                router.push(redirectTo)
            } else if (!requireAuth && isAuthenticated) {
                router.push('/planner')
            }
        }
    }, [isLoading, isAuthenticated, requireAuth, redirectTo, router])

    // Показываем загрузку
    if (isLoading) {
        return (
            <ErrorBoundary>
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">
                            Загрузка...
                        </p>
                    </div>
                </div>
            </ErrorBoundary>
        )
    }

    // Показываем fallback если пользователь не авторизован
    if (requireAuth && !isAuthenticated) {
        return fallback || (
            <ErrorBoundary>
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Требуется авторизация
                        </h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Пожалуйста, войдите в систему для доступа к этой странице
                        </p>
                    </div>
                </div>
            </ErrorBoundary>
        )
    }

    // Показываем fallback если пользователь авторизован, но не должен быть
    if (!requireAuth && isAuthenticated) {
        return fallback || (
            <ErrorBoundary>
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Вы уже авторизованы
                        </h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Перенаправляем вас в планировщик...
                        </p>
                    </div>
                </div>
            </ErrorBoundary>
        )
    }

    // Показываем содержимое
    return <ErrorBoundary>{children}</ErrorBoundary>
}

// Хук для проверки авторизации
export function useRequireAuth(redirectTo: string = '/auth/login') {
    const { user, isLoading, isAuthenticated } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push(redirectTo)
        }
    }, [isLoading, isAuthenticated, redirectTo, router])

    return {
        user,
        isLoading,
        isAuthenticated
    }
}

// Хук для проверки, что пользователь НЕ авторизован
export function useRequireGuest(redirectTo: string = '/planner') {
    const { user, isLoading, isAuthenticated } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push(redirectTo)
        }
    }, [isLoading, isAuthenticated, redirectTo, router])

    return {
        user,
        isLoading,
        isAuthenticated
    }
}
