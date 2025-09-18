// 🔍 Debug endpoint для проверки ключей Тинькофф
import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json({
        success: true,
        tinkoffKeys: {
            terminalKey: process.env.TINKOFF_TERMINAL_KEY ? 'SET' : 'NOT_SET',
            secretKey: process.env.TINKOFF_SECRET_KEY ? 'SET' : 'NOT_SET',
            terminalKeyValue: process.env.TINKOFF_TERMINAL_KEY,
            secretKeyValue: process.env.TINKOFF_SECRET_KEY
        },
        timestamp: new Date().toISOString()
    })
}
