import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Отсутствуют переменные окружения для Supabase')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Типы для базы данных
export interface Subscription {
    id: string
    email: string
    subscribed_at: string
    source: string
    is_active: boolean
    created_at?: string
    updated_at?: string
}

// Функция для добавления подписчика
export async function addSubscriber(email: string, source: string = 'landing_page') {
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .insert([
                {
                    email,
                    source,
                    subscribed_at: new Date().toISOString(),
                    is_active: true
                }
            ])
            .select()
            .single()

        if (error) {
            // Проверяем на дублирование email
            if (error.code === '23505') {
                throw new Error('Этот email уже подписан на уведомления')
            }
            throw error
        }

        return data
    } catch (error) {
        console.error('Ошибка при добавлении подписчика:', error)
        throw error
    }
}

// Функция для получения всех подписчиков
export async function getSubscribers() {
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    } catch (error) {
        console.error('Ошибка при получении подписчиков:', error)
        throw error
    }
}

// Функция для отписки
export async function unsubscribe(email: string) {
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .eq('email', email)
            .select()

        if (error) throw error
        return data
    } catch (error) {
        console.error('Ошибка при отписке:', error)
        throw error
    }
}
