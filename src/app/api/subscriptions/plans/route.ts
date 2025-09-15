// 📋 API для получения планов подписок
import { getAllSubscriptionPlans } from '@/lib/subscriptions'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const result = await getAllSubscriptionPlans()

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
        console.error('Ошибка получения планов подписок:', error)
        return NextResponse.json(
            { success: false, error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        )
    }
}
