// 🏠 API для Stripe Customer Portal
import { getCurrentUser } from '@/lib/auth'
import { createPortalSession } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        // Проверяем авторизацию
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Необходима авторизация' },
                { status: 401 }
            )
        }

        const { returnUrl } = await request.json()

        // Создаем portal сессию
        const result = await createPortalSession({
            userId: user.id,
            returnUrl: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/planner`
        })

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            data: result.data
        })
    } catch (error: any) {
        console.error('Ошибка создания portal сессии:', error)
        return NextResponse.json(
            { success: false, error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        )
    }
}
