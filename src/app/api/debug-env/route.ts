// 🔍 Debug endpoint для проверки переменных окружения
import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json({
        success: true,
        environment: {
            NODE_ENV: process.env.NODE_ENV,
            NEXT_PUBLIC_DISABLE_EMAIL: process.env.NEXT_PUBLIC_DISABLE_EMAIL,
            NEXT_PUBLIC_DEV_MODE: process.env.NEXT_PUBLIC_DEV_MODE,
            NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT_SET',
            NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT_SET',
            TINKOFF_TERMINAL_KEY: process.env.TINKOFF_TERMINAL_KEY ? 'SET' : 'NOT_SET',
            TINKOFF_SECRET_KEY: process.env.TINKOFF_SECRET_KEY ? 'SET' : 'NOT_SET',
        },
        timestamp: new Date().toISOString()
    })
}
