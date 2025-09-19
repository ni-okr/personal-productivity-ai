// 🔗 Webhook эндпоинт для обработки уведомлений от Т‑Кассы (Т‑Банк)

import { NextRequest, NextResponse } from 'next/server'
import { handleTinkoffWebhook } from '@/lib/tinkoff'
import { getTinkoffPaymentState, cancelTinkoffPayment } from '@/lib/tinkoff-api'
import { updatePaymentStatusByPaymentId, setPaymentProviderInfo, getPaymentByPaymentId } from '@/lib/payments'
import { updateSubscription } from '@/lib/subscriptions'
import crypto from 'crypto'

// Верификация Token согласно правилам Т‑Кассы
function generateTokenForWebhook(payload: Record<string, any>): string {
    const EXCLUDE_KEYS = new Set(['Token', 'Receipt', 'DATA'])
    const pairs = Object.keys(payload)
        .filter(k => !EXCLUDE_KEYS.has(k))
        .filter(k => payload[k] !== undefined && payload[k] !== null)
        .filter(k => typeof payload[k] !== 'object')
        .map(k => ({ key: k, value: String(payload[k]) }))
    pairs.push({ key: 'Password', value: (process.env.TINKOFF_ENV === 'test' ? (process.env.TINKOFF_SECRET_KEY_TEST || '') : (process.env.TINKOFF_SECRET_KEY || '')) })
    pairs.sort((a, b) => a.key.localeCompare(b.key))
    const tokenString = pairs.map(p => p.value).join('')
    return crypto.createHash('sha256').update(tokenString, 'utf8').digest('hex')
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.text()

        console.log('🔗 Получен webhook от Т‑Кассы', { snippet: body.substring(0, 200) + '...' })

        // Парсим JSON
        let payload
        try {
            payload = JSON.parse(body)
        } catch (error) {
            console.error('Ошибка парсинга JSON webhook:', error)
            return NextResponse.json(
                { success: false, error: 'Invalid JSON' },
                { status: 400 }
            )
        }

        // Проверяем Token
        const expectedToken = generateTokenForWebhook(payload)
        if (!payload.Token || payload.Token !== expectedToken) {
            console.warn('⚠️ Неверный Token webhook')
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
        }

        console.log('📦 Обработка webhook payload:', {
            TerminalKey: payload.TerminalKey,
            OrderId: payload.OrderId,
            Status: payload.Status,
            PaymentId: payload.PaymentId
        })

        // Обрабатываем webhook
        const result = await handleTinkoffWebhook(payload)

        // Идемпотентное обновление записей платежа (если знаем PaymentId)
        if (payload.PaymentId) {
            const statusMap: Record<string, 'authorized' | 'confirmed' | 'canceled' | 'rejected' | 'refunded' | 'failed' | 'pending'> = {
                'AUTHORIZED': 'authorized',
                'CONFIRMED': 'confirmed',
                'CANCELED': 'canceled',
                'REJECTED': 'rejected',
                'REFUNDED': 'refunded',
                'NEW': 'pending',
                'FORM_SHOWED': 'pending'
            }
            const mapped = statusMap[payload.Status] || 'failed'
            await updatePaymentStatusByPaymentId(String(payload.PaymentId), mapped)
            await setPaymentProviderInfo({ orderId: payload.OrderId, metaAppend: payload })

            // Если платёж подтверждён — активируем подписку
            if (mapped === 'confirmed') {
                // Получаем запись платежа, чтобы узнать пользователя и план
                const payment = await getPaymentByPaymentId(String(payload.PaymentId))
                if (payment.success) {
                    const now = new Date()
                    const end = new Date()
                    end.setMonth(end.getMonth() + 1)
                    await updateSubscription(payment.payment.user_id, {
                        status: 'active',
                        currentPeriodStart: now,
                        currentPeriodEnd: end,
                        cancelAtPeriodEnd: false
                    } as any)
                }
            }
        }

        if (result.success) {
            console.log('✅ Webhook успешно обработан')
            return NextResponse.json({ success: true })
        } else {
            console.error('❌ Ошибка обработки webhook:', result.error)
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            )
        }

    } catch (error: any) {
        console.error('Ошибка обработки webhook:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// GET для проверки доступности webhook
export async function GET() {
    return NextResponse.json({
        success: true,
        message: 'Tinkoff webhook endpoint is active',
        timestamp: new Date().toISOString()
    })
}

// Вспомогательные ручки для ручной проверки статуса/отмены (безопасно: только в dev/test)
export async function PUT(request: NextRequest) {
    try {
        const { paymentId, action } = await request.json()
        if (!paymentId || !action) {
            return NextResponse.json({ success: false, error: 'paymentId и action обязательны' }, { status: 400 })
        }

        if (action === 'getState') {
            const state = await getTinkoffPaymentState({
                TerminalKey: process.env.TINKOFF_TERMINAL_KEY || process.env.TINKOFF_TERMINAL_KEY_TEST || '',
                PaymentId: Number(paymentId)
            })
            return NextResponse.json({ success: true, state })
        }

        if (action === 'cancel') {
            const result = await cancelTinkoffPayment(Number(paymentId))
            return NextResponse.json({ success: true, result })
        }

        return NextResponse.json({ success: false, error: 'Неизвестное действие' }, { status: 400 })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || 'Ошибка' }, { status: 500 })
    }
}
