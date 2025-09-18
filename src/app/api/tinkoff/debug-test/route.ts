// 🧪 Debug endpoint для тестирования Тинькофф API
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { amount, description, planId } = await request.json()

        console.log('🧪 Debug тест Тинькофф API:', {
            amount,
            description,
            planId,
            terminalKey: process.env.TINKOFF_TERMINAL_KEY ? 'SET' : 'NOT_SET',
            secretKey: process.env.TINKOFF_SECRET_KEY ? 'SET' : 'NOT_SET'
        })

        // Простой тест API Тинькофф
        const testUrl = 'https://rest-api-test.tinkoff.ru/v2/Init'
        const testData = {
            TerminalKey: process.env.TINKOFF_TERMINAL_KEY,
            Amount: 100, // 1 рубль в копейках
            OrderId: `debug_${Date.now()}`,
            Description: 'Debug test payment',
            CustomerKey: 'debug_customer',
            PayType: 'O', // Обычный платеж для тестовой среды
            Language: 'ru',
            Email: 'debug@taskai.space',
            Phone: '+79001234567'
        }

        // Генерируем простой токен для теста
        const crypto = require('crypto')
        const tokenString = `${testData.TerminalKey}${testData.Amount}${testData.OrderId}${testData.Description}${process.env.TINKOFF_SECRET_KEY}`
        const token = crypto.createHash('sha256').update(tokenString, 'utf8').digest('hex')

        const payload = {
            ...testData,
            Token: token
        }

        console.log('🧪 Отправляем запрос в Тинькофф:', {
            url: testUrl,
            payload: { ...payload, Token: '***' }
        })

        const response = await fetch(testUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        })

        const responseText = await response.text()
        console.log('🧪 Ответ от Тинькофф:', responseText)

        let responseData
        try {
            responseData = JSON.parse(responseText)
        } catch (e) {
            responseData = { error: 'Invalid JSON response', text: responseText }
        }

        return NextResponse.json({
            success: true,
            debug: {
                request: payload,
                response: responseData,
                status: response.status,
                statusText: response.statusText
            }
        })

    } catch (error: any) {
        console.error('Ошибка debug теста:', error)
        return NextResponse.json(
            { 
                success: false, 
                error: error.message,
                debug: {
                    terminalKey: process.env.TINKOFF_TERMINAL_KEY ? 'SET' : 'NOT_SET',
                    secretKey: process.env.TINKOFF_SECRET_KEY ? 'SET' : 'NOT_SET'
                }
            },
            { status: 500 }
        )
    }
}