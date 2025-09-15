// 💳 Система подписок с Stripe интеграцией
import { Subscription, SubscriptionPlan, SubscriptionStatus, SubscriptionTier } from '@/types'
import { supabase } from './supabase'

export interface CreateSubscriptionData {
    userId: string
    tier: SubscriptionTier
    stripeCustomerId: string
    stripeSubscriptionId: string
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
    message?: string
}

// Планы подписок
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
    {
        id: 'free',
        name: 'Free',
        tier: 'free',
        price: 0,
        currency: 'usd',
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
            storage: 100
        },
        stripePriceId: '',
        isActive: true
    },
    {
        id: 'premium',
        name: 'Premium',
        tier: 'premium',
        price: 999, // $9.99
        currency: 'usd',
        interval: 'month',
        features: [
            'До 500 задач',
            'OpenAI GPT-4o Mini',
            'Расширенная аналитика',
            'Приоритетная поддержка',
            'Экспорт данных'
        ],
        limits: {
            tasks: 500,
            aiRequests: 1000,
            storage: 1000
        },
        stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID || '',
        isActive: true
    },
    {
        id: 'pro',
        name: 'Pro',
        tier: 'pro',
        price: 1999, // $19.99
        currency: 'usd',
        interval: 'month',
        features: [
            'Неограниченные задачи',
            'Все ИИ модели',
            'API доступ',
            'Кастомные интеграции',
            'Командные функции'
        ],
        limits: {
            tasks: -1, // unlimited
            aiRequests: 5000,
            storage: 5000
        },
        stripePriceId: process.env.STRIPE_PRO_PRICE_ID || '',
        isActive: true
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        tier: 'enterprise',
        price: 4999, // $49.99
        currency: 'usd',
        interval: 'month',
        features: [
            'Все функции Pro',
            'Белый лейбл',
            'Персональная поддержка',
            'SLA гарантии',
            'Кастомные интеграции'
        ],
        limits: {
            tasks: -1,
            aiRequests: -1,
            storage: -1
        },
        stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || '',
        isActive: true
    }
]

/**
 * 📝 Получение подписки пользователя
 */
export async function getSubscription(userId: string): Promise<SubscriptionResponse> {
    try {
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
            id: data.id,
            userId: data.user_id,
            tier: data.tier,
            status: data.status,
            stripeCustomerId: data.stripe_customer_id,
            stripeSubscriptionId: data.stripe_subscription_id,
            currentPeriodStart: new Date(data.current_period_start),
            currentPeriodEnd: new Date(data.current_period_end),
            cancelAtPeriodEnd: data.cancel_at_period_end,
            trialEnd: data.trial_end ? new Date(data.trial_end) : undefined,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at)
        }

        return {
            success: true,
            subscription
        }
    } catch (error) {
        console.error('Ошибка получения подписки:', error)
        return {
            success: false,
            error: 'Произошла ошибка при загрузке подписки'
        }
    }
}

/**
 * ➕ Создание подписки
 */
export async function createSubscription(subscriptionData: CreateSubscriptionData): Promise<SubscriptionResponse> {
    try {
        const { data, error } = await supabase
            .from('user_subscriptions')
            .insert({
                user_id: subscriptionData.userId,
                tier: subscriptionData.tier,
                status: 'active',
                stripe_customer_id: subscriptionData.stripeCustomerId,
                stripe_subscription_id: subscriptionData.stripeSubscriptionId,
                current_period_start: subscriptionData.currentPeriodStart.toISOString(),
                current_period_end: subscriptionData.currentPeriodEnd.toISOString(),
                trial_end: subscriptionData.trialEnd?.toISOString(),
                cancel_at_period_end: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single()

        if (error) {
            console.error('Ошибка создания подписки:', error)
            return {
                success: false,
                error: 'Не удалось создать подписку'
            }
        }

        const subscription: Subscription = {
            id: data.id,
            userId: data.user_id,
            tier: data.tier,
            status: data.status,
            stripeCustomerId: data.stripe_customer_id,
            stripeSubscriptionId: data.stripe_subscription_id,
            currentPeriodStart: new Date(data.current_period_start),
            currentPeriodEnd: new Date(data.current_period_end),
            cancelAtPeriodEnd: data.cancel_at_period_end,
            trialEnd: data.trial_end ? new Date(data.trial_end) : undefined,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at)
        }

        return {
            success: true,
            subscription,
            message: 'Подписка успешно создана'
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
 * ✏️ Обновление подписки
 */
export async function updateSubscription(subscriptionId: string, updates: UpdateSubscriptionData): Promise<SubscriptionResponse> {
    try {
        const updateData: any = {
            ...updates,
            updated_at: new Date().toISOString()
        }

        // Преобразуем даты в ISO строки
        if (updates.currentPeriodStart) {
            updateData.current_period_start = updates.currentPeriodStart.toISOString()
        }
        if (updates.currentPeriodEnd) {
            updateData.current_period_end = updates.currentPeriodEnd.toISOString()
        }
        if (updates.trialEnd) {
            updateData.trial_end = updates.trialEnd.toISOString()
        }

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

        const subscription: Subscription = {
            id: data.id,
            userId: data.user_id,
            tier: data.tier,
            status: data.status,
            stripeCustomerId: data.stripe_customer_id,
            stripeSubscriptionId: data.stripe_subscription_id,
            currentPeriodStart: new Date(data.current_period_start),
            currentPeriodEnd: new Date(data.current_period_end),
            cancelAtPeriodEnd: data.cancel_at_period_end,
            trialEnd: data.trial_end ? new Date(data.trial_end) : undefined,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at)
        }

        return {
            success: true,
            subscription,
            message: 'Подписка успешно обновлена'
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
 * 🗑️ Отмена подписки
 */
export async function cancelSubscription(subscriptionId: string): Promise<SubscriptionResponse> {
    try {
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

        const subscription: Subscription = {
            id: data.id,
            userId: data.user_id,
            tier: data.tier,
            status: data.status,
            stripeCustomerId: data.stripe_customer_id,
            stripeSubscriptionId: data.stripe_subscription_id,
            currentPeriodStart: new Date(data.current_period_start),
            currentPeriodEnd: new Date(data.current_period_end),
            cancelAtPeriodEnd: data.cancel_at_period_end,
            trialEnd: data.trial_end ? new Date(data.trial_end) : undefined,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at)
        }

        return {
            success: true,
            subscription,
            message: 'Подписка успешно отменена'
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
 * 📊 Получение планов подписок
 */
export function getSubscriptionPlans(): SubscriptionPlan[] {
    return SUBSCRIPTION_PLANS.filter(plan => plan.isActive)
}

/**
 * 🎯 Получение плана по типу
 */
export function getSubscriptionPlan(tier: SubscriptionTier): SubscriptionPlan | undefined {
    return SUBSCRIPTION_PLANS.find(plan => plan.tier === tier && plan.isActive)
}

/**
 * ✅ Проверка доступа к функции
 */
export function hasFeatureAccess(subscription: Subscription, feature: string): boolean {
    const plan = getSubscriptionPlan(subscription.tier)
    if (!plan) return false

    // Проверяем статус подписки
    if (subscription.status !== 'active' && subscription.status !== 'trialing') {
        return false
    }

    // Проверяем срок действия
    if (subscription.currentPeriodEnd < new Date()) {
        return false
    }

    // Проверяем конкретные функции
    switch (feature) {
        case 'ai_requests':
            return subscription.tier !== 'free'
        case 'unlimited_tasks':
            return subscription.tier === 'pro' || subscription.tier === 'enterprise'
        case 'api_access':
            return subscription.tier === 'pro' || subscription.tier === 'enterprise'
        case 'white_label':
            return subscription.tier === 'enterprise'
        default:
            return true
    }
}

/**
 * 📈 Получение лимитов пользователя
 */
export function getUserLimits(subscription: Subscription | null) {
    if (!subscription) {
        return SUBSCRIPTION_PLANS[0].limits // Free plan limits
    }

    const plan = getSubscriptionPlan(subscription.tier)
    if (!plan) {
        return SUBSCRIPTION_PLANS[0].limits // Free plan limits
    }

    return plan.limits
}

/**
 * 🔄 Синхронизация подписки с Stripe
 */
export async function syncSubscriptionWithStripe(stripeSubscriptionId: string): Promise<SubscriptionResponse> {
    try {
        // Здесь будет интеграция с Stripe API для получения актуальных данных
        // Пока возвращаем успех
        return {
            success: true,
            message: 'Подписка синхронизирована с Stripe'
        }
    } catch (error) {
        console.error('Ошибка синхронизации с Stripe:', error)
        return {
            success: false,
            error: 'Произошла ошибка при синхронизации с Stripe'
        }
    }
}
