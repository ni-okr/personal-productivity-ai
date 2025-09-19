import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export const dynamic = 'force-dynamic'

export default function PricingPage() {
  const handlePay = async (type: 'test' | 'live') => {
    const route = type === 'test' ? '/api/tinkoff/test-payment' : '/api/tinkoff/live-payment'
    const res = await fetch(route, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 99900, description: 'Подписка Premium', planId: 'premium' })
    })
    const data = await res.json()
    if (data?.data?.paymentUrl) {
      window.open(data.data.paymentUrl, '_blank', 'width=900,height=700')
    } else if (data?.error) {
      alert(`Ошибка платежа: ${data.error}`)
    }
  }

  return (
    <main className="container py-12">
      <div className="mb-8">
        <Link href="/" className="text-sm text-gray-600 hover:underline">← На главную</Link>
      </div>
      <h1 className="text-3xl font-bold mb-8">Тарифные планы</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="card text-center">
          <h3 className="text-xl font-bold mb-2">Free</h3>
          <div className="text-3xl font-bold mb-4">0 ₽</div>
          <ul className="text-sm text-gray-600 mb-6 space-y-2">
            <li>До 50 задач в месяц</li>
            <li>Базовое планирование</li>
            <li>Email поддержка</li>
          </ul>
          <Button variant="outline" className="w-full" onClick={() => location.assign('/planner?plan=free')}>Выбрать Free</Button>
        </div>

        <div className="card text-center border-indigo-200 bg-indigo-50">
          <h3 className="text-xl font-bold mb-2">Premium</h3>
          <div className="text-3xl font-bold mb-4">999 ₽<span className="text-sm font-normal text-gray-500">/мес</span></div>
          <ul className="text-sm text-gray-600 mb-6 space-y-2">
            <li>До 500 задач в месяц</li>
            <li>ИИ планировщик</li>
            <li>Приоритетная поддержка</li>
          </ul>
          <div className="space-y-2">
            <Button className="w-full" onClick={() => handlePay('live')}>Живая оплата (Тинькофф)</Button>
            <Button variant="secondary" className="w-full" onClick={() => handlePay('test')}>Тестовая оплата (Тинькофф)</Button>
          </div>
        </div>

        <div className="card text-center">
          <h3 className="text-xl font-bold mb-2">Pro</h3>
          <div className="text-3xl font-bold mb-4">1999 ₽<span className="text-sm font-normal text-gray-500">/мес</span></div>
          <ul className="text-sm text-gray-600 mb-6 space-y-2">
            <li>Неограниченно</li>
            <li>Все ИИ модели</li>
            <li>Персональный менеджер</li>
          </ul>
          <Button variant="outline" className="w-full" onClick={() => location.assign('/planner?plan=pro')}>Выбрать Pro</Button>
        </div>
      </div>
    </main>
  )
}
