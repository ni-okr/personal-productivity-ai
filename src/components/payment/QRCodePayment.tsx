import { Copy, Download, QrCode } from 'lucide-react'
import { useState } from 'react'

interface QRCodePaymentProps {
    qrData: string
    qrImageUrl: string
    amount: number
    currency: string
    description: string
    className?: string
}

export function QRCodePayment({ qrData, qrImageUrl, amount, currency, description, className }: QRCodePaymentProps) {
    const [copied, setCopied] = useState(false)

    const handleCopyQRData = async () => {
        try {
            await navigator.clipboard.writeText(qrData)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            console.error('Ошибка копирования:', error)
        }
    }

    const handleDownloadQR = () => {
        const link = document.createElement('a')
        link.href = qrImageUrl
        link.download = `qr-payment-${amount}-${currency}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Оплата по QR коду
                    </h3>
                    <p className="text-sm text-gray-600">
                        {amount} {currency} • {description}
                    </p>
                </div>
            </div>

            <div className="text-center space-y-4">
                {/* QR код */}
                <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                    <img
                        src={qrImageUrl}
                        alt="QR код для оплаты"
                        className="w-64 h-64 mx-auto"
                    />
                </div>

                {/* Инструкции */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Как оплатить:</h4>
                    <ol className="text-sm text-blue-800 space-y-1 text-left">
                        <li>1. Откройте приложение вашего банка</li>
                        <li>2. Выберите "Оплата по QR коду"</li>
                        <li>3. Отсканируйте QR код выше</li>
                        <li>4. Подтвердите перевод</li>
                    </ol>
                </div>

                {/* Действия */}
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={handleCopyQRData}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        <Copy className="w-4 h-4" />
                        {copied ? 'Скопировано!' : 'Скопировать данные'}
                    </button>

                    <button
                        onClick={handleDownloadQR}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Скачать QR
                    </button>
                </div>

                {/* Дополнительная информация */}
                <div className="text-xs text-gray-500">
                    <p>QR код содержит все необходимые реквизиты для перевода</p>
                    <p>Сумма: {amount} {currency}</p>
                </div>
            </div>
        </div>
    )
}
