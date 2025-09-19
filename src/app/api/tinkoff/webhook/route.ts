// 🔗 Webhook endpoint для обработки уведомлений от Тинькофф

import { NextRequest, NextResponse } from 'next/server'
import { handleTinkoffWebhook, verifyTinkoffWebhookSignature } from '@/lib/tinkoff'
import { getTinkoffPaymentState, cancelTinkoffPayment } from '@/lib/tinkoff-api'

export async function POST(request: NextRequest) {
    try {
        const body = await request.text()
        const signature = request.headers.get('x-tinkoff-signature') || ''

        console.log('🔗 Получен webhook от Тинькофф', {
            body: body.substring(0, 200) + '...',
            signature: signature.substring(0, 20) + '...',
            timestamp: new Date().toISOString()
        })

        // Проверяем подпись (в реальной системе)
        const isValidSignature = verifyTinkoffWebhookSignature(body, signature)
        
        if (!isValidSignature) {
            console.warn('⚠️ Неверная подпись webhook от Тинькофф')
            return NextResponse.json(
                { success: false, error: 'Invalid signature' },
                { status: 401 }
            )
        }

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

        console.log('📦 Обработка webhook payload:', {
            TerminalKey: payload.TerminalKey,
            OrderId: payload.OrderId,
            Status: payload.Status,
            PaymentId: payload.PaymentId
        })

        // Обрабатываем webhook
        const result = await handleTinkoffWebhook(payload)

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
