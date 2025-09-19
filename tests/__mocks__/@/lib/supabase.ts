// 🗄️ Mock для Supabase API
// Глобальное хранилище для устойчивости между возможными экземплярами модуля
const globalKey = '__PPAI_SUBSCRIBERS__'
const g: any = globalThis as any
if (!g[globalKey]) {
  g[globalKey] = new Map<string, { email: string; is_active: boolean; created_at: string }>()
}
const subscribers: Map<string, { email: string; is_active: boolean; created_at: string }> = g[globalKey]

export async function addSubscriber(email: string): Promise<{ success: boolean; message: string; data?: { email: string; is_active: boolean; created_at: string } }> {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, message: 'Некорректный email' }
  }
  if (subscribers.has(email)) {
    return { success: false, message: 'Email уже подписан' }
  }
  const created_at = new Date().toISOString()
  subscribers.set(email, { email, is_active: true, created_at })
  return { success: true, message: 'Спасибо за подписку', data: { email, is_active: true, created_at } }
}

export async function getActiveSubscribers(): Promise<Array<{ email: string; is_active: boolean; created_at: string }>> {
  return Array.from(subscribers.values()).filter(s => s.is_active)
}

export async function unsubscribe(email: string): Promise<{ success: boolean; message: string }> {
  if (!subscribers.has(email)) {
    return { success: false, message: 'Подписчик не найден' }
  }
  const rec = subscribers.get(email)!
  subscribers.set(email, { ...rec, is_active: false })
  return { success: true, message: 'Вы успешно отписались' }
}

export function getSupabaseClient() {
  // Мини-реализация методов таблицы subscribers
  return {
    from: (table: string) => {
      if (table !== 'subscribers') {
        return {
          select: () => ({ limit: () => ({}) })
        }
      }
      return {
        delete: () => ({ in: (_col: string, emails: string[]) => {
          emails.forEach((e) => subscribers.delete(e))
          return { data: null, error: null }
        }}),
        select: (_cols?: string) => ({
          eq: (_col: string, value: any) => ({
            single: () => {
              const found = Array.from(subscribers.values()).find(s => s.email === value)
              return { data: found ? { is_active: found.is_active } : null, error: null }
            }
          })
        })
      }
    }
  }
}

// Тестовая утилита для изоляции
export function resetSubscribers(): void {
  subscribers.clear()
}
