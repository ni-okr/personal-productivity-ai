// 🔌 Клиент Supabase
import { createClient } from '@supabase/supabase-js'

// Создаём клиент с использованием переменных окружения
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
)

export function getSupabaseClient() {
    return supabase
}

export interface SubscriberRecord {
    id: string
    email: string
    created_at: string
    is_active: boolean
}

export async function addSubscriber(email: string): Promise<{ success: boolean; message: string; data?: SubscriberRecord }> {
    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
        return { success: false, message: 'Некорректный email' }
    }
    const { data, error } = await supabase
        .from('subscribers')
        .insert({ email })
        .select()
        .single()
    if (error) {
        // Дублирование email
        return { success: false, message: 'Email уже подписан' }
    }
    return { success: true, message: 'Спасибо за подписку', data }
}

export async function getActiveSubscribers(): Promise<SubscriberRecord[]> {
    const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('is_active', true)
    if (error || !data) return []
    return data
}

export async function unsubscribe(email: string): Promise<{ success: boolean; message: string }> {
    const { data, error } = await supabase
        .from('subscribers')
        .update({ is_active: false })
        .match({ email })
        .select()
        .single()
    if (error) {
        return { success: false, message: 'Не удалось отписаться' }
    }
    return { success: true, message: 'Вы успешно отписались' }
}
