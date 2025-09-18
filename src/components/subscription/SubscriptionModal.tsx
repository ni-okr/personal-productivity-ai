// 💳 Модальное окно выбора подписки
'use client'

import { Button } from '@/components/ui/Button'
import { SubscriptionPlan } from '@/types'
import { LoaderIcon, XIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { SubscriptionCard } from './SubscriptionCard'

interface SubscriptionModalProps {
    isOpen: boolean
    onClose: () => void
    currentTier?: string
    onSelectPlan: (planId: string) => Promise<void>
}

export function SubscriptionModal({
    isOpen,
    onClose,
    currentTier,
    onSelectPlan
}: SubscriptionModalProps) {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    // Загружаем планы подписок
    useEffect(() => {
        if (isOpen) {
            loadSubscriptionPlans()
        }
    }, [isOpen])

    const loadSubscriptionPlans = async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/subscriptions/plans')
            const result = await response.json()

            if (result.success) {
                setPlans(result.data)
            } else {
                console.error('Ошибка загрузки планов:', result.error)
            }
        } catch (error) {
            console.error('Ошибка загрузки планов:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSelectPlan = async (planId: string) => {
        try {
            setIsProcessing(true)
            setSelectedPlan(planId)
            await onSelectPlan(planId)
        } catch (error) {
            console.error('Ошибка выбора плана:', error)
        } finally {
            setIsProcessing(false)
            setSelectedPlan(null)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Выберите план подписки
                            </h2>
                            <p className="text-gray-600 mt-1">
                                Разблокируйте полный потенциал ИИ-планировщика
                            </p>
                        </div>
                        <Button
                            onClick={onClose}
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <XIcon className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <LoaderIcon className="w-8 h-8 animate-spin text-indigo-600" />
                            <span className="ml-3 text-gray-600">Загрузка планов...</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {plans.map((plan) => (
                                <SubscriptionCard
                                    key={plan.id}
                                    plan={plan}
                                    currentTier={currentTier}
                                    onSelect={handleSelectPlan}
                                    isLoading={isProcessing && selectedPlan === plan.id}
                                />
                            ))}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="text-center text-sm text-gray-500">
                            <p>
                                💳 Безопасная оплата через Тинькофф •
                                🔒 Отменить можно в любое время •
                                📧 Поддержка 24/7
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
