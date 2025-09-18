// 🧪 Модальное окно тестовой оплаты через Тинькофф
'use client'

import { Button } from '@/components/ui/Button'
import { CreditCardIcon, ExternalLinkIcon, XIcon, AlertCircleIcon, CopyIcon, CheckIcon } from 'lucide-react'
import { useState } from 'react'

interface TestPaymentModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    amount: number
    description: string
    planId: string
}

export function TestPaymentModal({
    isOpen,
    onClose,
    onSuccess,
    amount,
    description,
    planId
}: TestPaymentModalProps) {
    const [isProcessing, setIsProcessing] = useState(false)
    const [paymentData, setPaymentData] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [copiedField, setCopiedField] = useState<string | null>(null)

    const handleCreatePayment = async () => {
        setIsProcessing(true)
        setError(null)
        
        try {
            const response = await fetch('/api/tinkoff/test-payment', {
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
                setError(result.error || 'Ошибка создания тестового платежа')
            }
        } catch (error) {
            console.error('Ошибка:', error)
            setError('Ошибка создания тестового платежа')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleOpenPayment = () => {
        if (paymentData?.paymentUrl) {
            window.open(paymentData.paymentUrl, '_blank', 'width=800,height=600')
        }
    }

    const copyToClipboard = async (text: string, field: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedField(field)
            setTimeout(() => setCopiedField(null), 2000)
        } catch (error) {
            console.error('Ошибка копирования:', error)
        }
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
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                            <CreditCardIcon className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Тестовая оплата
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
                            Тестовая оплата через Тинькофф
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
                                Тестовый платеж создан успешно!
                            </h4>
                            <div className="text-sm text-green-700 space-y-1">
                                <div>ID платежа: {paymentData.paymentId}</div>
                                <div>Заказ: {paymentData.orderId}</div>
                            </div>
                        </div>
                    )}

                    {/* Тестовые данные карты */}
                    {paymentData?.testCardData && (
                        <div className="space-y-4 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Тестовые данные карты
                            </h3>
                            <p className="text-sm text-gray-600">
                                Используйте эти данные для тестирования:
                            </p>

                            {/* Номер карты */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Номер карты
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={paymentData.testCardData.number}
                                        readOnly
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-mono"
                                    />
                                    <Button
                                        onClick={() => copyToClipboard(paymentData.testCardData.number, 'number')}
                                        variant="ghost"
                                        size="sm"
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        {copiedField === 'number' ? (
                                            <CheckIcon className="w-4 h-4 text-green-600" />
                                        ) : (
                                            <CopyIcon className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Срок действия и CVV */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Срок действия
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={paymentData.testCardData.expiry}
                                            readOnly
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-mono"
                                        />
                                        <Button
                                            onClick={() => copyToClipboard(paymentData.testCardData.expiry, 'expiry')}
                                            variant="ghost"
                                            size="sm"
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            {copiedField === 'expiry' ? (
                                                <CheckIcon className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <CopyIcon className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        CVV
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={paymentData.testCardData.cvv}
                                            readOnly
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-mono"
                                        />
                                        <Button
                                            onClick={() => copyToClipboard(paymentData.testCardData.cvv, 'cvv')}
                                            variant="ghost"
                                            size="sm"
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            {copiedField === 'cvv' ? (
                                                <CheckIcon className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <CopyIcon className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Инструкции */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <h4 className="text-sm font-semibold text-yellow-800 mb-2">
                            Инструкция:
                        </h4>
                        <ol className="text-sm text-yellow-700 space-y-1">
                            <li>1. Нажмите "Создать тестовый платеж"</li>
                            <li>2. Скопируйте данные тестовой карты</li>
                            <li>3. Перейдите по ссылке для оплаты</li>
                            <li>4. Вставьте данные в форму оплаты</li>
                            <li>5. Ожидайте статус "Оплачено"</li>
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
                                className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                        Создание...
                                    </>
                                ) : (
                                    'Создать тестовый платеж'
                                )}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleOpenPayment}
                                className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                            >
                                <ExternalLinkIcon className="w-4 h-4 mr-2" />
                                Перейти к оплате
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}