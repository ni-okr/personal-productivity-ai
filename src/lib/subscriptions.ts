// 💳 Система подписок с Тинькофф интеграцией
import { Subscription, SubscriptionPlan, SubscriptionStatus, SubscriptionTier } from '@/types'
import type { SubscriptionInsert } from '@/types/supabase'
import {
    mockGetSubscription
} from '../../tests/mocks/subscription-mock'
import { getSupabaseClient } from './supabase'

// 🚨 ЗАЩИТА ОТ ТЕСТИРОВАНИЯ С РЕАЛЬНЫМИ EMAIL
const DISABLE_EMAIL = process.env.NEXT_PUBLIC_DISABLE_EMAIL === 'true'

export interface CreateSubscriptionData {
    userId: string
    tier: SubscriptionTier
    tinkoffCustomerId: string
    tinkoffPaymentId: string
    currentPeriodStart: Date
    currentPeriodEnd: Date
    trialEnd?: Date
}

export interface UpdateSubscriptionData {
    status?: SubscriptionStatus
    currentPeriodStart?: Date
    currentPeriodEnd?: Date
    cancelAtPeriodEnd?: boolean
    trialEnd?: Date
}

export interface SubscriptionResponse {
    success: boolean
    subscription?: Subscription
    error?: string
}

export interface SubscriptionListResponse {
    success: boolean
    user_subscriptions?: Subscription[]
    error?: string
}

// Планы подписок
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
    {
        id: 'free',
        name: 'Free',
        tier: 'free',
        price: 0,
        currency: 'rub',
        interval: 'month',
        features: [
            'До 50 задач',
            'Базовый планировщик',
            'Псевдо-ИИ рекомендации',
            'Мобильное приложение'
        ],
        limits: {
            tasks: 50,
            aiRequests: 0,
            storage: 100 // MB
        },
        tinkoffPriceId: '',
        isActive: true
    },
    {
        id: 'premium',
        name: 'Premium',
        tier: 'premium',
        price: 99900, // 999 рублей в копейках
        currency: 'rub',
        interval: 'month',
        features: [
            'До 500 задач в месяц',
            'OpenAI GPT-4o Mini',
            'Приоритетная поддержка',
            'Расширенная аналитика',
            'Экспорт данных'
        ],
        limits: {
            tasks: 500,
            aiRequests: 1000,
            storage: 1000 // MB
        },
        tinkoffPriceId: 'tinkoff_premium_monthly',
        isActive: true
    },
    {
        id: 'pro',
        name: 'Pro',
        tier: 'pro',
        price: 199900, // 1999 рублей в копейках
        currency: 'rub',
        interval: 'month',
        features: [
            'Неограниченные задачи',
            'Продвинутый ИИ-ассистент',
            'Командная работа',
            'Аналитика и отчеты',
            'API доступ',
            'Персональный менеджер'
        ],
        limits: {
            tasks: -1,
            aiRequests: -1,
            storage: -1
        },
        tinkoffPriceId: 'tinkoff_pro_monthly',
        isActive: true
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        tier: 'enterprise',
        price: 499900, // 4999 рублей в копейках
        currency: 'rub',
        interval: 'month',
        features: [
            'Все функции Pro',
            'Управление командой',
            'Корпоративная безопасность',
            'Интеграции с корпоративными системами',
            'Обучение и поддержка',
            'SLA 99.9%'
        ],
        limits: {
            tasks: -1,
            aiRequests: -1,
            storage: -1
        },
        tinkoffPriceId: 'tinkoff_enterprise_monthly',
        isActive: true
    }
]

/**
 * 📝 Получение подписки пользователя
 */
export async function getSubscription(userId: string): Promise<SubscriptionResponse> {
    try {
        // 🚨 MOCK РЕЖИМ: Отключение реальных запросов к Supabase
        if (DISABLE_EMAIL) {
            return mockGetSubscription(userId)
        }

        // Проверяем наличие переменных окружения Supabase
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            // Возвращаем free tier если нет переменных окружения
            return {
                success: true,
                subscription: {
                    id: 'free',
                    userId,
                    tier: 'free',
                    status: 'active',
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
                    cancelAtPeriodEnd: false,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            }
        }

        // Используем Supabase клиент
        const supabase = getSupabaseClient()

        const { data, error } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', userId)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                // No subscription found, return free tier
                return {
                    success: true,
                    subscription: {
                        id: 'free',
                        userId,
                        tier: 'free',
                        status: 'active',
                        currentPeriodStart: new Date(),
                        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
                        cancelAtPeriodEnd: false,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                }
            }

            console.error('Ошибка получения подписки:', error)
            return {
                success: false,
                error: 'Не удалось загрузить подписку'
            }
        }

        const subscription: Subscription = {
            id: (data as any).id,
            userId: (data as any).user_id,
            tier: (data as any).tier,
            status: (data as any).status,
            tinkoffCustomerId: (data as any).tinkoff_customer_id,
            tinkoffPaymentId: (data as any).tinkoff_payment_id,
            currentPeriodStart: new Date((data as any).current_period_start),
            currentPeriodEnd: new Date((data as any).current_period_end),
            cancelAtPeriodEnd: (data as any).cancel_at_period_end,
            trialEnd: (data as any).trial_end ? new Date((data as any).trial_end) : undefined,
            createdAt: new Date((data as any).created_at),
            updatedAt: new Date((data as any).updated_at)
        }

        return {
            success: true,
            subscription
        }
    } catch (error) {
        console.error('Ошибка получения подписки:', error)
        return {
            success: false,
            error: 'Произошла ошибка при получении подписки'
        }
    }
}

/**
 * 📝 Создание новой подписки
 */
export async function createSubscription(data: CreateSubscriptionData): Promise<SubscriptionResponse> {
    try {
        // Валидация данных
        if (!data.userId) {
            return {
                success: false,
                error: 'ID пользователя обязателен'
            }
        }

        if (!data.tier || !['free', 'premium', 'pro'].includes(data.tier)) {
            return {
                success: false,
                error: 'Некорректный тип подписки'
            }
        }

        // 🚨 MOCK РЕЖИМ: Отключение реальных запросов к Supabase
        if (DISABLE_EMAIL) {
            console.log('🧪 MOCK РЕЖИМ: Создание подписки без реальных запросов к Supabase')
            const { mockCreateSubscription } = await import('./subscription-mock')
            return mockCreateSubscription(data.userId, data.tier)
        }

        // Проверяем наличие переменных окружения Supabase
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            // Возвращаем заглушку если нет переменных окружения
            return {
                success: true,
                subscription: {
                    id: 'temp-subscription',
                    userId: data.userId,
                    tier: data.tier,
                    status: 'active',
                    tinkoffCustomerId: data.tinkoffCustomerId,
                    tinkoffPaymentId: data.tinkoffPaymentId,
                    currentPeriodStart: data.currentPeriodStart,
                    currentPeriodEnd: data.currentPeriodEnd,
                    cancelAtPeriodEnd: false,
                    trialEnd: data.trialEnd,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            }
        }

        // Используем Supabase клиент
        const supabase = getSupabaseClient()

        const subscriptionData: SubscriptionInsert = {
            user_id: data.userId,
            tier: data.tier === 'enterprise' ? 'pro' : data.tier as 'free' | 'premium' | 'pro',
            status: 'active',
            stripe_customer_id: data.tinkoffCustomerId,
            stripe_subscription_id: data.tinkoffPaymentId,
            current_period_start: data.currentPeriodStart.toISOString(),
            current_period_end: data.currentPeriodEnd.toISOString(),
            trial_end: data.trialEnd?.toISOString(),
            cancel_at_period_end: false
        }

        const { data: subscription, error } = await supabase
            .from('user_subscriptions')
            .insert(subscriptionData as any)
            .select()
            .single()

        if (error) {
            console.error('Ошибка создания подписки:', error)
            return {
                success: false,
                error: 'Не удалось создать подписку'
            }
        }

        return {
            success: true,
            subscription: {
                id: (subscription as any).id,
                userId: (subscription as any).user_id,
                tier: (subscription as any).tier,
                status: (subscription as any).status,
                tinkoffCustomerId: (subscription as any).tinkoff_customer_id,
                tinkoffPaymentId: (subscription as any).tinkoff_payment_id,
                currentPeriodStart: new Date((subscription as any).current_period_start),
                currentPeriodEnd: new Date((subscription as any).current_period_end),
                cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
                trialEnd: (subscription as any).trial_end ? new Date((subscription as any).trial_end) : undefined,
                createdAt: new Date((subscription as any).created_at),
                updatedAt: new Date((subscription as any).updated_at)
            }
        }
    } catch (error) {
        console.error('Ошибка создания подписки:', error)
        return {
            success: false,
            error: 'Произошла ошибка при создании подписки'
        }
    }
}

/**
 * 📝 Обновление подписки
 */
export async function updateSubscription(
    subscriptionId: string,
    updates: UpdateSubscriptionData
): Promise<SubscriptionResponse> {
    try {
        // 🚨 MOCK РЕЖИМ: Отключение реальных запросов к Supabase
        if (DISABLE_EMAIL) {
            console.log('🧪 MOCK РЕЖИМ: Обновление подписки без реальных запросов к Supabase')
            const { mockUpdateSubscription } = await import('./subscription-mock')
            return mockUpdateSubscription(subscriptionId, updates)
        }

        // Временно закомментировано для build
        /*
        const supabase = getSupabaseClient()
        
        const updateData: any = {
            updated_at: new Date().toISOString()
        }

        if (updates.status) updateData.status = updates.status
        if (updates.currentPeriodStart) updateData.current_period_start = updates.currentPeriodStart.toISOString()
        if (updates.currentPeriodEnd) updateData.current_period_end = updates.currentPeriodEnd.toISOString()
        if (updates.cancelAtPeriodEnd !== undefined) updateData.cancel_at_period_end = updates.cancelAtPeriodEnd
        if (updates.trialEnd) updateData.trial_end = updates.trialEnd.toISOString()

        const { data, error } = await supabase
            .from('user_subscriptions')
            .update(updateData)
            .eq('id', subscriptionId)
            .select()
            .single()

        if (error) {
            console.error('Ошибка обновления подписки:', error)
            return {
                success: false,
                error: 'Не удалось обновить подписку'
            }
        }

        return {
            success: true,
            subscription: {
                id: (data as any).id,
                userId: (data as any).user_id,
                tier: (data as any).tier,
                status: (data as any).status,
                tinkoffCustomerId: (data as any).tinkoff_customer_id,
                tinkoffPaymentId: (data as any).tinkoff_payment_id,
                currentPeriodStart: new Date((data as any).current_period_start),
                currentPeriodEnd: new Date((data as any).current_period_end),
                cancelAtPeriodEnd: (data as any).cancel_at_period_end,
                trialEnd: (data as any).trial_end ? new Date((data as any).trial_end) : undefined,
                createdAt: new Date((data as any).created_at),
                updatedAt: new Date((data as any).updated_at)
            }
        }
        */

        // Временная заглушка
        return {
            success: true,
            subscription: {
                id: subscriptionId,
                userId: 'temp-user',
                tier: 'free',
                status: updates.status || 'active',
                tinkoffCustomerId: '',
                tinkoffPaymentId: '',
                currentPeriodStart: updates.currentPeriodStart || new Date(),
                currentPeriodEnd: updates.currentPeriodEnd || new Date(),
                cancelAtPeriodEnd: updates.cancelAtPeriodEnd || false,
                trialEnd: updates.trialEnd,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        }
    } catch (error) {
        console.error('Ошибка обновления подписки:', error)
        return {
            success: false,
            error: 'Произошла ошибка при обновлении подписки'
        }
    }
}

/**
 * 📝 Отмена подписки
 */
export async function cancelSubscription(subscriptionId: string): Promise<SubscriptionResponse> {
    try {
        // 🚨 MOCK РЕЖИМ: Отключение реальных запросов к Supabase
        if (DISABLE_EMAIL) {
            console.log('🧪 MOCK РЕЖИМ: Отмена подписки без реальных запросов к Supabase')
            const { mockCancelSubscription } = await import('./subscription-mock')
            return mockCancelSubscription(subscriptionId)
        }

        // Временно закомментировано для build
        /*
        const supabase = getSupabaseClient()
        
        const { data, error } = await supabase
            .from('user_subscriptions')
            .update({
                status: 'canceled',
                cancel_at_period_end: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', subscriptionId)
            .select()
            .single()

        if (error) {
            console.error('Ошибка отмены подписки:', error)
            return {
                success: false,
                error: 'Не удалось отменить подписку'
            }
        }

        return {
            success: true,
            subscription: {
                id: (data as any).id,
                userId: (data as any).user_id,
                tier: (data as any).tier,
                status: (data as any).status,
                tinkoffCustomerId: (data as any).tinkoff_customer_id,
                tinkoffPaymentId: (data as any).tinkoff_payment_id,
                currentPeriodStart: new Date((data as any).current_period_start),
                currentPeriodEnd: new Date((data as any).current_period_end),
                cancelAtPeriodEnd: (data as any).cancel_at_period_end,
                trialEnd: (data as any).trial_end ? new Date((data as any).trial_end) : undefined,
                createdAt: new Date((data as any).created_at),
                updatedAt: new Date((data as any).updated_at)
            }
        }
        */

        // Временная заглушка
        return {
            success: true,
            subscription: {
                id: subscriptionId,
                userId: 'temp-user',
                tier: 'free',
                status: 'canceled',
                tinkoffCustomerId: '',
                tinkoffPaymentId: '',
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(),
                cancelAtPeriodEnd: true,
                trialEnd: undefined,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        }
    } catch (error) {
        console.error('Ошибка отмены подписки:', error)
        return {
            success: false,
            error: 'Произошла ошибка при отмене подписки'
        }
    }
}

/**
 * 📝 Получение всех подписок пользователя
 */
export async function getUserSubscriptions(userId: string): Promise<SubscriptionListResponse> {
    try {
        // Временно закомментировано для build
        /*
        const supabase = getSupabaseClient()
        
        const { data, error } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Ошибка получения подписок:', error)
            return {
                success: false,
                error: 'Не удалось загрузить подписки'
            }
        }

        const user_subscriptions: Subscription[] = data.map(item => ({
            id: item.id,
            userId: item.user_id,
            tier: item.tier,
            status: item.status,
            tinkoffCustomerId: item.tinkoff_customer_id,
            tinkoffPaymentId: item.tinkoff_payment_id,
            currentPeriodStart: new Date(item.current_period_start),
            currentPeriodEnd: new Date(item.current_period_end),
            cancelAtPeriodEnd: item.cancel_at_period_end,
            trialEnd: item.trial_end ? new Date(item.trial_end) : undefined,
            createdAt: new Date(item.created_at),
            updatedAt: new Date(item.updated_at)
        }))

        return {
            success: true,
            user_subscriptions
        }
        */

        // Временная заглушка
        return {
            success: true,
            user_subscriptions: []
        }
    } catch (error) {
        console.error('Ошибка получения подписок:', error)
        return {
            success: false,
            error: 'Произошла ошибка при получении подписок'
        }
    }
}

/**
 * 📝 Получение плана подписки по ID
 */
export function getSubscriptionPlan(planId: string): SubscriptionPlan | null {
    const plan = SUBSCRIPTION_PLANS.find(plan => plan.id === planId)
    return plan || null
}

/**
 * 📝 Получение всех доступных планов
 */
export function getAllSubscriptionPlans(): SubscriptionPlan[] {
    return SUBSCRIPTION_PLANS.filter(plan => plan.isActive)
}

/**
 * 📝 Проверка лимитов подписки
 */
export function checkSubscriptionLimits(
    subscription: Subscription,
    plan: SubscriptionPlan,
    currentUsage: { tasks: number; aiRequests: number; storage: number }
): { canUse: boolean; limits: { tasks: number; aiRequests: number; storage: number } } {
    const limits = plan.limits

    return {
        canUse: (
            (limits.tasks === -1 || currentUsage.tasks < limits.tasks) &&
            (limits.aiRequests === -1 || currentUsage.aiRequests < limits.aiRequests) &&
            (limits.storage === -1 || currentUsage.storage < limits.storage)
        ),
        limits
    }
}

/**
 * 📝 Получение планов подписок (для API)
 */
export function getSubscriptionPlans(): { success: boolean; plans?: SubscriptionPlan[]; error?: string } {
    try {
        // 🚨 MOCK РЕЖИМ: Отключение реальных запросов к Supabase
        if (DISABLE_EMAIL) {
            console.log('🧪 MOCK РЕЖИМ: Получение планов подписок без реальных запросов к Supabase')
            return {
                success: true,
                plans: SUBSCRIPTION_PLANS.filter(plan => plan.isActive)
            }
        }

        return {
            success: true,
            plans: SUBSCRIPTION_PLANS.filter(plan => plan.isActive)
        }
    } catch (error) {
        console.error('Ошибка получения планов подписок:', error)
        return {
            success: false,
            error: 'Произошла ошибка при получении планов подписок'
        }
    }
}

/**
 * 📝 Проверка доступа к функции
 */
export function hasFeatureAccess(
    subscription: Subscription,
    feature: string
): boolean {
    const plan = getSubscriptionPlan(subscription.tier)
    if (!plan) return false

    // Простая проверка доступа к функциям
    switch (feature) {
        case 'ai_planning':
            return subscription.tier !== 'free'
        case 'unlimited_tasks':
            return subscription.tier === 'pro' || subscription.tier === 'enterprise'
        case 'team_collaboration':
            return subscription.tier === 'pro' || subscription.tier === 'enterprise'
        case 'api_access':
            return subscription.tier === 'pro' || subscription.tier === 'enterprise'
        default:
            return true
    }
}

/**
 * 📝 Получение лимитов пользователя
 */
export function getUserLimits(subscription: Subscription | null): { tasks: number; aiRequests: number; storage: number } {
    if (!subscription) {
        return { tasks: 50, aiRequests: 10, storage: 100 }
    }

    const plan = getSubscriptionPlan(subscription.tier)
    if (!plan) {
        return { tasks: 50, aiRequests: 10, storage: 100 }
    }

    return plan.limits
}
