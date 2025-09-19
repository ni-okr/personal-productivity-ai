// 💳 API endpoint для живой оплаты через Тинькофф (продакшн)

import { createLiveTinkoffPayment } from '@/lib/tinkoff-api'
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
        const orderId = `live_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        console.log('💳 Создание живой оплаты', {
            amount,
            description,
            planId,
            orderId,
            hasTerminalKey: !!process.env.TINKOFF_TERMINAL_KEY,
            hasSecretKey: !!process.env.TINKOFF_SECRET_KEY
        })

        // Проверяем наличие ключей Тинькофф
        const hasTinkoffKeys = process.env.TINKOFF_TERMINAL_KEY && process.env.TINKOFF_SECRET_KEY

        if (!hasTinkoffKeys) {
            console.error('❌ Ключи Тинькофф не настроены для живой оплаты')
            return NextResponse.json(
                {
                    success: false,
                    error: 'Ключи Тинькофф не настроены',
                    setupRequired: true,
                    setupMessage: 'Обратитесь к администратору для настройки платежей'
                },
                { status: 400 }
            )
        }

        // Используем рабочие ключи (поддержка *_LIVE из Vercel)
        const terminalKey = process.env.TINKOFF_TERMINAL_KEY || process.env.TINKOFF_TERMINAL_KEY_LIVE || ''
        const secretKey = process.env.TINKOFF_SECRET_KEY || process.env.TINKOFF_SECRET_KEY_LIVE || ''

        console.log('💳 Используем живой API Тинькофф с ключами:', {
            terminalKey: terminalKey,
            secretKey: secretKey ? 'SET' : 'NOT_SET'
        })

        // Конвертируем amount в рубли (если передано в копейках)
        const amountInRubles = amount > 1000 ? amount / 100 : amount
        console.log('💳 Конвертация amount:', { original: amount, converted: amountInRubles })

        // Создаем живой платеж (НЕ тестовый)
        const paymentResponse = await createLiveTinkoffPayment(amountInRubles, description, orderId, terminalKey, secretKey)

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

        console.log('✅ Живой платеж успешно создан через Тинькофф API:', {
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
                paymentType: 'live',
                instructions: {
                    step1: 'Перейдите по ссылке для оплаты',
                    step2: 'Введите данные вашей банковской карты',
                    step3: 'Подтвердите платеж в вашем банке',
                    step4: 'Ожидайте подтверждения оплаты'
                },
                setupRequired: false
            }
        })

    } catch (error: any) {
        console.error('Ошибка создания живой оплаты:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Внутренняя ошибка сервера' },
            { status: 500 }
        )
    }
}
