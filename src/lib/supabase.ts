import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zpgkzvflmgxrlgkecscg.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwZ2t6dmZsbWd4cmxna2Vjc2NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NDM5MDcsImV4cCI6MjA3MzQxOTkwN30.usDTWCrgyMiGY1BDhy-FBy-YTSOhPNEuAm1lh1FMH5c'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
            throw error
        }

        return {
            success: true,
            message: 'Спасибо за подписку! Мы уведомим вас о релизе.',
            data
        }
    } catch (error) {
        console.error('Ошибка при добавлении подписчика:', error)
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
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })

        if (error) {
            throw error
        }

        return data || []
    } catch (error) {
        console.error('Ошибка при получении подписчиков:', error)
        return []
    }
}

/**
 * Деактивирует подписчика (отписка)
 */
export async function unsubscribe(email: string): Promise<{ success: boolean; message: string }> {
    try {
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
    } catch (error) {
        console.error('Ошибка при отписке:', error)
        return {
            success: false,
            message: 'Произошла ошибка при отписке'
        }
    }
}