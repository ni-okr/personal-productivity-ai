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

// Временные типы
export interface Subscriber {
  id: string
  email: string
  source: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Временные заглушки для функций
export async function addSubscriber(email: string): Promise<{ success: boolean; message: string; data?: Subscriber }> {
  try {
    // Временная заглушка
    console.log('✅ Подписчик добавлен (заглушка):', email)
    return {
      success: true,
      message: 'Спасибо за подписку! Мы уведомим вас о запуске.',
      data: {
        id: 'temp-' + Date.now(),
        email,
        source: 'landing_page',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
  } catch (error: any) {
    console.error('🚨 Критическая ошибка в addSubscriber:', error)
    return {
      success: false,
      message: 'Произошла ошибка. Попробуйте позже.'
    }
  }
}

export async function getActiveSubscribers(): Promise<Subscriber[]> {
  try {
    // Временная заглушка
    console.log('📊 Получение активных подписчиков (заглушка)')
    return []
  } catch (error) {
    console.error('🚨 Ошибка получения подписчиков:', error)
    return []
  }
}

export async function unsubscribe(email: string): Promise<{ success: boolean; message: string }> {
  try {
    // Временная заглушка
    console.log('📧 Отписка от рассылки (заглушка):', email)
    return {
      success: true,
      message: 'Вы успешно отписались от рассылки.'
    }
  } catch (error) {
    console.error('🚨 Ошибка отписки:', error)
    return {
      success: false,
      message: 'Произошла ошибка при отписке.'
    }
  }
}
