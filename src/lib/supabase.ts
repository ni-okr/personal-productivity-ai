import type { Database, SubscriberInsert, SubscriberUpdate } from '@/types/supabase'
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
    const supabase = getSupabaseClient()

    const subscriberData: SubscriberInsert = {
      email,
      source: 'landing_page',
      is_active: true
    }

    const { data, error } = await supabase
      .from('subscribers')
      .insert(subscriberData)
      .select()
      .single()

    if (error) {
      console.error('🚨 Ошибка добавления подписчика:', error)
      return {
        success: false,
        message: 'Ошибка при добавлении подписчика'
      }
    }

    return {
      success: true,
      message: 'Спасибо за подписку! Мы уведомим вас о запуске.',
      data: {
        id: data.id,
        email: data.email,
        source: data.source,
        is_active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at
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

    const updateData: SubscriberUpdate = {
      is_active: false
    }

    const { error } = await supabase
      .from('subscribers')
      .update(updateData)
      .eq('email', email)

    if (error) {
      console.error('🚨 Ошибка отписки:', error)
      return {
        success: false,
        message: 'Произошла ошибка при отписке.'
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
