// 💳 Модальное окно живой оплаты через Тинькофф
'use client'

import { Button } from '@/components/ui/Button'
import { CreditCardIcon, ExternalLinkIcon, XIcon, AlertCircleIcon } from 'lucide-react'
import { useState } from 'react'

interface LivePaymentModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    amount: number
    description: string
    planId: string
}

export function LivePaymentModal({
    isOpen,
    onClose,
    onSuccess,
    amount,
    description,
    planId
}: LivePaymentModalProps) {
    const [isProcessing, setIsProcessing] = useState(false)
    const [paymentData, setPaymentData] = useState<any>(null)
    const [showInlineForm, setShowInlineForm] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleCreatePayment = async () => {
        setIsProcessing(true)
        setError(null)
        
        try {
            const response = await fetch('/api/tinkoff/live-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount,
                    description,
                    planId
                })
            })
            
            const result = await response.json()
            
            if (result.success) {
                setPaymentData(result.data)
            } else {
                setError(result.error || 'Ошибка создания платежа')
            }
        } catch (error) {
            console.error('Ошибка:', error)
            setError('Ошибка создания платежа')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleOpenPayment = () => {
        if (!paymentData?.paymentUrl) return
        setShowInlineForm(true)
        setTimeout(() => {
            try {
                const iframe = document.getElementById('tinkoff-live-iframe') as HTMLIFrameElement | null
                if (!iframe) return
                const timer = setTimeout(() => {
                    if (!iframe.contentWindow) {
                        window.open(paymentData.paymentUrl, '_blank', 'width=900,height=700')
                    }
                }, 2000)
                iframe.onload = () => clearTimeout(timer)
            } catch (e) {
                window.open(paymentData.paymentUrl, '_blank', 'width=900,height=700')
            }
        }, 50)
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
        }).format(price / 100)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <CreditCardIcon className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Живая оплата
                            </h2>
                            <p className="text-sm text-gray-600">
                                {description}
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <XIcon className="w-5 h-5" />
                    </Button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Сумма */}
                    <div className="text-center mb-6">
                        <div className="text-3xl font-bold text-gray-900">
                            {formatPrice(amount)}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                            Живая оплата через Тинькофф
                        </div>
                    </div>

                    {/* Ошибка */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-2">
                                <AlertCircleIcon className="w-5 h-5 text-red-600" />
                                <span className="text-sm text-red-800">{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Данные платежа */}
                    {paymentData && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <h4 className="text-sm font-semibold text-green-800 mb-2">
                                Платеж создан успешно!
                            </h4>
                            <div className="text-sm text-green-700 space-y-1">
                                <div>ID платежа: {paymentData.paymentId}</div>
                                <div>Заказ: {paymentData.orderId}</div>
                            </div>
                        </div>
                    )}

                    {/* Инструкции */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <h4 className="text-sm font-semibold text-blue-800 mb-2">
                            Инструкция:
                        </h4>
                        <ol className="text-sm text-blue-700 space-y-1">
                            <li>1. Нажмите "Создать платеж"</li>
                            <li>2. Откройте форму оплаты (в окне или здесь)</li>
                            <li>3. Введите данные вашей банковской карты</li>
                            <li>4. Подтвердите платеж в вашем банке</li>
                            <li>5. Ожидайте подтверждения оплаты</li>
                        </ol>
                    </div>

                    {/* Кнопки */}
                    <div className="flex gap-3">
                        <Button
                            onClick={onClose}
                            variant="outline"
                            className="flex-1"
                        >
                            Отмена
                        </Button>
                        
                        {!paymentData ? (
                            <Button
                                onClick={handleCreatePayment}
                                disabled={isProcessing}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                        Создание...
                                    </>
                                ) : (
                                    'Создать платеж'
                                )}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleOpenPayment}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                                <ExternalLinkIcon className="w-4 h-4 mr-2" />
                                Открыть форму оплаты
                            </Button>
                        )}
                    </div>
                </div>
            </div>
            {showInlineForm && paymentData?.paymentUrl && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setShowInlineForm(false)} />
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl h-[80vh]">
                        <div className="flex items-center justify-between p-3 border-b">
                            <div className="font-semibold">Форма оплаты Тинькофф</div>
                            <Button variant="ghost" size="sm" onClick={() => setShowInlineForm(false)}>
                                <XIcon className="w-5 h-5" />
                            </Button>
                        </div>
                        <iframe
                            id="tinkoff-live-iframe"
                            src={paymentData.paymentUrl}
                            className="w-full h-full"
                            sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
