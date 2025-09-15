'use client'

import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Button } from '@/components/ui/Button'
import { getUserProfile } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/stores/useAppStore'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AuthCallbackPage() {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('')
    const router = useRouter()
    const { setUser } = useAppStore()

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                // Получаем URL параметры
                const { data, error } = await supabase.auth.getSession()

                if (error) {
                    console.error('Ошибка получения сессии:', error)
                    setStatus('error')
                    setMessage('Ошибка авторизации. Попробуйте еще раз.')
                    return
                }

                if (data.session?.user) {
                    // Получаем профиль пользователя
                    const userProfile = await getUserProfile(data.session.user.id)

                    if (userProfile) {
                        setUser(userProfile)
                        setStatus('success')
                        setMessage('Авторизация успешна! Перенаправление...')

                        // Перенаправляем на главную страницу через 2 секунды
                        setTimeout(() => {
                            router.push('/')
                        }, 2000)
                    } else {
                        setStatus('error')
                        setMessage('Ошибка получения профиля пользователя')
                    }
                } else {
                    setStatus('error')
                    setMessage('Сессия не найдена')
                }
            } catch (error) {
                console.error('Ошибка обработки callback:', error)
                setStatus('error')
                setMessage('Произошла ошибка при авторизации')
            }
        }

        handleAuthCallback()
    }, [router, setUser])

    const handleRetry = () => {
        router.push('/')
    }

    return (
        <ErrorBoundary>
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="mx-auto h-12 w-12 flex items-center justify-center">
                            {status === 'loading' && (
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                            )}
                            {status === 'success' && (
                                <div className="rounded-full h-12 w-12 bg-green-100 flex items-center justify-center">
                                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}
                            {status === 'error' && (
                                <div className="rounded-full h-12 w-12 bg-red-100 flex items-center justify-center">
                                    <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                            {status === 'loading' && 'Авторизация...'}
                            {status === 'success' && 'Успешно!'}
                            {status === 'error' && 'Ошибка'}
                        </h2>

                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            {message}
                        </p>

                        {status === 'error' && (
                            <div className="mt-6">
                                <Button onClick={handleRetry} variant="primary">
                                    Попробовать снова
                                </Button>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="mt-6">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Вы будете перенаправлены на главную страницу...
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    )
}
