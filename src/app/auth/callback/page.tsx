'use client'

import { Button } from '@/components/ui/Button'
import { confirmEmail, getCurrentUser } from '@/lib/auth'
import { useAppStore } from '@/stores/useAppStore'
import { CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

function AuthCallbackContent() {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('')
    const [user, setUser] = useState<any>(null)
    const { setUser: setAppUser } = useAppStore()
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                // Получаем параметры из URL
                const token = searchParams?.get('token')
                const type = searchParams?.get('type')
                const error = searchParams?.get('error')
                const errorDescription = searchParams?.get('error_description')

                // Если есть ошибка в URL
                if (error) {
                    setStatus('error')
                    setMessage(errorDescription || 'Произошла ошибка при авторизации')
                    return
                }

                // Если это подтверждение email
                if (type === 'signup' && token) {
                    const result = await confirmEmail(token)
                    if (result.success) {
                        setStatus('success')
                        setMessage('Email успешно подтвержден!')
                        // Получаем пользователя и сохраняем в store
                        const currentUser = await getCurrentUser()
                        if (currentUser) {
                            setUser(currentUser)
                            setAppUser(currentUser)
                        }
                    } else {
                        setStatus('error')
                        setMessage(result.error || 'Ошибка подтверждения email')
                    }
                    return
                }

                // Если это обычный вход через OAuth
                const currentUser = await getCurrentUser()
                if (currentUser) {
                    setStatus('success')
                    setMessage('Вход выполнен успешно!')
                    setUser(currentUser)
                    setAppUser(currentUser)
                } else {
                    setStatus('error')
                    setMessage('Не удалось войти в систему')
                }
            } catch (error: any) {
                console.error('Ошибка обработки callback:', error)
                setStatus('error')
                setMessage('Произошла ошибка при обработке авторизации')
            }
        }

        handleAuthCallback()
    }, [searchParams, setAppUser])

    const handleContinue = () => {
        if (user) {
            router.push('/planner')
        } else {
            router.push('/')
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
                    {status === 'loading' && (
                        <>
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                Обработка авторизации...
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Пожалуйста, подождите
                            </p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                Успешно!
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                {message}
                            </p>
                            <Button
                                onClick={handleContinue}
                                className="w-full"
                                size="lg"
                            >
                                Продолжить
                            </Button>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                Ошибка
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                {message}
                            </p>
                            <div className="space-y-2">
                                <Button
                                    onClick={() => router.push('/')}
                                    className="w-full"
                                    size="lg"
                                >
                                    На главную
                                </Button>
                                <Link href="/">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        size="lg"
                                    >
                                        Попробовать снова
                                    </Button>
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Загрузка...
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Пожалуйста, подождите
                        </p>
                    </div>
                </div>
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    )
}