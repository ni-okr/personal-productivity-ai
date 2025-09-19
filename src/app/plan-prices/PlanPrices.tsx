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
          </div>
        </div>
      </div>
    </div>
  )
}


