import { ExternalLink, Smartphone } from 'lucide-react'

interface SBPPaymentProps {
    sbpUrl: string
    amount: number
    currency: string
    description: string
    className?: string
}

export function SBPPayment({ sbpUrl, amount, currency, description, className }: SBPPaymentProps) {
    const handleOpenSBP = () => {
        window.open(sbpUrl, '_blank', 'noopener,noreferrer')
    }

    return (
        <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Оплата через СБП
                    </h3>
                    <p className="text-sm text-gray-600">
                        {amount} {currency} • {description}
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {/* Кнопка оплаты */}
                <button
                    onClick={handleOpenSBP}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-3"
                >
                    <Smartphone className="w-5 h-5" />
                    <span>Оплатить через СБП</span>
                    <ExternalLink className="w-4 h-4" />
                </button>

                {/* Инструкции */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-medium text-purple-900 mb-2">Как оплатить через СБП:</h4>
                    <ol className="text-sm text-purple-800 space-y-1">
                        <li>1. Нажмите кнопку "Оплатить через СБП"</li>
                        <li>2. Выберите ваш банк из списка</li>
                        <li>3. Войдите в приложение банка</li>
                        <li>4. Подтвердите перевод</li>
                    </ol>
                </div>

                {/* Поддерживаемые банки */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Поддерживаемые банки:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div>• Сбербанк</div>
                        <div>• ВТБ</div>
                        <div>• Альфа-Банк</div>
                        <div>• Тинькофф</div>
                        <div>• Газпромбанк</div>
                        <div>• Райффайзен</div>
                        <div>• И другие 200+ банков</div>
                    </div>
                </div>

                {/* Дополнительная информация */}
                <div className="text-xs text-gray-500 text-center">
                    <p>СБП - это быстрый и безопасный способ оплаты</p>
                    <p>Перевод происходит мгновенно</p>
                </div>
            </div>
        </div>
    )
}
