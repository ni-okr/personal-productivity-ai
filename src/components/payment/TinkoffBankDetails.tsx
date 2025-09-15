// 🏦 Компонент для отображения банковских реквизитов Тинькофф
'use client'

import { TINKOFF_CONFIG } from '@/config/tinkoff'
import { useState } from 'react'

interface TinkoffBankDetailsProps {
    className?: string
    showContact?: boolean
}

export default function TinkoffBankDetails({
    className = '',
    showContact = true
}: TinkoffBankDetailsProps) {
    const [copiedField, setCopiedField] = useState<string | null>(null)

    const copyToClipboard = async (text: string, fieldName: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedField(fieldName)
            setTimeout(() => setCopiedField(null), 2000)
        } catch (err) {
            console.error('Ошибка копирования:', err)
        }
    }

    const bankDetails = TINKOFF_CONFIG.bankDetails
    const contact = TINKOFF_CONFIG.contact

    return (
        <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">Т</span>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Банковские реквизиты
                    </h3>
                    <p className="text-sm text-gray-600">{TINKOFF_CONFIG.recipient.name}</p>
                </div>
            </div>

            <div className="space-y-4">
                {/* Реквизиты ИП */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-3">Реквизиты получателя</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <p className="text-xs text-blue-700">Полное наименование</p>
                            <p className="text-sm font-medium text-blue-900">
                                {TINKOFF_CONFIG.recipient.fullName}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-blue-700">ОГРНИП</p>
                            <p className="text-sm font-mono font-medium text-blue-900">
                                {TINKOFF_CONFIG.recipient.ogrnip}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-blue-700">ИНН</p>
                            <p className="text-sm font-mono font-medium text-blue-900">
                                {TINKOFF_CONFIG.recipient.inn}
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-xs text-yellow-800">
                            💡 <strong>Важно:</strong> При переводе укажите назначение платежа: "Оплата подписки [название плана]"
                        </p>
                    </div>
                </div>

                {/* Номер счета */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                        <p className="text-sm text-gray-600">Номер счета</p>
                        <p className="font-mono text-lg font-semibold text-gray-900">
                            {bankDetails.accountNumber}
                        </p>
                    </div>
                    <button
                        onClick={() => copyToClipboard(bankDetails.accountNumber, 'account')}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        {copiedField === 'account' ? '✓ Скопировано' : 'Копировать'}
                    </button>
                </div>

                {/* Банк получателя */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                        <p className="text-sm text-gray-600">Банк получателя</p>
                        <p className="font-semibold text-gray-900">
                            {bankDetails.bankName}
                        </p>
                    </div>
                    <button
                        onClick={() => copyToClipboard(bankDetails.bankName, 'bank')}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        {copiedField === 'bank' ? '✓ Скопировано' : 'Копировать'}
                    </button>
                </div>

                {/* БИК */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                        <p className="text-sm text-gray-600">БИК</p>
                        <p className="font-mono text-lg font-semibold text-gray-900">
                            {bankDetails.bik}
                        </p>
                    </div>
                    <button
                        onClick={() => copyToClipboard(bankDetails.bik, 'bik')}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        {copiedField === 'bik' ? '✓ Скопировано' : 'Копировать'}
                    </button>
                </div>

                {/* Корр. счет */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                        <p className="text-sm text-gray-600">Корр. счет</p>
                        <p className="font-mono text-lg font-semibold text-gray-900">
                            {bankDetails.correspondentAccount}
                        </p>
                    </div>
                    <button
                        onClick={() => copyToClipboard(bankDetails.correspondentAccount, 'corr')}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        {copiedField === 'corr' ? '✓ Скопировано' : 'Копировать'}
                    </button>
                </div>

                {/* Контактная информация */}
                {showContact && (
                    <div className="pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Контактная информация</h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Телефон:</span>
                                <a
                                    href={`tel:${contact.phone}`}
                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    {contact.phone}
                                </a>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Email:</span>
                                <a
                                    href={`mailto:${contact.email}`}
                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    {contact.email}
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* Информация о статусе */}
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                        <div className="w-5 h-5 text-yellow-600 mt-0.5">⚠️</div>
                        <div>
                            <p className="text-sm text-yellow-800 font-medium">
                                MVP режим (заглушка)
                            </p>
                            <p className="text-xs text-yellow-700 mt-1">
                                Платежи пока не обрабатываются автоматически.
                                Используйте реквизиты для ручных переводов.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
