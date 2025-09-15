import { Building2, CreditCard, QrCode, Smartphone } from 'lucide-react'

interface PaymentMethodSelectorProps {
    onMethodSelect: (method: 'bank_transfer' | 'qr_code' | 'sbp' | 'card') => void
    selectedMethod?: string
    className?: string
}

export function PaymentMethodSelector({ onMethodSelect, selectedMethod, className }: PaymentMethodSelectorProps) {
    const methods = [
        {
            id: 'bank_transfer' as const,
            name: 'Банковский перевод',
            description: 'Перевод на расчетный счет ИП',
            icon: Building2,
            color: 'bg-blue-500',
            popular: true
        },
        {
            id: 'qr_code' as const,
            name: 'QR код',
            description: 'Отсканируйте QR код в приложении банка',
            icon: QrCode,
            color: 'bg-green-500',
            popular: true
        },
        {
            id: 'sbp' as const,
            name: 'СБП',
            description: 'Система быстрых платежей',
            icon: Smartphone,
            color: 'bg-purple-500',
            popular: false
        },
        {
            id: 'card' as const,
            name: 'Карта',
            description: 'Оплата банковской картой',
            icon: CreditCard,
            color: 'bg-orange-500',
            popular: false
        }
    ]

    return (
        <div className={`space-y-3 ${className}`}>
            <h3 className="text-lg font-semibold text-gray-900">Способ оплаты</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {methods.map((method) => {
                    const Icon = method.icon
                    const isSelected = selectedMethod === method.id

                    return (
                        <button
                            key={method.id}
                            onClick={() => onMethodSelect(method.id)}
                            className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${isSelected
                                    ? 'border-indigo-500 bg-indigo-50'
                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            {method.popular && (
                                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                    Популярно
                                </span>
                            )}

                            <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-lg ${method.color} flex items-center justify-center flex-shrink-0`}>
                                    <Icon className="w-5 h-5 text-white" />
                                </div>

                                <div className="text-left flex-1">
                                    <h4 className="font-medium text-gray-900">{method.name}</h4>
                                    <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                                </div>

                                {isSelected && (
                                    <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                    </div>
                                )}
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
