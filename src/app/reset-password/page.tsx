'use client'

import { Button } from '@/components/ui/Button'
import { resetPassword } from '@/lib/auth'
import { validateEmail } from '@/utils/validation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ResetPasswordPage() {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setIsLoading(true)

        try {
            // Валидация email
            const emailValidation = validateEmail(email)
            if (!emailValidation.isValid) {
                setError(emailValidation.errors[0])
                return
            }

            // Отправка запроса на восстановление пароля
            const result = await resetPassword(email)

            if (result.success) {
                setSuccess('Проверьте почту для восстановления пароля')
            } else {
                setError(result.error || 'Ошибка восстановления пароля')
            }
        } catch (err: any) {
            setError(err.message || 'Произошла ошибка при восстановлении пароля')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Кнопка назад */}
                <div className="mb-6">
                    <Link
                        href="/"
                        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Вернуться на главную
                    </Link>
                </div>

                {/* Форма восстановления пароля */}
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                        Восстановление пароля
                    </h1>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 text-center">
                        Введите email, на который зарегистрирован ваш аккаунт. Мы отправим ссылку для восстановления пароля.
                    </p>

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

                        {/* Ошибка */}
                        {error && (
                            <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-4 py-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        {/* Успех */}
                        {success && (
                            <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-3 rounded-md text-sm">
                                {success}
                            </div>
                        )}

                        {/* Кнопка восстановления */}
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            isLoading={isLoading}
                            disabled={isLoading}
                            className="w-full"
                        >
                            {isLoading ? 'Отправка...' : 'Отправить ссылку'}
                        </Button>
                    </form>

                    {/* Ссылка на вход */}
                    <div className="mt-6 text-center">
                        <Link
                            href="/"
                            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
                        >
                            ← Вернуться к входу
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
