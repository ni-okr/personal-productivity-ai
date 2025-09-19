'use client'

import { Button } from '@/components/ui/Button'
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
            <Button onClick={async () => {
              await fetch('/api/tinkoff/test-payment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: 99900, description: 'Подписка Premium', planId: 'premium' }) })
                .then(r => r.json()).then((res) => {
                  if (res?.data?.paymentUrl) {
                    window.open(res.data.paymentUrl, '_blank', 'width=900,height=700')
                  }
                })
            }} className="w-full" variant="secondary">Тестовая оплата</Button>
            <Button onClick={async () => {
              await fetch('/api/tinkoff/live-payment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: 99900, description: 'Подписка Premium', planId: 'premium' }) })
                .then(r => r.json()).then((res) => {
                  if (res?.data?.paymentUrl) {
                    window.open(res.data.paymentUrl, '_blank', 'width=900,height=700')
                  }
                })
            }} className="w-full">Живая оплата</Button>
          </div>
        </div>
      </div>
    </div>
  )
}


