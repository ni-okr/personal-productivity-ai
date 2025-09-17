// 💳 Модальное окно тестовой оплаты
'use client'

import { Button } from '@/components/ui/Button'
import { CheckIcon, CopyIcon, CreditCardIcon, XIcon } from 'lucide-react'
import { useState } from 'react'

interface TestPaymentModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    testCardData: {
        number: string
        expiry: string
        cvv: string
    }
    amount: number
    description: string
}

export function TestPaymentModal({
    isOpen,
    onClose,
    onSuccess,
    testCardData,
    amount,
    description
}: TestPaymentModalProps) {
    const [copiedField, setCopiedField] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    const copyToClipboard = async (text: string, field: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedField(field)
            setTimeout(() => setCopiedField(null), 2000)
        } catch (error) {
            console.error('Ошибка копирования:', error)
        }
    }

    const handlePayment = async () => {
        setIsProcessing(true)
        
        // Имитируем процесс оплаты
        setTimeout(() => {
            setIsProcessing(false)
            onSuccess()
        }, 2000)
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
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <CreditCardIcon className="w-5 h-5 text-indigo-600" />
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
                            {amount} ₽
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                            Тестовая оплата
                        </div>
                    </div>

                    {/* Тестовые данные карты */}
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
                                    value={testCardData.number}
                                    readOnly
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-mono"
                                />
                                <Button
                                    onClick={() => copyToClipboard(testCardData.number, 'number')}
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
                                        value={testCardData.expiry}
                                        readOnly
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-mono"
                                    />
                                    <Button
                                        onClick={() => copyToClipboard(testCardData.expiry, 'expiry')}
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
                                        value={testCardData.cvv}
                                        readOnly
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-mono"
                                    />
                                    <Button
                                        onClick={() => copyToClipboard(testCardData.cvv, 'cvv')}
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

                    {/* Инструкции */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <h4 className="text-sm font-semibold text-yellow-800 mb-2">
                            Инструкция:
                        </h4>
                        <ol className="text-sm text-yellow-700 space-y-1">
                            <li>1. Скопируйте данные карты выше</li>
                            <li>2. Нажмите "Оплатить"</li>
                            <li>3. Вставьте данные в форму оплаты</li>
                            <li>4. Ожидайте статус "Оплачено"</li>
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
                        <Button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                        >
                            {isProcessing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    Обработка...
                                </>
                            ) : (
                                'Оплатить'
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}