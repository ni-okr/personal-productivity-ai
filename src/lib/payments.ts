// 💳 Слой данных для платежей (Supabase)
import { createBrowserSupabaseClient, createServerSupabaseClient, supabase as browserSupabase } from '@/lib/supabase'

export type PaymentStatus = 'pending' | 'authorized' | 'confirmed' | 'canceled' | 'rejected' | 'refunded' | 'failed'

export interface PaymentRecord {
  id: string
  order_id: string
  user_id: string
  plan_id: string
  amount_cents: number
  currency: string
  status: PaymentStatus
  payment_id?: string | null
  payment_url?: string | null
  meta?: Record<string, any>
  created_at: string
  updated_at: string
}

function getServerClientPreferServiceRole() {
  // Предпочитаем серверный клиент с service role (если доступен), иначе анонимный
  const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY
  if (hasServiceRole) {
    return createServerSupabaseClient({
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    })
  }
  // Запасной вариант (RLS должен разрешать операции текущему пользователю)
  return browserSupabase
}

export async function createPaymentRow(params: {
  orderId: string
  userId: string
  planId: string
  amountCents: number
  currency?: string
  meta?: Record<string, any>
}): Promise<{ success: true; id: string } | { success: false; error: string }> {
  try {
    const client = getServerClientPreferServiceRole()
    const { data, error } = await (client as any)
      .from('payments')
      .insert({
        order_id: params.orderId,
        user_id: params.userId,
        plan_id: params.planId,
        amount_cents: params.amountCents,
        currency: (params.currency || 'RUB').toUpperCase(),
        status: 'pending',
        meta: params.meta || {},
      })
      .select('id')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true, id: (data as any).id }
  } catch (err: any) {
    return { success: false, error: err.message || 'Не удалось создать запись платежа' }
  }
}

export async function setPaymentProviderInfo(params: {
  orderId: string
  paymentId?: string
  paymentUrl?: string
  status?: PaymentStatus
  metaAppend?: Record<string, any>
}): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getServerClientPreferServiceRole()
    const patch: any = {}
    if (params.paymentId !== undefined) patch.payment_id = params.paymentId
    if (params.paymentUrl !== undefined) patch.payment_url = params.paymentUrl
    if (params.status) patch.status = params.status
    if (params.metaAppend) patch.meta = params.metaAppend

    const { error } = await (client as any)
      .from('payments')
      .update(patch)
      .eq('order_id', params.orderId)

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Не удалось обновить поля поставщика' }
  }
}

export async function updatePaymentStatusByPaymentId(paymentId: string, status: PaymentStatus): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getServerClientPreferServiceRole()
    const { error } = await (client as any)
      .from('payments')
      .update({ status })
      .eq('payment_id', paymentId)
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Не удалось обновить статус платежа' }
  }
}

export async function updatePaymentStatusByOrderId(orderId: string, status: PaymentStatus): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getServerClientPreferServiceRole()
    const { error } = await (client as any)
      .from('payments')
      .update({ status })
      .eq('order_id', orderId)
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Не удалось обновить статус платежа' }
  }
}

// Получить платеж по идентификаторам
export async function getPaymentByPaymentId(paymentId: string): Promise<{ success: true; payment: PaymentRecord } | { success: false; error: string }> {
  try {
    const client = getServerClientPreferServiceRole()
    const { data, error } = await (client as any)
      .from('payments')
      .select('*')
      .eq('payment_id', paymentId)
      .single()
    if (error) return { success: false, error: error.message }
    return { success: true, payment: data as PaymentRecord }
  } catch (err: any) {
    return { success: false, error: err.message || 'Не удалось получить платеж' }
  }
}

export async function getPaymentByOrderId(orderId: string): Promise<{ success: true; payment: PaymentRecord } | { success: false; error: string }> {
  try {
    const client = getServerClientPreferServiceRole()
    const { data, error } = await (client as any)
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .single()
    if (error) return { success: false, error: error.message }
    return { success: true, payment: data as PaymentRecord }
  } catch (err: any) {
    return { success: false, error: err.message || 'Не удалось получить платеж' }
  }
}


