// 🔌 Клиент Supabase
import { createClient } from '@supabase/supabase-js'

// Создаём клиент с использованием переменных окружения
// Базовый браузерный клиент (сохранён для обратной совместимости)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
)

// Создание клиента для браузера (использует публичные ключи)
export function createBrowserSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  )
}

// Создание клиента для сервера. Позволяет переопределять ключи через параметры/ENV
export function createServerSupabaseClient(options?: {
  url?: string
  anonKey?: string
  serviceRoleKey?: string
}) {
  const url = options?.url || (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)
  const key = options?.serviceRoleKey || options?.anonKey || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return createClient(url as string, key as string)
}

// Совместимая функция-обёртка: возвращает базовый клиент (браузерный)
export function getSupabaseClient() {
    return supabase
}

export interface SubscriberRecord {
    id: string
    email: string
    created_at: string
    is_active: boolean
}

// В тестовой среде и в режиме mock используем in-memory fallback
const inTest = process.env.NODE_ENV === 'test'
const disableEmail = process.env.NEXT_PUBLIC_DISABLE_EMAIL === 'true'

const memorySubscribers: Map<string, SubscriberRecord> | null = (inTest || disableEmail) ? new Map() : null

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
