'use client'

import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Button } from '@/components/ui/Button'
import { updatePassword } from '@/lib/auth'
import { useState } from 'react'

interface UpdatePasswordFormProps {
    onSuccess?: () => void
    onCancel?: () => void
}

export function UpdatePasswordForm({ onSuccess, onCancel }: UpdatePasswordFormProps) {
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setIsLoading(true)

        try {
            // Валидация пароля
            if (!newPassword || newPassword.length < 6) {
                setError('Пароль должен содержать минимум 6 символов')
                return
            }

            // Проверка совпадения паролей
            if (newPassword !== confirmPassword) {
                setError('Пароли не совпадают')
                return
            }

            // Обновление пароля
            const result = await updatePassword(newPassword)

            if (result.success) {
                setSuccess('Пароль успешно обновлен!')
                setTimeout(() => {
                    onSuccess?.()
                }, 2000)
            } else {
                setError(result.error || 'Ошибка обновления пароля')
            }
        } catch (err: any) {
            setError(err.message || 'Произошла ошибка при обновлении пароля')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <ErrorBoundary>
            <div className="w-full max-w-md mx-auto">
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                        Обновление пароля
                    </h2>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 text-center">
                        Введите новый пароль для вашего аккаунта.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Новый пароль */}
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Новый пароль
                            </label>
                            <input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                placeholder="••••••••"
                                required
                                disabled={isLoading}
                                minLength={6}
                            />
                        </div>

                        {/* Подтверждение пароля */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Подтвердите пароль
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                placeholder="••••••••"
                                required
                                disabled={isLoading}
                                minLength={6}
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

                        {/* Кнопки */}
                        <div className="flex space-x-3">
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                isLoading={isLoading}
                                disabled={isLoading}
                                className="flex-1"
                            >
                                {isLoading ? 'Обновление...' : 'Обновить пароль'}
                            </Button>

                            {onCancel && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="lg"
                                    onClick={onCancel}
                                    disabled={isLoading}
                                    className="flex-1"
                                >
                                    Отмена
                                </Button>
                            )}
                        </div>
                    </form>

                    {/* Информация о безопасности */}
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-md">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                            Требования к паролю:
                        </h3>
                        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                            <li>• Минимум 6 символов</li>
                            <li>• Рекомендуется использовать буквы, цифры и символы</li>
                            <li>• Избегайте простых паролей</li>
                        </ul>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    )
}
