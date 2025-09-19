// 🔌 Клиент Supabase
import { createClient } from '@supabase/supabase-js'

// Безопасная инициализация: если env не заданы (CI/Preview) — используем in-memory фолбэк
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : (null as any)

export function getSupabaseClient() {
    return supabase
}

export interface SubscriberRecord {
    id: string
    email: string
    created_at: string
    is_active: boolean
}

// В тестовой среде/без env/в mock используем in-memory fallback
const inTest = process.env.NODE_ENV === 'test'
const disableEmail = process.env.NEXT_PUBLIC_DISABLE_EMAIL === 'true'
const noEnv = !SUPABASE_URL || !SUPABASE_ANON_KEY

const memorySubscribers: Map<string, SubscriberRecord> | null = (inTest || disableEmail || noEnv) ? new Map() : null

export async function addSubscriber(email: string): Promise<{ success: boolean; message: string; data?: SubscriberRecord }> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
        return { success: false, message: 'Некорректный email' }
    }

    if (memorySubscribers) {
        if (memorySubscribers.has(email)) {
            return { success: false, message: 'Email уже подписан' }
        }
        const rec: SubscriberRecord = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            email,
            created_at: new Date().toISOString(),
            is_active: true
        }
        memorySubscribers.set(email, rec)
        return { success: true, message: 'Спасибо за подписку', data: rec }
    }

    const { data, error } = await supabase
        .from('subscribers')
        .insert({ email })
        .select()
        .single()
    if (error) {
        return { success: false, message: 'Email уже подписан' }
    }
    return { success: true, message: 'Спасибо за подписку', data }
}

export async function getActiveSubscribers(): Promise<SubscriberRecord[]> {
    if (memorySubscribers) {
        return Array.from(memorySubscribers.values()).filter(s => s.is_active)
    }
    const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('is_active', true)
    if (error || !data) return []
    return data
}

export async function unsubscribe(email: string): Promise<{ success: boolean; message: string }> {
    if (memorySubscribers) {
        const rec = memorySubscribers.get(email)
        if (!rec) return { success: false, message: 'Подписчик не найден' }
        memorySubscribers.set(email, { ...rec, is_active: false })
        return { success: true, message: 'Вы успешно отписались' }
    }
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

// Тестовые утилиты для изоляции in-memory подписчиков
export function resetSubscribers(): void {
    if (memorySubscribers) memorySubscribers.clear()
}
