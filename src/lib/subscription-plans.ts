// 📋 Планы подписок (без зависимостей от Supabase)
import { SubscriptionPlan } from '@/types'

// Планы подписок
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
    {
        id: 'free',
        name: 'Free',
        tier: 'free',
        price: 0,
        currency: 'RUB',
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
        currency: 'RUB',
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
        name: 'Enterprise',
        tier: 'enterprise',
        price: 499900, // 4999 рублей в копейках
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
 * 📝 Получение планов подписок (для API)
 */
export function getSubscriptionPlans(): SubscriptionPlan[] {
    return SUBSCRIPTION_PLANS.filter(plan => plan.isActive)
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
