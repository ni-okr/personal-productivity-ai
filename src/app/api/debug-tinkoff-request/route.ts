// 🔍 Debug endpoint для проверки Тинькофф запроса
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { amount, description, planId } = await request.json()
        
        // Создаем тестовый запрос как в реальном API
        const orderId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const amountInRubles = amount > 1000 ? amount / 100 : amount
        
        const requestData = {
            TerminalKey: process.env.TINKOFF_TERMINAL_KEY || 'TestTerminalKey',
            Amount: amountInRubles * 100, // Конвертируем в копейки
            OrderId: orderId,
            Description: description,
            CustomerKey: 'test_customer',
            PayType: 'T',
            Language: 'ru',
            Email: 'test@taskai.space',
            NotificationURL: 'https://taskai.space/api/tinkoff/webhook',
            SuccessURL: 'https://taskai.space/planner?payment=success',
            FailURL: 'https://taskai.space/planner?payment=failed',
            Receipt: {
                Email: 'test@taskai.space',
                EmailCompany: 'support@taskai.space',
                Taxation: 'usn_income',
                Items: [{
                    Name: description,
                    Price: amountInRubles * 100,
                    Quantity: 1,
                    Amount: amountInRubles * 100,
                    Tax: 'vat20'
                }]
            }
        }
        
        return NextResponse.json({
            success: true,
            debug: {
                originalAmount: amount,
                convertedAmount: amountInRubles,
                finalAmountInKopecks: amountInRubles * 100,
                hasEmail: !!requestData.Email,
                emailValue: requestData.Email,
                hasReceiptEmail: !!requestData.Receipt?.Email,
                terminalKey: requestData.TerminalKey,
                requestData: requestData
            }
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
