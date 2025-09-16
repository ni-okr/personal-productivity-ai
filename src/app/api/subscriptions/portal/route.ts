// 🏠 API для Тинькофф Customer Portal (заглушка)
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        // Проверяем переменные окружения
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.log('⚠️ Переменные окружения Supabase не настроены, используем заглушку')
            
            const { returnUrl } = await request.json()
            
            // Заглушка для режима разработки
            return NextResponse.json({
                success: true,
                data: {
                    url: returnUrl || '/planner',
                    message: 'Customer Portal (заглушка - режим разработки)'
                }
            })
        }

        // Импортируем getCurrentUser только если есть переменные окружения
        const { getCurrentUser } = await import('@/lib/auth')
        
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
