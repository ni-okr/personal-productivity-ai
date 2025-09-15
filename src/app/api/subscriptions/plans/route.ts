// 📋 API для получения планов подписок
import { getSubscriptionPlans } from '@/lib/subscriptions'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const plans = getSubscriptionPlans()

        return NextResponse.json({
            success: true,
            data: plans
        })
    } catch (error: any) {
        console.error('Ошибка получения планов подписок:', error)
        return NextResponse.json(
            { success: false, error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        )
    }
}
