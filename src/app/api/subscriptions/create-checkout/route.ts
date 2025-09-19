// 💳 API для создания checkout сессии
import { createPaymentSession } from '@/lib/tinkoff'
import { NextRequest, NextResponse } from 'next/server'
import { getSubscriptionPlan } from '@/lib/subscriptions'
import { createPaymentRow, setPaymentProviderInfo } from '@/lib/payments'
import { createLiveTinkoffPayment, createTestTinkoffPayment } from '@/lib/tinkoff-api'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
    try {
        const { planId, paymentMethod = 'bank_transfer' } = await request.json()

        // Импортируем getCurrentUserFromRequest на сервере
        const { getCurrentUserFromRequest } = await import('@/lib/auth')

        // Проверяем авторизацию из заголовков запроса
        const user = await getCurrentUserFromRequest(request)
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Необходима авторизация' },
                { status: 401 }
            )
        }

        if (!planId) {
            return NextResponse.json(
                { success: false, error: 'План подписки не указан' },
                { status: 400 }
            )
        }

        const plan = getSubscriptionPlan(planId)
        if (!plan) {
            return NextResponse.json(
                { success: false, error: 'План подписки не найден' },
                { status: 400 }
            )
        }

        // Ветка для оплаты картой через Kassa API (Init → PaymentURL)
        if (paymentMethod === 'card') {
            // 1) Подготовка платежа в нашей БД
            const orderId = crypto.randomUUID()
            const createRow = await createPaymentRow({
                orderId,
                userId: user.id,
                planId,
                amountCents: plan.price,
                currency: 'RUB',
                meta: { plan }
            })
            if (!createRow.success) {
                return NextResponse.json({ success: false, error: createRow.error }, { status: 500 })
            }

            // 2) Вызов Init
            const amountRub = Math.round(plan.price) / 100
            const description = `Подписка ${planId}`

            const isTest = (process.env.TINKOFF_ENV || 'test') === 'test'
            const initResp = isTest
                ? await createTestTinkoffPayment(amountRub, description, orderId)
                : await createLiveTinkoffPayment(amountRub, description, orderId)

            if (!initResp.Success || !initResp.PaymentURL) {
                // Обновим статус платежа как failed
                await setPaymentProviderInfo({ orderId, status: 'failed', metaAppend: initResp as any })
                return NextResponse.json({ success: false, error: initResp.Message || 'Init failed' }, { status: 400 })
            }

            // 3) Сохраняем идентификаторы поставщика
            await setPaymentProviderInfo({
                orderId,
                paymentId: initResp.PaymentId ? String(initResp.PaymentId) : undefined,
                paymentUrl: initResp.PaymentURL,
                status: 'pending',
                metaAppend: initResp as any
            })

            return NextResponse.json({
                success: true,
                data: {
                    paymentUrl: initResp.PaymentURL,
                    orderId
                }
            })
        }

        // Для банковского перевода / QR / СБП — оставляем существующий флоу
        const result = await createPaymentSession({
            userId: user.id,
            planId,
            amount: Math.round(plan.price) / 100,
            currency: 'RUB',
            description: `Подписка ${planId}`,
            paymentMethod: paymentMethod as 'bank_transfer' | 'qr_code' | 'sbp' | 'card'
        })

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 400 }
            )
        }

        return NextResponse.json({ success: true, data: result.data })
    } catch (error: any) {
        console.error('Ошибка создания checkout сессии:', error)
        return NextResponse.json(
            { success: false, error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        )
    }
}
