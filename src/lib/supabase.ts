import { createClient } from '@supabase/supabase-js'

// Ленивая инициализация Supabase клиента
let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
    if (!supabaseClient) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
        }

        supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
    }

    return supabaseClient
}

// Для обратной совместимости
export const supabase = getSupabaseClient()

export interface Subscriber {
    id?: string
    email: string
    source?: string
    subscribed_at?: string
    is_active?: boolean
    created_at?: string
    updated_at?: string
}

/**
 * Добавляет нового подписчика в базу данных
 */
export async function addSubscriber(email: string): Promise<{ success: boolean; message: string; data?: Subscriber }> {
    try {
        const supabase = getSupabaseClient()

        // Проверяем, существует ли уже такой email
        const { data: existingSubscriber, error: checkError } = await supabase
            .from('subscriptions')
            .select('email')
            .eq('email', email)
            .single()

        if (checkError && checkError.code !== 'PGRST116') {
            // PGRST116 = "The result contains 0 rows" - это нормально, значит email не найден
            throw checkError
        }

        if (existingSubscriber) {
            console.log('📧 Email уже существует:', email)
            return {
                success: false,
                message: 'Этот email уже подписан на уведомления'
            }
        }

        // Добавляем нового подписчика
        const { data, error } = await supabase
            .from('subscriptions')
            .insert([{ email, source: 'landing_page', is_active: true }])
            .select()
            .single()

        if (error) {
            console.error('🚨 Ошибка при вставке:', error)

            // Проверяем если это ошибка дублирования
            if (error.code === '23505' || error.message?.includes('duplicate key')) {
                return {
                    success: false,
                    message: 'Этот email уже подписан на уведомления'
                }
            }

            throw error
        }

        return {
            success: true,
            message: 'Спасибо за подписку! Мы уведомим вас о релизе.',
            data
        }
    } catch (error: any) {
        console.error('Ошибка при добавлении подписчика:', error)
        console.error('Детали Supabase ошибки:', {
            error,
            type: typeof error,
            code: error?.code,
            message: error?.message,
            details: error?.details
        })
        return {
            success: false,
            message: 'Произошла ошибка. Попробуйте позже.'
        }
    }
}

/**
 * Получает всех активных подписчиков
 */
export async function getActiveSubscribers(): Promise<Subscriber[]> {
    try {
        const supabase = getSupabaseClient()

        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })

        if (error) {
            throw error
        }

        return data || []
    } catch (error: any) {
        console.error('Ошибка при получении подписчиков:', error)
        return []
    }
}

/**
 * Деактивирует подписчика (отписка)
 */
export async function unsubscribe(email: string): Promise<{ success: boolean; message: string }> {
    try {
        const supabase = getSupabaseClient()

        const { error } = await supabase
            .from('subscriptions')
            .update({ is_active: false })
            .eq('email', email)

        if (error) {
            throw error
        }

        return {
            success: true,
            message: 'Вы успешно отписались от уведомлений'
        }
    } catch (error: any) {
        console.error('Ошибка при отписке:', error)
        return {
            success: false,
            message: 'Произошла ошибка при отписке'
        }
    }
}