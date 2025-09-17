'use client'

import { Button } from '@/components/ui/Button'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

function EmailConfirmContent() {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('')
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const handleEmailConfirmation = async () => {
            try {
                const token = searchParams?.get('token')
                const type = searchParams?.get('type')
                const error = searchParams?.get('error')
                const errorDescription = searchParams?.get('error_description')

                if (error) {
                    setStatus('error')
                    setMessage(errorDescription || 'Ошибка подтверждения email')
                    return
                }

                if (!token) {
                    setStatus('error')
                    setMessage('Токен подтверждения не найден')
                    return
                }

                // В mock режиме просто показываем успех
                if (process.env.NEXT_PUBLIC_DISABLE_EMAIL === 'true') {
                    setStatus('success')
                    setMessage('Email успешно подтвержден! (Mock режим)')
                    return
                }

                // В реальном режиме проверяем токен через Supabase
                const { createClient } = await import('@supabase/supabase-js')
                const supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                )

                const { data, error: confirmError } = await supabase.auth.verifyOtp({
                    token_hash: token,
                    type: type as any || 'email'
                })

                if (confirmError) {
                    console.error('Ошибка подтверждения:', confirmError)
                    setStatus('error')
                    setMessage('Ошибка подтверждения email: ' + confirmError.message)
                    return
                }

                setStatus('success')
                setMessage('Email успешно подтвержден!')

            } catch (error) {
                console.error('Ошибка обработки подтверждения:', error)
                setStatus('error')
                setMessage('Произошла ошибка при подтверждении email')
            }
        }

        handleEmailConfirmation()
    }, [searchParams])

    const handleGoToLogin = () => {
        router.push('/planner')
    }

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
                        {status === 'loading' && 'Подтверждение email...'}
                        {status === 'success' && 'Email подтвержден!'}
                        {status === 'error' && 'Ошибка подтверждения'}
                    </h2>

                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {message}
                    </p>

                    {status === 'success' && (
                        <div className="mt-6">
                            <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-md p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                                            Аккаунт активирован
                                        </h3>
                                        <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                                            <p>Теперь вы можете войти в систему и пользоваться всеми функциями планировщика.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="mt-6">
                            <Button
                                onClick={handleGoToLogin}
                                variant="primary"
                                size="lg"
                                className="w-full"
                            >
                                Перейти в планировщик
                            </Button>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="mt-6">
                            <Button
                                onClick={() => router.push('/')}
                                variant="outline"
                                size="lg"
                                className="w-full"
                            >
                                Вернуться на главную
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function EmailConfirmPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        }>
            <EmailConfirmContent />
        </Suspense>
    )
}
