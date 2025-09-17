// 💳 Компонент карточки плана подписки
'use client'

import { Button } from '@/components/ui/Button'
import { SubscriptionPlan } from '@/types'
import { CheckIcon, StarIcon } from 'lucide-react'
import { useState } from 'react'

interface SubscriptionCardProps {
    plan: SubscriptionPlan
    currentTier?: string
    onSelect: (planId: string) => void
    isLoading?: boolean
}

export function SubscriptionCard({
    plan,
    currentTier,
    onSelect,
    isLoading = false
}: SubscriptionCardProps) {
    const isCurrentPlan = currentTier === plan.tier
    const isPopular = plan.tier === 'premium'
    const isEnterprise = plan.tier === 'enterprise'

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
        }).format(price / 100)
    }

    const getTierIcon = (tier: string) => {
        switch (tier) {
            case 'free':
                return '🆓'
            case 'premium':
                return '💎'
            case 'pro':
                return '🚀'
            case 'enterprise':
                return '🏢'
            default:
                return '📋'
        }
    }

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'free':
                return 'border-gray-200 bg-white'
            case 'premium':
                return 'border-indigo-500 bg-indigo-50'
            case 'pro':
                return 'border-purple-500 bg-purple-50'
            case 'enterprise':
                return 'border-gray-800 bg-gray-50'
            default:
                return 'border-gray-200 bg-white'
        }
    }

    return (
        <div className={`
      relative rounded-2xl border-2 p-8 transition-all duration-200 hover:shadow-lg
      ${getTierColor(plan.tier)}
      ${isCurrentPlan ? 'ring-2 ring-indigo-500' : ''}
      ${isPopular ? 'scale-105' : ''}
    `}>
            {/* Популярный бейдж */}
            {isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="flex items-center gap-1 bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                        <StarIcon className="w-4 h-4" />
                        Популярный
                    </div>
                </div>
            )}

            {/* Заголовок */}
            <div className="text-center mb-6">
                <div className="text-4xl mb-2">{getTierIcon(plan.tier)}</div>
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">
                        {plan.price === 0 ? 'Бесплатно' : formatPrice(plan.price)}
                    </span>
                    {plan.price > 0 && (
                        <span className="text-gray-500 ml-2">
                            /{plan.interval === 'month' ? 'месяц' : 'год'}
                        </span>
                    )}
                </div>
            </div>

            {/* Особенности */}
            <div className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                        <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                    </div>
                ))}
            </div>

            {/* Лимиты */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Лимиты:</h4>
                <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                        <span>Задачи:</span>
                        <span className="font-medium">
                            {plan.limits.tasks === -1 ? '∞' : plan.limits.tasks.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>ИИ запросы:</span>
                        <span className="font-medium">
                            {plan.limits.aiRequests === -1 ? '∞' : plan.limits.aiRequests.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>Хранилище:</span>
                        <span className="font-medium">
                            {plan.limits.storage === -1 ? '∞' : `${plan.limits.storage} MB`}
                        </span>
                    </div>
                </div>
            </div>

            {/* Кнопки */}
            <div className="space-y-2">
                <Button
                    onClick={() => onSelect(plan.id)}
                    disabled={isCurrentPlan || isLoading}
                    variant={isCurrentPlan ? 'secondary' : 'primary'}
                    size="lg"
                    className="w-full"
                    isLoading={isLoading}
                >
                    {isCurrentPlan ? 'Текущий план' :
                        isEnterprise ? 'Связаться с нами' :
                            'Выбрать план'}
                </Button>

                {/* Кнопка тестирования для платных планов */}
                {plan.price > 0 && !isCurrentPlan && (
                    <Button
                        onClick={async () => {
                            try {
                                // Вызываем API для создания платежа
                                const response = await fetch('/api/tinkoff/test-payment', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        amount: plan.price,
                                        description: `Подписка ${plan.name}`,
                                        planId: plan.id
                                    })
                                })
                                
                                const result = await response.json()
                                
                                if (result.success && result.data.paymentUrl) {
                                    // Открываем окно Тинькофф
                                    window.open(result.data.paymentUrl, '_blank', 'width=800,height=600')
                                } else {
                                    alert('Ошибка создания платежа: ' + result.error)
                                }
                            } catch (error) {
                                console.error('Ошибка:', error)
                                alert('Ошибка создания платежа')
                            }
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full"
                    >
                        🧪 Тестовый платеж
                    </Button>
                )}
            </div>

        </div>
    )
}
