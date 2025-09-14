import { NextResponse } from 'next/server'

export async function GET() {
    try {
        return NextResponse.json({
            success: true,
            message: 'API работает - принудительное обновление!',
            environment: {
                nodeEnv: process.env.NODE_ENV,
                supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
                supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET'
            },
            timestamp: new Date().toISOString(),
            buildTime: 'Force deploy at 22:17 MSK',
            commitHash: '751efa1+'
        })
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}

export async function POST() {
    return NextResponse.json({
        success: true,
        message: 'POST метод работает'
    })
}
