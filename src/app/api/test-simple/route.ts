// 🧪 Простой тестовый endpoint
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { amount, description, planId } = await request.json()

        return NextResponse.json({
            success: true,
            message: 'Тестовый endpoint работает!',
            data: {
                amount,
                description,
                planId,
                terminalKey: process.env.TINKOFF_TERMINAL_KEY ? 'SET' : 'NOT_SET',
                secretKey: process.env.TINKOFF_SECRET_KEY ? 'SET' : 'NOT_SET',
                timestamp: new Date().toISOString()
            }
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}