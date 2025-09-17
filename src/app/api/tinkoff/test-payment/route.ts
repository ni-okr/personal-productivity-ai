// 🧪 API endpoint для тестирования платежей Тинькофф

import { createTestTinkoffPayment, TEST_CARD_DATA } from '@/lib/tinkoff-api'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { amount, description, planId } = await request.json()

        // Валидация
        if (!amount || !description || !planId) {
            return NextResponse.json(
                { success: false, error: 'Необходимы параметры: amount, description, planId' },
                { status: 400 }
            )
        }

        // Создаем уникальный ID заказа
        const orderId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        console.log('🧪 Создание тестового платежа', {
            amount,
            description,
            planId,
            orderId,
            hasTerminalKey: !!process.env.TINKOFF_TERMINAL_KEY,
            hasSecretKey: !!process.env.TINKOFF_SECRET_KEY
        })

        // Проверяем есть ли ключи Тинькофф
        const hasTinkoffKeys = process.env.TINKOFF_TERMINAL_KEY && process.env.TINKOFF_SECRET_KEY

        if (!hasTinkoffKeys) {
            // Mock режим - возвращаем тестовые данные
            console.log('🧪 Mock режим - ключи Тинькофф не настроены')

            return NextResponse.json({
                success: true,
                data: {
                    paymentId: `mock_${orderId}`,
                    paymentUrl: `https://personal-productivity-ai.vercel.app/planner?payment=success&orderId=${orderId}`,
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
                    setupRequired: true,
                    setupMessage: 'Для реальных платежей настройте TINKOFF_TERMINAL_KEY и TINKOFF_SECRET_KEY в Vercel'
                }
            })
        }

        // Реальный режим - используем Тинькофф API
        console.log('💳 Реальный режим - используем Тинькофф API')
        const paymentResponse = await createTestTinkoffPayment(amount, description, orderId)

        if (!paymentResponse.Success) {
            console.error('Ошибка Тинькофф API:', {
                ErrorCode: paymentResponse.ErrorCode,
                Message: paymentResponse.Message,
                Details: paymentResponse.Details
            })
            
            return NextResponse.json(
                {
                    success: false,
                    error: paymentResponse.Message || 'Ошибка создания платежа',
                    errorCode: paymentResponse.ErrorCode,
                    details: paymentResponse.Details
                },
                { status: 400 }
            )
        }

        console.log('✅ Платеж успешно создан через Тинькофф API:', {
            PaymentId: paymentResponse.PaymentId,
            OrderId: paymentResponse.OrderId,
            Amount: paymentResponse.Amount
        })

        return NextResponse.json({
            success: true,
            data: {
                paymentId: paymentResponse.PaymentId,
                paymentUrl: paymentResponse.PaymentURL,
                orderId: orderId,
                amount: amount,
                description: description,
                testCardData: TEST_CARD_DATA,
                instructions: {
                    step1: 'Перейдите по ссылке для оплаты',
                    step2: `Используйте тестовую карту: ${TEST_CARD_DATA.number}`,
                    step3: `Срок действия: ${TEST_CARD_DATA.expiry}, CVV: ${TEST_CARD_DATA.cvv}`,
                    step4: 'Ожидайте статус "Оплачено"'
                },
                mockMode: false,
                setupRequired: false
            }
        })

    } catch (error: any) {
        console.error('Ошибка создания тестового платежа:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Внутренняя ошибка сервера' },
            { status: 500 }
        )
    }
}
