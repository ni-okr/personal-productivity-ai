'use client'

import { Button } from '@/components/ui/Button'
import { CheckoutButton } from '@/components/payment/CheckoutButton'
import { useRouter } from 'next/navigation'

export default function PlanPrices() {
  const router = useRouter()
  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border rounded-xl p-6">
          <div className="text-2xl font-bold mb-2">Premium</div>
          <div className="text-gray-600 mb-4">999 ₽ / мес</div>
          <div className="space-y-2 text-sm text-gray-700 mb-6">
            <div>До 500 задач в месяц</div>
            <div>ИИ планировщик</div>
            <div>Приоритетная поддержка</div>
          </div>
          <div className="space-y-3">
            <CheckoutButton planId="premium" method="card" label="Оплатить картой" />
            <CheckoutButton planId="premium" method="bank_transfer" label="Банковский перевод" />
            <button
              onClick={async () => {
                try {
                  const r = await fetch('/api/tinkoff/widget-prepare', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: 99900, description: 'Подписка Premium', planId: 'premium' })
                  })
                  const j = await r.json()
                  if (!j.success) {
                    alert(`Ошибка подготовки виджета: ${j.error || 'unknown'}`)
                    return
                  }
                  const { actionUrl, fields } = j.data
                  const form = document.createElement('form')
                  form.method = 'POST'
                  form.action = actionUrl
                  form.acceptCharset = 'UTF-8'
                  Object.entries(fields).forEach(([k, v]) => {
                    const input = document.createElement('input')
                    input.type = 'hidden'
                    input.name = k
                    input.value = String(v)
                    form.appendChild(input)
                  })
                  document.body.appendChild(form)
                  form.submit()
                } catch (e: any) {
                  alert(`Ошибка сети: ${e?.message || e}`)
                }
              }}
              className="px-4 py-2 rounded bg-indigo-600 text-white w-full"
            >
              Оплата картой (виджет)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


