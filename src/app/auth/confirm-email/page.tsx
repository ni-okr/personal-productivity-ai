'use client'
export const dynamic = 'force-dynamic';

import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Button } from '@/components/ui/Button'
import { confirmEmail } from '@/lib/auth'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ConfirmEmailPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    useEffect(() => {
        const handleConfirmEmail = async () => {
            if (!token) {
                setError('Токен подтверждения не найден')
                setIsLoading(false)
                return
            }

            try {
                const result = await confirmEmail(token)

                if (result.success) {
                    setIsSuccess(true)
                } else {
                    setError(result.error || 'Ошибка подтверждения email')
                }
            } catch (err: any) {
                setError(err.message || 'Произошла ошибка при подтверждении email')
            } finally {
                setIsLoading(false)
            }
        }

        handleConfirmEmail()
    }, [token])

    const handleContinue = () => {
        router.push('/planner')
    }

    const handleResend = () => {
        router.push('/auth/resend-confirmation')
    }

    if (isLoading) {
        return (
            <ErrorBoundary>
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-md w-full space-y-8 p-8">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                                Подтверждение email...
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

    return (
        <ErrorBoundary>
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="max-w-md w-full space-y-8 p-8">
                    <div className="text-center">
                        {isSuccess ? (
                            <>
                                {/* Успешное подтверждение */}
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
                                    <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                                    Email подтвержден!
                                </h2>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    Ваш аккаунт успешно активирован. Теперь вы можете пользоваться всеми функциями приложения.
                                </p>
                                <div className="mt-6">
                                    <Button
                                        onClick={handleContinue}
                                        variant="primary"
                                        size="lg"
                                        className="w-full"
                                    >
                                        Перейти к планировщику
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Ошибка подтверждения */}
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
                                    <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                                    Ошибка подтверждения
                                </h2>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    {error || 'Не удалось подтвердить email. Возможно, ссылка устарела или неверна.'}
                                </p>
                                <div className="mt-6 space-y-3">
                                    <Button
                                        onClick={handleResend}
                                        variant="primary"
                                        size="lg"
                                        className="w-full"
                                    >
                                        Отправить новую ссылку
                                    </Button>
                                    <Button
                                        onClick={() => router.push('/auth/login')}
                                        variant="outline"
                                        size="lg"
                                        className="w-full"
                                    >
                                        Вернуться к входу
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    )
}
