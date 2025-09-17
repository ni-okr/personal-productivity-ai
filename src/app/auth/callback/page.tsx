'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/stores/useAppStore'

export default function AuthCallback() {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('')
    const router = useRouter()
    const { setUser } = useAppStore()

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                // Получаем URL параметры
                const urlParams = new URLSearchParams(window.location.search)
                const error = urlParams.get('error')
                const errorDescription = urlParams.get('error_description')

                if (error) {
                    setStatus('error')
                    setMessage(errorDescription || 'Ошибка авторизации')
                    return
                }

                // Динамический импорт Supabase клиента
                const { createClient } = await import('@supabase/supabase-js')
                const supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                )

                // Получаем сессию
                const { data: { session }, error: sessionError } = await supabase.auth.getSession()

                if (sessionError) {
                    console.error('Ошибка получения сессии:', sessionError)
                    setStatus('error')
                    setMessage('Ошибка получения сессии')
                    return
                }

                if (!session?.user) {
                    setStatus('error')
                    setMessage('Пользователь не найден')
                    return
                }

                // Преобразуем пользователя Supabase в наш формат
                const user = {
                    id: session.user.id,
                    email: session.user.email || '',
                    name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Пользователь',
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    subscription: 'free' as const,
                    subscriptionStatus: 'active' as const,
                    preferences: {
                        workingHours: {
                            start: '09:00',
                            end: '18:00'
                        },
                        focusTime: 25,
                        breakTime: 5,
                        notifications: {
                            email: true,
                            push: true,
                            desktop: true
                        },
                        aiCoaching: {
                            enabled: true,
                            frequency: 'medium' as const,
                            style: 'gentle' as const
                        }
                    },
                    createdAt: new Date(session.user.created_at),
                    updatedAt: new Date()
                }

                // Сохраняем пользователя в store
                setUser(user)

                setStatus('success')
                setMessage('Успешный вход!')

                // Перенаправляем в планировщик
                setTimeout(() => {
                    router.push('/planner')
                }, 1000)

            } catch (error) {
                console.error('Ошибка обработки callback:', error)
                setStatus('error')
                setMessage('Произошла ошибка при входе')
            }
        }

        handleAuthCallback()
    }, [setUser, router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 flex items-center justify-center">
                        {status === 'loading' && (
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        )}
                        {status === 'success' && (
                            <div className="rounded-full h-12 w-12 bg-green-100 flex items-center justify-center">
                                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="rounded-full h-12 w-12 bg-red-100 flex items-center justify-center">
                                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                        )}
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                        {status === 'loading' && 'Обработка входа...'}
                        {status === 'success' && 'Вход выполнен!'}
                        {status === 'error' && 'Ошибка входа'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {message}
                    </p>
                    {status === 'success' && (
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                            Перенаправление в планировщик...
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
