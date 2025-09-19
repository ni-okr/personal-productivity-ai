import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'

// Схема валидации для email
const subscribeSchema = z.object({
    email: z.string().email('Некорректный email адрес'),
})

export async function POST(request: NextRequest) {
    try {
        console.log('🚀 API /subscribe вызван')

        // Проверяем переменные окружения
        console.log('🔧 Переменные окружения:', {
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
            supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET'
        })

        const body = await request.json()
        console.log('📝 Получен body:', body)

        // Валидация входных данных
        const result = subscribeSchema.safeParse(body)

        if (!result.success) {
            console.log('❌ Валидация не прошла:', result.error.errors)
            return NextResponse.json(
                {
                    success: false,
                    error: 'Некорректный email адрес',
                    details: result.error.errors
                },
                { status: 400 }
            )
        }

        const { email } = result.data
        console.log('✅ Email валиден:', email)

        // Проверяем наличие переменных окружения Supabase
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.log('⚠️ Переменные окружения Supabase не настроены, возвращаем заглушку')
            return NextResponse.json({
                success: true,
                message: 'Спасибо за подписку!',
                data: { email, subscribedAt: new Date().toISOString() }
            })
        }

        console.log('📡 Создание подписчика через Supabase')
        const { data, error } = await supabase.from('subscribers').insert({ email })
        if (error) throw error
        console.log('📡 Подписчик создан:', data)

        return NextResponse.json({ success: true, subscription: data })

    } catch (error: any) {
        console.error('Ошибка при подписке:', error)

        // Более детальная информация об ошибке
        const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка'
        console.error('Детали ошибки:', {
            message: errorMessage,
            stack: error instanceof Error ? error.stack : 'No stack trace',
            type: typeof error,
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
            supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET'
        })

        // Проверяем, если это ошибка дублирования email
        if (errorMessage.includes('уже подписан') || errorMessage.includes('duplicate key') || errorMessage.includes('23505')) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Этот email уже подписан на уведомления. Спасибо за интерес к проекту!'
                },
                { status: 200 } // Меняем на 200, чтобы фронтенд обработал как обычный ответ
            )
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Произошла ошибка при подписке. Попробуйте позже.',
                details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
                debug: process.env.NODE_ENV === 'development' ? {
                    supabaseConfigured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
                } : undefined
            },
            { status: 500 }
        )
    }
}

// Обработка GET запросов (для тестирования)
export async function GET() {
    return NextResponse.json({
        message: 'API подписки работает',
        endpoint: '/api/subscribe',
        method: 'POST',
        required_fields: ['email']
    })
}
