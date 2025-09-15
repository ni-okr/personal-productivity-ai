// 💳 Stripe интеграция для обработки платежей
import { SubscriptionTier } from '@/types'
import Stripe from 'stripe'

// Инициализация Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
    typescript: true
})

export interface CreateCheckoutSessionData {
    userId: string
    planId: string
    successUrl: string
    cancelUrl: string
    trialDays?: number
}

export interface CreateCustomerPortalData {
    userId: string
    returnUrl: string
}

export interface StripeResponse {
    success: boolean
    data?: any
    error?: string
    message?: string
}

/**
 * 🛒 Создание сессии для оплаты
 */
export async function createCheckoutSession(data: CreateCheckoutSessionData): Promise<StripeResponse> {
    try {
        // Получаем план подписки
        const plan = getStripePriceId(data.planId)
        if (!plan) {
            return {
                success: false,
                error: 'План подписки не найден'
            }
        }

        const session = await stripe.checkout.sessions.create({
            customer_email: undefined, // Будет заполнено после создания пользователя
            line_items: [
                {
                    price: plan.stripePriceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: data.successUrl,
            cancel_url: data.cancelUrl,
            subscription_data: {
                trial_period_days: data.trialDays || 0,
                metadata: {
                    userId: data.userId,
                    planId: data.planId
                }
            },
            metadata: {
                userId: data.userId,
                planId: data.planId
            }
        })

        return {
            success: true,
            data: {
                sessionId: session.id,
                url: session.url
            },
            message: 'Сессия оплаты создана'
        }
    } catch (error: any) {
        console.error('Ошибка создания сессии Stripe:', error)
        return {
            success: false,
            error: error.message || 'Ошибка создания сессии оплаты'
        }
    }
}

/**
 * 👤 Создание клиента Stripe
 */
export async function createCustomer(userId: string, email: string, name: string): Promise<StripeResponse> {
    try {
        const customer = await stripe.customers.create({
            email,
            name,
            metadata: {
                userId
            }
        })

        return {
            success: true,
            data: {
                customerId: customer.id
            },
            message: 'Клиент Stripe создан'
        }
    } catch (error: any) {
        console.error('Ошибка создания клиента Stripe:', error)
        return {
            success: false,
            error: error.message || 'Ошибка создания клиента'
        }
    }
}

/**
 * 🔗 Создание ссылки на портал клиента
 */
export async function createCustomerPortalSession(data: CreateCustomerPortalData): Promise<StripeResponse> {
    try {
        // Сначала нужно получить customerId из базы данных
        // Пока возвращаем заглушку
        return {
            success: false,
            error: 'Функция в разработке'
        }
    } catch (error: any) {
        console.error('Ошибка создания портала клиента:', error)
        return {
            success: false,
            error: error.message || 'Ошибка создания портала клиента'
        }
    }
}

/**
 * 📋 Получение подписки из Stripe
 */
export async function getStripeSubscription(subscriptionId: string): Promise<StripeResponse> {
    try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)

        return {
            success: true,
            data: {
                id: subscription.id,
                status: subscription.status,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
            },
            message: 'Подписка получена из Stripe'
        }
    } catch (error: any) {
        console.error('Ошибка получения подписки из Stripe:', error)
        return {
            success: false,
            error: error.message || 'Ошибка получения подписки'
        }
    }
}

/**
 * ❌ Отмена подписки в Stripe
 */
export async function cancelStripeSubscription(subscriptionId: string): Promise<StripeResponse> {
    try {
        const subscription = await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true
        })

        return {
            success: true,
            data: {
                id: subscription.id,
                cancelAtPeriodEnd: subscription.cancel_at_period_end
            },
            message: 'Подписка отменена в Stripe'
        }
    } catch (error: any) {
        console.error('Ошибка отмены подписки в Stripe:', error)
        return {
            success: false,
            error: error.message || 'Ошибка отмены подписки'
        }
    }
}

/**
 * 🔄 Восстановление подписки в Stripe
 */
export async function resumeStripeSubscription(subscriptionId: string): Promise<StripeResponse> {
    try {
        const subscription = await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: false
        })

        return {
            success: true,
            data: {
                id: subscription.id,
                cancelAtPeriodEnd: subscription.cancel_at_period_end
            },
            message: 'Подписка восстановлена в Stripe'
        }
    } catch (error: any) {
        console.error('Ошибка восстановления подписки в Stripe:', error)
        return {
            success: false,
            error: error.message || 'Ошибка восстановления подписки'
        }
    }
}

/**
 * 🎯 Получение price ID для плана
 */
function getStripePriceId(planId: string): { stripePriceId: string; tier: SubscriptionTier } | null {
    const priceMap: Record<string, { stripePriceId: string; tier: SubscriptionTier }> = {
        'premium': {
            stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium',
            tier: 'premium'
        },
        'pro': {
            stripePriceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
            tier: 'pro'
        },
        'enterprise': {
            stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
            tier: 'enterprise'
        }
    }

    return priceMap[planId] || null
}

/**
 * 🔐 Верификация webhook подписи
 */
export function verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
        stripe.webhooks.constructEvent(payload, signature, webhookSecret)
        return true
    } catch (error) {
        console.error('Ошибка верификации webhook:', error)
        return false
    }
}

/**
 * 📨 Обработка webhook событий
 */
export async function handleWebhookEvent(event: Stripe.Event): Promise<StripeResponse> {
    try {
        switch (event.type) {
            case 'customer.subscription.created':
                return await handleSubscriptionCreated(event.data.object as Stripe.Subscription)

            case 'customer.subscription.updated':
                return await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)

            case 'customer.subscription.deleted':
                return await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)

            case 'invoice.payment_succeeded':
                return await handlePaymentSucceeded(event.data.object as Stripe.Invoice)

            case 'invoice.payment_failed':
                return await handlePaymentFailed(event.data.object as Stripe.Invoice)

            default:
                return {
                    success: true,
                    message: `Необработанное событие: ${event.type}`
                }
        }
    } catch (error: any) {
        console.error('Ошибка обработки webhook:', error)
        return {
            success: false,
            error: error.message || 'Ошибка обработки webhook'
        }
    }
}

// Обработчики webhook событий
async function handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<StripeResponse> {
    // Логика создания подписки в базе данных
    return {
        success: true,
        message: 'Подписка создана'
    }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<StripeResponse> {
    // Логика обновления подписки в базе данных
    return {
        success: true,
        message: 'Подписка обновлена'
    }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<StripeResponse> {
    // Логика удаления подписки в базе данных
    return {
        success: true,
        message: 'Подписка удалена'
    }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<StripeResponse> {
    // Логика успешной оплаты
    return {
        success: true,
        message: 'Оплата прошла успешно'
    }
}

async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<StripeResponse> {
    // Логика неудачной оплаты
    return {
        success: true,
        message: 'Оплата не прошла'
    }
}

export { stripe }
