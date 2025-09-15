// 🏦 Конфигурация Тинькофф для платежей
// ⚠️ ВАЖНО: Эта информация НЕ должна попадать в Git!
// Используйте переменные окружения для продакшена
export const TINKOFF_CONFIG = {
    // Информация о получателе (из переменных окружения)
    recipient: {
        name: process.env.TINKOFF_RECIPIENT_NAME || 'ИП [СКРЫТО]',
        fullName: process.env.TINKOFF_RECIPIENT_FULL_NAME || 'Индивидуальный предприниматель [СКРЫТО]',
        ogrnip: process.env.TINKOFF_OGRNIP || '[СКРЫТО]',
        inn: process.env.TINKOFF_INN || '[СКРЫТО]'
    },

    // Банковские реквизиты (из переменных окружения)
    bankDetails: {
        accountNumber: process.env.TINKOFF_ACCOUNT_NUMBER || '[СКРЫТО]',
        bankName: process.env.TINKOFF_BANK_NAME || 'АО «ТБанк»',
        bik: process.env.TINKOFF_BIK || '[СКРЫТО]',
        correspondentAccount: process.env.TINKOFF_CORR_ACCOUNT || '[СКРЫТО]'
    },

    // Контактная информация (из переменных окружения)
    contact: {
        phone: process.env.TINKOFF_PHONE || '[СКРЫТО]',
        email: process.env.TINKOFF_EMAIL || '[СКРЫТО]'
    },

    // Настройки для MVP (реальные банковские переводы)
    mvp: {
        isMockMode: false, // Реальные банковские реквизиты
        paymentMethod: 'bank_transfer', // Банковский перевод
        paymentInstructions: 'Переведите указанную сумму на расчетный счет ИП для активации подписки'
    },

    // Настройки для продакшена (когда будет готова интеграция)
    production: {
        terminalKey: process.env.TINKOFF_TERMINAL_KEY || '',
        secretKey: process.env.TINKOFF_SECRET_KEY || '',
        webhookSecret: process.env.TINKOFF_WEBHOOK_SECRET || '',
        baseUrl: 'https://securepay.tinkoff.ru/v2/'
    }
} as const

// Типы для конфигурации
export type TinkoffRecipient = typeof TINKOFF_CONFIG.recipient
export type TinkoffBankDetails = typeof TINKOFF_CONFIG.bankDetails
export type TinkoffContact = typeof TINKOFF_CONFIG.contact
export type TinkoffMvpConfig = typeof TINKOFF_CONFIG.mvp
export type TinkoffProductionConfig = typeof TINKOFF_CONFIG.production
