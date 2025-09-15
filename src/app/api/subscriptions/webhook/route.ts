// 🔔 Тинькофф webhook для обработки событий подписок
import { handleTinkoffWebhook, verifyTinkoffWebhookSignature } from '@/lib/tinkoff'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const body = await request.text()
        const signature = headers().get('tinkoff-signature')

        if (!signature) {
            console.error('Отсутствует Тинькофф signature')
            return NextResponse.json(
                { error: 'Отсутствует signature' },
                { status: 400 }
            )
        }

        // Проверяем подпись webhook
        if (!verifyTinkoffWebhookSignature(body, signature)) {
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 400 }
            )
        }

        // Парсим событие
        const event = JSON.parse(body)

        // Обрабатываем webhook
        const result = await handleTinkoffWebhook(event)

        if (!result.success) {
            console.error('Ошибка обработки webhook:', result.error)
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            )
        }

        return NextResponse.json({ received: true })
    } catch (error: any) {
        console.error('Ошибка webhook:', error)
        return NextResponse.json(
            { error: 'Webhook error' },
            { status: 500 }
        )
    }
}
