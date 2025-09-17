// 📊 API для получения статуса подписки
import { getSubscriptionPlan } from '@/lib/subscription-plans'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        // Проверяем режим разработки (mock режим)
        if (process.env.NEXT_PUBLIC_DISABLE_EMAIL === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.log('🧪 MOCK РЕЖИМ: Получение статуса подписки без реальных запросов к Supabase')

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
        let user = null
        try {
            user = await getCurrentUser()
        } catch (error) {
            console.log('⚠️ Ошибка получения пользователя:', error)
        }

        if (!user) {
            // Если пользователь не авторизован, возвращаем free tier
            console.log('⚠️ Пользователь не авторизован, возвращаем free tier')
            return NextResponse.json({
                success: true,
                data: {
                    subscription: {
                        id: 'free',
                        userId: 'anonymous',
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
