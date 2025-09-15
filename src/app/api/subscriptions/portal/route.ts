// 🏠 API для Тинькофф Customer Portal (заглушка)
import { getCurrentUser } from '@/lib/auth'
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

        // Заглушка для Тинькофф Customer Portal
        // В реальной интеграции здесь будет вызов Тинькофф API
        console.log('🔄 Тинькофф Customer Portal (заглушка):', {
            userId: user.id,
            returnUrl: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/planner`
        })

        // Имитация задержки API
        await new Promise(resolve => setTimeout(resolve, 100))

        return NextResponse.json({
            success: true,
            data: {
                url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/planner`,
                message: 'Customer Portal (заглушка)'
            }
        })
    } catch (error: any) {
        console.error('Ошибка создания portal сессии:', error)
        return NextResponse.json(
            { success: false, error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        )
    }
}
