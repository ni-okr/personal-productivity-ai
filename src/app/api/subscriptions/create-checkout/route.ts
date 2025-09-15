// 💳 API для создания Тинькофф checkout сессии
import { getCurrentUser } from '@/lib/auth'
import { createPaymentSession, getTinkoffPriceId } from '@/lib/tinkoff'
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

        const { planId, paymentMethod = 'bank_transfer' } = await request.json()

        if (!planId) {
            return NextResponse.json(
                { success: false, error: 'План подписки не указан' },
                { status: 400 }
            )
        }

        // Получаем цену плана
        const priceInfo = getTinkoffPriceId(planId)
        if (!priceInfo) {
            return NextResponse.json(
                { success: false, error: 'План подписки не найден' },
                { status: 400 }
            )
        }

        // Создаем checkout сессию
        const result = await createPaymentSession({
            userId: user.id,
            planId,
            amount: priceInfo.amount,
            currency: priceInfo.currency,
            description: `Подписка ${planId}`,
            paymentMethod: paymentMethod as 'bank_transfer' | 'qr_code' | 'sbp' | 'card'
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
