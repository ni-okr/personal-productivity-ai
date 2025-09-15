// 📊 Компонент статуса подписки
'use client'

import { Button } from '@/components/ui/Button'
import { Subscription, SubscriptionPlan } from '@/types'
import {
    CheckCircleIcon,
    ClockIcon,
    CreditCardIcon,
    ExternalLinkIcon,
    LoaderIcon,
    XCircleIcon
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface SubscriptionStatusProps {
    userId: string
    onUpgrade: () => void
}

export function SubscriptionStatus({ userId, onUpgrade }: SubscriptionStatusProps) {
    const [subscription, setSubscription] = useState<Subscription | null>(null)
    const [plan, setPlan] = useState<SubscriptionPlan | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isManaging, setIsManaging] = useState(false)

    useEffect(() => {
        loadSubscriptionStatus()
    }, [userId])

    const loadSubscriptionStatus = async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/subscriptions/status')
            const result = await response.json()

            if (result.success) {
                setSubscription(result.data.subscription)
                setPlan(result.data.plan)
            } else {
                console.error('Ошибка загрузки статуса:', result.error)
            }
        } catch (error) {
            console.error('Ошибка загрузки статуса:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleManageSubscription = async () => {
        try {
            setIsManaging(true)
            const response = await fetch('/api/subscriptions/portal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    returnUrl: window.location.href
                })
            })

            const result = await response.json()

            if (result.success && result.data.url) {
                window.open(result.data.url, '_blank')
            } else {
                console.error('Ошибка создания portal сессии:', result.error)
            }
        } catch (error) {
            console.error('Ошибка управления подпиской:', error)
        } finally {
            setIsManaging(false)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <CheckCircleIcon className="w-5 h-5 text-green-500" />
            case 'trialing':
                return <ClockIcon className="w-5 h-5 text-blue-500" />
            case 'canceled':
            case 'past_due':
            case 'unpaid':
                return <XCircleIcon className="w-5 h-5 text-red-500" />
            default:
                return <ClockIcon className="w-5 h-5 text-gray-500" />
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active':
                return 'Активна'
            case 'trialing':
                return 'Пробный период'
            case 'canceled':
                return 'Отменена'
            case 'past_due':
                return 'Просрочена'
            case 'unpaid':
                return 'Не оплачена'
            default:
                return 'Неизвестно'
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'text-green-600 bg-green-50'
            case 'trialing':
                return 'text-blue-600 bg-blue-50'
            case 'canceled':
            case 'past_due':
            case 'unpaid':
                return 'text-red-600 bg-red-50'
            default:
                return 'text-gray-600 bg-gray-50'
        }
    }

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(new Date(date))
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
        }).format(price / 100)
    }

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-center">
                    <LoaderIcon className="w-6 h-6 animate-spin text-indigo-600" />
                    <span className="ml-3 text-gray-600">Загрузка статуса подписки...</span>
                </div>
            </div>
        )
    }

    if (!subscription || !plan) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Нет активной подписки
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Выберите план для разблокировки всех функций
                    </p>
                    <Button onClick={onUpgrade} variant="primary">
                        Выбрать план
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {plan.name}
                    </h3>
                    <div className="flex items-center gap-2">
                        {getStatusIcon(subscription.status)}
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
                            {getStatusText(subscription.status)}
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                        {plan.price === 0 ? 'Бесплатно' : formatPrice(plan.price)}
                    </div>
                    {plan.price > 0 && (
                        <div className="text-sm text-gray-500">
                            /{plan.interval === 'month' ? 'месяц' : 'год'}
                        </div>
                    )}
                </div>
            </div>

            {/* Детали подписки */}
            <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Следующее списание:</span>
                    <span className="font-medium">
                        {formatDate(subscription.currentPeriodEnd)}
                    </span>
                </div>

                {subscription.trialEnd && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Пробный период до:</span>
                        <span className="font-medium text-blue-600">
                            {formatDate(subscription.trialEnd)}
                        </span>
                    </div>
                )}

                {subscription.cancelAtPeriodEnd && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Отмена в:</span>
                        <span className="font-medium text-red-600">
                            {formatDate(subscription.currentPeriodEnd)}
                        </span>
                    </div>
                )}
            </div>

            {/* Особенности плана */}
            <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Включено в план:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                        <span className="text-gray-600">Задачи:</span>
                        <span className="ml-2 font-medium">
                            {plan.limits.tasks === -1 ? '∞' : plan.limits.tasks.toLocaleString()}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-600">ИИ запросы:</span>
                        <span className="ml-2 font-medium">
                            {plan.limits.aiRequests === -1 ? '∞' : plan.limits.aiRequests.toLocaleString()}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-600">Хранилище:</span>
                        <span className="ml-2 font-medium">
                            {plan.limits.storage === -1 ? '∞' : `${plan.limits.storage} MB`}
                        </span>
                    </div>
                </div>
            </div>

            {/* Действия */}
            <div className="flex gap-3">
                {subscription.status === 'active' && (
                    <Button
                        onClick={handleManageSubscription}
                        variant="outline"
                        size="sm"
                        isLoading={isManaging}
                        className="flex-1"
                    >
                        <CreditCardIcon className="w-4 h-4 mr-2" />
                        Управление подпиской
                    </Button>
                )}

                {subscription.tier === 'free' && (
                    <Button
                        onClick={onUpgrade}
                        variant="primary"
                        size="sm"
                        className="flex-1"
                    >
                        <ExternalLinkIcon className="w-4 h-4 mr-2" />
                        Обновить план
                    </Button>
                )}
            </div>
        </div>
    )
}
