import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { amount, description, planId } = await request.json()

        // Генерируем уникальный ID заказа
        const orderId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        console.log('🧪 Mock тестовый платеж:', { amount, description, planId, orderId })

        return NextResponse.json({
            success: true,
            data: {
                paymentId: `mock_${orderId}`,
                paymentUrl: `https://securepay.tinkoff.ru/new/mock_${orderId}`,
                orderId: orderId,
                amount: amount,
                description: description,
                testCardData: {
                    number: '4300 0000 0000 0777',
                    expiry: '12/30',
                    cvv: '111'
                },
                instructions: {
                    step1: 'Перейдите по ссылке для оплаты',
                    step2: 'Используйте тестовую карту: 4300 0000 0000 0777',
                    step3: 'Срок действия: 12/30, CVV: 111',
                    step4: 'Ожидайте статус "Оплачено"'
                },
                mockMode: true,
                setupRequired: false,
                setupMessage: 'Mock режим - тестовые платежи работают без реальных API ключей'
            }
        })
    } catch (error: any) {
        console.error('Ошибка создания mock платежа:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Внутренняя ошибка сервера' },
            { status: 500 }
        )
    }
}
