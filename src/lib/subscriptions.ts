// 💳 Система подписок с Тинькофф интеграцией
import { Subscription, SubscriptionPlan, SubscriptionStatus, SubscriptionTier } from '@/types'
import { getSupabaseClient } from './supabase'

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
    subscriptions?: Subscription[]
    error?: string
}

// Планы подписок
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Бесплатный',
    tier: 'free',
    price: 0,
    currency: 'RUB',
    interval: 'month',
    features: [
      'До 50 задач в месяц',
      'Базовое планирование',
      'Уведомления по email',
      'Мобильное приложение'
    ],
    limits: {
      tasks: 50,
      aiRequests: 10,
      storage: 100 // MB
    },
    tinkoffPriceId: '',
    isActive: true
  },
    {
        id: 'premium',
        name: 'Премиум',
        tier: 'premium',
        price: 999,
        currency: 'RUB',
        interval: 'month',
        features: [
            'До 500 задач в месяц',
            'ИИ-планировщик',
            'Приоритетная поддержка',
            'Экспорт данных',
            'Интеграции с календарем'
        ],
        limits: {
            tasks: 500,
            aiRequests: 100,
            storage: 1000 // MB
        },
        tinkoffPriceId: 'tinkoff_premium_monthly',
        isActive: true
    },
    {
        id: 'pro',
        name: 'Профессиональный',
        tier: 'pro',
        price: 1999,
        currency: 'RUB',
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
        name: 'Корпоративный',
        tier: 'enterprise',
        price: 4999,
        currency: 'RUB',
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
        // Временно закомментировано для build
        /*
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
        */
        
        // Временная заглушка
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
        // Временно закомментировано для build
        /*
        const supabase = getSupabaseClient()
        
        const { data: subscription, error } = await supabase
            .from('user_subscriptions')
            .insert([{
                user_id: data.userId,
                tier: data.tier,
                status: 'active',
                tinkoff_customer_id: data.tinkoffCustomerId,
                tinkoff_payment_id: data.tinkoffPaymentId,
                current_period_start: data.currentPeriodStart.toISOString(),
                current_period_end: data.currentPeriodEnd.toISOString(),
                trial_end: data.trialEnd?.toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
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
                id: subscription.id,
                userId: subscription.user_id,
                tier: subscription.tier,
                status: subscription.status,
                tinkoffCustomerId: subscription.tinkoff_customer_id,
                tinkoffPaymentId: subscription.tinkoff_payment_id,
                currentPeriodStart: new Date(subscription.current_period_start),
                currentPeriodEnd: new Date(subscription.current_period_end),
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                trialEnd: subscription.trial_end ? new Date(subscription.trial_end) : undefined,
                createdAt: new Date(subscription.created_at),
                updatedAt: new Date(subscription.updated_at)
            }
        }
        */
        
        // Временная заглушка
        return {
            success: true,
            subscription: {
                id: 'temp-' + Date.now(),
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
                id: data.id,
                userId: data.user_id,
                tier: data.tier,
                status: data.status,
                tinkoffCustomerId: data.tinkoff_customer_id,
                tinkoffPaymentId: data.tinkoff_payment_id,
                currentPeriodStart: new Date(data.current_period_start),
                currentPeriodEnd: new Date(data.current_period_end),
                cancelAtPeriodEnd: data.cancel_at_period_end,
                trialEnd: data.trial_end ? new Date(data.trial_end) : undefined,
                createdAt: new Date(data.created_at),
                updatedAt: new Date(data.updated_at)
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
                id: data.id,
                userId: data.user_id,
                tier: data.tier,
                status: data.status,
                tinkoffCustomerId: data.tinkoff_customer_id,
                tinkoffPaymentId: data.tinkoff_payment_id,
                currentPeriodStart: new Date(data.current_period_start),
                currentPeriodEnd: new Date(data.current_period_end),
                cancelAtPeriodEnd: data.cancel_at_period_end,
                trialEnd: data.trial_end ? new Date(data.trial_end) : undefined,
                createdAt: new Date(data.created_at),
                updatedAt: new Date(data.updated_at)
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

        const subscriptions: Subscription[] = data.map(item => ({
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
            subscriptions
        }
        */
        
        // Временная заглушка
        return {
            success: true,
            subscriptions: []
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
export function getSubscriptionPlan(planId: string): SubscriptionPlan | undefined {
    return SUBSCRIPTION_PLANS.find(plan => plan.id === planId)
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
export function getSubscriptionPlans(): SubscriptionPlan[] {
    return SUBSCRIPTION_PLANS.filter(plan => plan.isActive)
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
export function getUserLimits(subscription: Subscription): { tasks: number; aiRequests: number; storage: number } {
    const plan = getSubscriptionPlan(subscription.tier)
    if (!plan) {
        return { tasks: 50, aiRequests: 10, storage: 100 }
    }

    return plan.limits
}
