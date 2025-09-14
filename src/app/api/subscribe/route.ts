import { addSubscriber } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Схема валидации для email
const subscribeSchema = z.object({
    email: z.string().email('Некорректный email адрес'),
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Валидация входных данных
        const result = subscribeSchema.safeParse(body)

        if (!result.success) {
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

        // Сохраняем подписчика в Supabase
        const subscription = await addSubscriber(email)

        if (!subscription.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: subscription.message
                },
                { status: 200 } // Возвращаем 200 для дубликатов
            )
        }

        return NextResponse.json({
            success: true,
            message: subscription.message,
            data: subscription.data
        })

    } catch (error) {
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
