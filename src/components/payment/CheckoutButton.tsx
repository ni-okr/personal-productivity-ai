'use client'

// 🔘 Кнопка оформления оплаты
import { useState } from 'react'

interface CheckoutButtonProps {
  planId: 'premium' | 'pro' | 'enterprise'
  method: 'card' | 'bank_transfer' | 'qr_code' | 'sbp'
  label?: string
}

export function CheckoutButton({ planId, method, label }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    try {
      setLoading(true)
      setError(null)

      const resp = await fetch('/api/subscriptions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, paymentMethod: method })
      })
      const data = await resp.json()
      if (!resp.ok || !data.success) {
        throw new Error(data.error || 'Не удалось создать сессию оплаты')
      }

      // Для карт скроется paymentUrl
      if (data.data?.paymentUrl) {
        window.location.href = data.data.paymentUrl
        return
      }

      // Иначе fallback — поведение как раньше (банковский перевод/QR/СБП)
      if (data.data?.url) {
        window.location.href = data.data.url
        return
      }

      throw new Error('Ответ сервера не содержит адреса для перехода')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleClick} disabled={loading} className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-60">
      {loading ? 'Переход к оплате…' : (label || 'Оформить оплату')}
      {error && <span className="block mt-2 text-sm text-red-600">{error}</span>}
    </button>
  )
}


