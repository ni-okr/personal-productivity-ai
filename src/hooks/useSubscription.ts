// 💳 Хук для управления подписками
'use client'

import { getSubscriptionPlan } from '@/lib/subscriptions'
import { useAppStore } from '@/stores/useAppStore'
import { Subscription, SubscriptionPlan } from '@/types'
import { useEffect, useState } from 'react'

interface UseSubscriptionReturn {
    subscription: Subscription | null
    plan: SubscriptionPlan | null
    isLoading: boolean
    error: string | null
    createCheckoutSession: (planId: string) => Promise<{ success: boolean; url?: string; error?: string }>
    createPortalSession: () => Promise<{ success: boolean; url?: string; error?: string }>
    refreshSubscription: () => Promise<void>
}

export function useSubscription(): UseSubscriptionReturn {
    const { user } = useAppStore()
    const [subscription, setSubscription] = useState<Subscription | null>(null)
    const [plan, setPlan] = useState<SubscriptionPlan | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Загружаем статус подписки
    const loadSubscription = async () => {
        try {
            setIsLoading(true)
            setError(null)

            // 🚨 MOCK РЕЖИМ: Используем mock функции вместо реальных запросов
            if (process.env.NEXT_PUBLIC_DISABLE_EMAIL === 'true') {
                const { mockGetSubscription } = await import('../../tests/mocks/subscription-mock')

                if (user?.id) {
                    console.log('useSubscription: Loading subscription for user:', user.id)
                    const result = await mockGetSubscription(user.id)
                    console.log('useSubscription: Mock result:', result)
                    if (result.success && result.subscription) {
                        console.log('useSubscription: Setting subscription:', result.subscription)
                        setSubscription(result.subscription)
                        // Устанавливаем план на основе tier
                        const plan = getSubscriptionPlan(result.subscription.tier)
                        setPlan(plan)
                    } else {
                        setError(result.error || 'Подписка не найдена')
                    }
                } else {
                    setError('Пользователь не авторизован')
                }
            } else {
                const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/subscriptions/status`)
                const result = await response.json()

                if (result.success) {
                    setSubscription(result.data.subscription)
                    setPlan(result.data.plan)
                } else {
                    setError(result.error || 'Ошибка загрузки подписки')
                }
            }
        } catch (err: any) {
            setError(err.message || 'Ошибка загрузки подписки')
        } finally {
            setIsLoading(false)
        }
    }

    // Создаем checkout сессию
    const createCheckoutSession = async (planId: string) => {
        try {
            setError(null)

            const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/subscriptions/create-checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId,
                    successUrl: `${window.location.origin}/planner?success=true`,
                    cancelUrl: `${window.location.origin}/planner?canceled=true`
                })
            })

            const result = await response.json()

            if (result.success) {
                return {
                    success: true,
                    url: result.data.url
                }
            } else {
                return {
                    success: false,
                    error: result.error || 'Ошибка создания checkout сессии'
                }
            }
        } catch (err: any) {
            return {
                success: false,
                error: err.message || 'Ошибка создания checkout сессии'
            }
        }
    }

    // Создаем portal сессию
    const createPortalSession = async () => {
        try {
            setError(null)

            const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/subscriptions/portal`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    returnUrl: window.location.href
                })
            })

            const result = await response.json()

            if (result.success) {
                return {
                    success: true,
                    url: result.data.url
                }
            } else {
                return {
                    success: false,
                    error: result.error || 'Ошибка создания portal сессии'
                }
            }
        } catch (err: any) {
            return {
                success: false,
                error: err.message || 'Ошибка создания portal сессии'
            }
        }
    }

    // Обновляем подписку
    const refreshSubscription = async () => {
        await loadSubscription()
    }

    // Загружаем подписку при инициализации и при изменении пользователя
    useEffect(() => {
        if (user) {
            loadSubscription()
        } else {
            // Очищаем подписку при выходе пользователя
            setSubscription(null)
            setPlan(null)
            setError(null)
            setIsLoading(false)
        }
    }, [user])

    return {
        subscription,
        plan,
        isLoading,
        error,
        createCheckoutSession,
        createPortalSession,
        refreshSubscription
    }
}
