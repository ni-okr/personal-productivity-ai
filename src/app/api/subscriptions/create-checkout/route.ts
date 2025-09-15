// 💳 API для создания Stripe checkout сессии
import { getCurrentUser } from '@/lib/auth'
import { createCheckoutSession } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        // Проверяем авторизацию
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Необходима авторизация' },
                { status: 401 }
            )
        }

        const { planId, successUrl, cancelUrl, trialDays } = await request.json()

        if (!planId) {
            return NextResponse.json(
                { success: false, error: 'План подписки не указан' },
                { status: 400 }
            )
        }

        // Создаем checkout сессию
        const result = await createCheckoutSession({
            userId: user.id,
            planId,
            successUrl: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/planner?success=true`,
            cancelUrl: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/planner?canceled=true`,
            trialDays: trialDays || 0
        })

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            data: result.data
        })
    } catch (error: any) {
        console.error('Ошибка создания checkout сессии:', error)
        return NextResponse.json(
            { success: false, error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        )
    }
}
