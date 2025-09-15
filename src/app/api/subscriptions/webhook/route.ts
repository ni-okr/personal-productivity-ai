// 🔔 Stripe webhook для обработки событий подписок
import { handleStripeWebhook } from '@/lib/stripe'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const body = await request.text()
        const signature = headers().get('stripe-signature')

        if (!signature) {
            console.error('Отсутствует Stripe signature')
            return NextResponse.json(
                { error: 'Отсутствует signature' },
                { status: 400 }
            )
        }

        // Обрабатываем webhook
        const result = await handleStripeWebhook(body, signature)

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
