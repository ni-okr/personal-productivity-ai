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
  const [showInlineForm, setShowInlineForm] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null)

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

      // Для карт показываем PaymentURL в iframe (без редиректа)
      if (data.data?.paymentUrl) {
        setPaymentUrl(data.data.paymentUrl)
        setShowInlineForm(true)
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
    <>
      <button onClick={handleClick} disabled={loading} className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-60 w-full">
        {loading ? 'Переход к оплате…' : (label || 'Оформить оплату')}
        {error && <span className="block mt-2 text-sm text-red-600">{error}</span>}
      </button>

      {showInlineForm && paymentUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowInlineForm(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl h-[80vh]">
            <div className="flex items-center justify-between p-3 border-b">
              <div className="font-semibold">Форма оплаты Тинькофф</div>
              <button onClick={() => setShowInlineForm(false)} className="px-2 py-1 text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <iframe
              src={paymentUrl}
              className="w-full h-full"
              sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
            />
          </div>
        </div>
      )}
    </>
  )
}


