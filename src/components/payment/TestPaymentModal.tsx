// 🧪 Компонент для тестирования платежей Тинькофф

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface TestPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  planId: string
  planName: string
  amount: number
}

export function TestPaymentModal({ isOpen, onClose, planId, planName, amount }: TestPaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleTestPayment = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/tinkoff/test-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          description: `Тестовая подписка ${planName}`,
          planId: planId
        })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Ошибка создания тестового платежа')
      }

      setPaymentData(data.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenPayment = () => {
    if (paymentData?.paymentUrl) {
      window.open(paymentData.paymentUrl, '_blank')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">🧪 Тестовый платеж</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">План: {planName}</h3>
            <p className="text-blue-800">Сумма: {amount} ₽</p>
          </div>

          {!paymentData ? (
            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">Инструкция:</h4>
                <ol className="text-sm text-yellow-800 space-y-1">
                  <li>1. Нажмите "Создать тестовый платеж"</li>
                  <li>2. Перейдите по ссылке для оплаты</li>
                  <li>3. Используйте тестовую карту: <code className="bg-yellow-200 px-1 rounded">4300 0000 0000 0777</code></li>
                  <li>4. Срок: 12/30, CVV: 111</li>
                  <li>5. Ожидайте статус "Оплачено"</li>
                </ol>
              </div>

              {error && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <Button
                onClick={handleTestPayment}
                disabled={isLoading}
                className="w-full"
                variant="primary"
              >
                {isLoading ? 'Создание платежа...' : 'Создать тестовый платеж'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">✅ Платеж создан!</h4>
                <p className="text-green-800 text-sm">
                  ID платежа: {paymentData.paymentId}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Тестовые данные карты:</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Номер:</span> 
                    <code className="bg-gray-200 px-2 py-1 rounded ml-2">
                      {paymentData.testCardData.number}
                    </code>
                  </div>
                  <div>
                    <span className="font-medium">Срок:</span> 
                    <code className="bg-gray-200 px-2 py-1 rounded ml-2">
                      {paymentData.testCardData.expiry}
                    </code>
                  </div>
                  <div>
                    <span className="font-medium">CVV:</span> 
                    <code className="bg-gray-200 px-2 py-1 rounded ml-2">
                      {paymentData.testCardData.cvv}
                    </code>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={handleOpenPayment}
                  className="flex-1"
                  variant="primary"
                >
                  Перейти к оплате
                </Button>
                <Button
                  onClick={onClose}
                  className="flex-1"
                  variant="secondary"
                >
                  Закрыть
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
