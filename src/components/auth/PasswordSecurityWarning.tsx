'use client'

import { Button } from '@/components/ui/Button'
import { analyzePasswordSecurity, generateSecurePassword, shouldShowPasswordWarning } from '@/lib/password-security'
import { useState } from 'react'

interface PasswordSecurityWarningProps {
    userSubscription: string
    currentPassword: string
    onPasswordChange: (newPassword: string) => void
    onDismiss: () => void
}

export function PasswordSecurityWarning({
    userSubscription,
    currentPassword,
    onPasswordChange,
    onDismiss
}: PasswordSecurityWarningProps) {
    const [showGenerator, setShowGenerator] = useState(false)
    const [generatedPassword, setGeneratedPassword] = useState('')

    const passwordAnalysis = analyzePasswordSecurity(currentPassword)
    const shouldShow = shouldShowPasswordWarning(userSubscription, passwordAnalysis)

    if (!shouldShow) return null

    const handleGeneratePassword = () => {
        const newPassword = generateSecurePassword()
        setGeneratedPassword(newPassword)
        setShowGenerator(true)
    }

    const handleUseGeneratedPassword = () => {
        onPasswordChange(generatedPassword)
        onDismiss()
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex items-center mb-4">
                    <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            ⚠️ Слабый пароль обнаружен
                        </h3>
                    </div>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Ваш пароль не соответствует требованиям безопасности для платного тарифа.
                        Рекомендуем сменить пароль для защиты аккаунта.
                    </p>
                </div>

                <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Рекомендации по улучшению:
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {passwordAnalysis.suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-center">
                                <span className="text-red-500 mr-2">•</span>
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                </div>

                {!showGenerator ? (
                    <div className="flex space-x-3">
                        <Button
                            onClick={handleGeneratePassword}
                            variant="primary"
                            className="flex-1"
                        >
                            🔐 Сгенерировать безопасный пароль
                        </Button>
                        <Button
                            onClick={onDismiss}
                            variant="outline"
                            className="flex-1"
                        >
                            Позже
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Новый безопасный пароль:
                            </label>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={generatedPassword}
                                    readOnly
                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-sm font-mono"
                                />
                                <Button
                                    onClick={() => navigator.clipboard.writeText(generatedPassword)}
                                    variant="outline"
                                    size="sm"
                                >
                                    📋
                                </Button>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <Button
                                onClick={handleUseGeneratedPassword}
                                variant="primary"
                                className="flex-1"
                            >
                                ✅ Использовать этот пароль
                            </Button>
                            <Button
                                onClick={() => setShowGenerator(false)}
                                variant="outline"
                                className="flex-1"
                            >
                                Отмена
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
