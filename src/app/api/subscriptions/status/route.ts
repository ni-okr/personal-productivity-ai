// 📊 API для получения статуса подписки
import { getSubscriptionPlan } from '@/lib/subscription-plans'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        // Проверяем переменные окружения
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.log('⚠️ Переменные окружения Supabase не настроены, используем заглушку')

            // Заглушка для режима разработки
            return NextResponse.json({
                success: true,
                data: {
                    subscription: {
                        id: 'free',
                        userId: 'dev-user',
                        tier: 'free',
                        status: 'active',
                        currentPeriodStart: new Date(),
                        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                        cancelAtPeriodEnd: false,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    },
                    plan: getSubscriptionPlan('free')
                }
            })
        }

        // Импортируем getCurrentUser и getSubscription только если есть переменные окружения
        const { getCurrentUser } = await import('@/lib/auth')
        const { getSubscription } = await import('@/lib/subscriptions')

        // Проверяем авторизацию
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Необходима авторизация' },
                { status: 401 }
            )
        }

        // Получаем подписку пользователя
        const result = await getSubscription(user.id)

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            data: {
                subscription: result.subscription,
                plan: result.subscription ? getSubscriptionPlan(result.subscription.tier) : null
            }
        })
    } catch (error: any) {
        console.error('Ошибка получения статуса подписки:', error)
        return NextResponse.json(
            { success: false, error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        )
    }
}
