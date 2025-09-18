// 🔍 Debug endpoint для проверки переменных окружения
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        const envVars = {
            // Тинькофф переменные (основные - теперь рабочие)
            TINKOFF_TERMINAL_KEY: process.env.TINKOFF_TERMINAL_KEY ? 'SET' : 'NOT_SET',
            TINKOFF_SECRET_KEY: process.env.TINKOFF_SECRET_KEY ? 'SET' : 'NOT_SET',

            // Дополнительные переменные (если есть)
            TINKOFF_TERMINAL_KEY_TEST: process.env.TINKOFF_TERMINAL_KEY_TEST ? 'SET' : 'NOT_SET',
            TINKOFF_SECRET_KEY_TEST: process.env.TINKOFF_SECRET_KEY_TEST ? 'SET' : 'NOT_SET',
            TINKOFF_TERMINAL_KEY_LIVE: process.env.TINKOFF_TERMINAL_KEY_LIVE ? 'SET' : 'NOT_SET',
            TINKOFF_SECRET_KEY_LIVE: process.env.TINKOFF_SECRET_KEY_LIVE ? 'SET' : 'NOT_SET',

            // Значения (первые 4 символа для безопасности)
            TINKOFF_TERMINAL_KEY_VALUE: process.env.TINKOFF_TERMINAL_KEY?.substring(0, 4) || 'NULL',
            TINKOFF_TERMINAL_KEY_TEST_VALUE: process.env.TINKOFF_TERMINAL_KEY_TEST?.substring(0, 4) || 'NULL',
            TINKOFF_TERMINAL_KEY_LIVE_VALUE: process.env.TINKOFF_TERMINAL_KEY_LIVE?.substring(0, 4) || 'NULL',

            // Supabase переменные
            NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT_SET',
            NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT_SET',
        }

        return NextResponse.json({
            success: true,
            environment: process.env.NODE_ENV,
            variables: envVars,
            timestamp: new Date().toISOString()
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}