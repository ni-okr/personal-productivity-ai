// 🧪 API endpoint для тестирования платежей Тинькофф

import { NextRequest, NextResponse } from 'next/server'
import { createTestTinkoffPayment, TEST_CARD_DATA } from '@/lib/tinkoff-api'

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
      orderId
    })

    // Создаем тестовый платеж
    const paymentResponse = await createTestTinkoffPayment(amount, description, orderId)

    if (!paymentResponse.Success) {
      return NextResponse.json(
        { 
          success: false, 
          error: paymentResponse.Message || 'Ошибка создания платежа',
          errorCode: paymentResponse.ErrorCode
        },
        { status: 400 }
      )
    }

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
        }
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
