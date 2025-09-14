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
        const subscription = await addSubscriber(email, 'landing_page')

        return NextResponse.json({
            success: true,
            message: 'Спасибо за подписку! Мы уведомим вас о релизе.',
            data: subscription
        })

    } catch (error) {
        console.error('Ошибка при подписке:', error)

        // Более детальная информация об ошибке
        const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка'
        console.error('Детали ошибки:', {
            message: errorMessage,
            stack: error instanceof Error ? error.stack : 'No stack trace',
            type: typeof error
        })

        // Проверяем, если это ошибка дублирования email
        if (errorMessage.includes('уже подписан')) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Этот email уже подписан на уведомления. Спасибо за интерес к проекту!'
                },
                { status: 400 }
            )
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Произошла ошибка при подписке. Попробуйте позже.',
                details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
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
