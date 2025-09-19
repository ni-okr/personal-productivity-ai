// 🔍 Debug endpoint для проверки ключей Тинькофф
import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json({
        success: true,
        tinkoffKeys: {
            terminalKey: (process.env.TINKOFF_TERMINAL_KEY || process.env.TINKOFF_TERMINAL_KEY_LIVE || process.env.TINKOFF_TERMINAL_KEY_TEST) ? 'SET' : 'NOT_SET',
            secretKey: (process.env.TINKOFF_SECRET_KEY || process.env.TINKOFF_SECRET_KEY_LIVE || process.env.TINKOFF_SECRET_KEY_TEST) ? 'SET' : 'NOT_SET',
            terminalKeyValue: process.env.TINKOFF_TERMINAL_KEY || process.env.TINKOFF_TERMINAL_KEY_LIVE || process.env.TINKOFF_TERMINAL_KEY_TEST,
            secretKeyValue: process.env.TINKOFF_SECRET_KEY || process.env.TINKOFF_SECRET_KEY_LIVE || process.env.TINKOFF_SECRET_KEY_TEST
        },
        timestamp: new Date().toISOString()
    })
}
