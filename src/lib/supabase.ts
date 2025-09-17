import type { Database, SubscriberInsert } from '@/types/supabase'
import { createClient } from '@supabase/supabase-js'

// Ленивая инициализация Supabase клиента
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
    }

    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey)
  }

  return supabaseClient
}

// Экспортируем клиент для удобства
export const supabase = getSupabaseClient()

// Функции для работы с подписчиками
export async function addSubscriber(email: string): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const supabase = getSupabaseClient()

    const subscriberData: SubscriberInsert = {
      email,
      source: 'landing_page',
      is_active: true
    }

    const { data, error } = await (supabase as any)
      .from('subscribers')
      .insert(subscriberData)
      .select()
      .single()

    if (error) {
      console.error('🚨 Ошибка добавления подписчика:', error)

      // Handle duplicate key error
      if (error.code === '23505') {
        return {
          success: false,
          message: 'Этот email уже подписан на рассылку'
        }
      }

      return {
        success: false,
        message: 'Ошибка при добавлении подписчика'
      }
    }

    return {
      success: true,
      message: 'Спасибо за подписку! Мы уведомим вас о запуске.',
      data: data
    }
  } catch (error: any) {
    console.error('🚨 Критическая ошибка в addSubscriber:', error)
    return {
      success: false,
      message: 'Произошла ошибка. Попробуйте позже.'
    }
  }
}

export async function getActiveSubscribers(): Promise<any[]> {
  try {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('subscribers')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('🚨 Ошибка получения подписчиков:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('🚨 Ошибка получения подписчиков:', error)
    return []
  }
}

export async function unsubscribe(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = getSupabaseClient()

    const { data, error } = await (supabase as any)
      .from('subscribers')
      .update({ is_active: false })
      .eq('email', email)
      .select()

    if (error) {
      console.error('🚨 Ошибка отписки:', error)
      return {
        success: false,
        message: 'Произошла ошибка при отписке.'
      }
    }

    // Проверяем, что была обновлена хотя бы одна запись
    if (!data || data.length === 0) {
      return {
        success: false,
        message: 'Подписчик с таким email не найден.'
      }
    }

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
