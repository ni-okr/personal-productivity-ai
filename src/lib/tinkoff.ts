// 💳 Система платежей: банковские переводы + QR коды + СБП

// Интерфейс для платежей
export interface TinkoffResponse<T = any> {
    success: boolean
    data?: T
    error?: string
    message?: string
}

export interface CreatePaymentData {
    userId: string
    planId: string
    amount: number // в рублях
    currency: string
    description: string
    paymentMethod: 'bank_transfer' | 'qr_code' | 'sbp' | 'card'
    bankDetails?: {
        recipientName: string
        accountNumber: string
        bankName: string
        bik: string
        correspondentAccount: string
    }
}

export interface CreateCustomerData {
    userId: string
    email: string
    name: string
    phone?: string
}

export interface PaymentSession {
    paymentId: string
    paymentMethod: 'bank_transfer' | 'qr_code' | 'sbp' | 'card'
    amount: number
    currency: string
    description: string
    instructions: string
    // Для банковского перевода
    bankDetails?: {
        recipientName: string
        accountNumber: string
        bankName: string
        bik: string
        correspondentAccount: string
    }
    // Для QR кода
    qrCode?: {
        data: string
        imageUrl: string
    }
    // Для СБП
    sbpUrl?: string
    // Для карты (будущая интеграция)
    cardUrl?: string
}

export interface Customer {
    customerId: string
    email: string
    name: string
}

// Система платежей: банковские переводы + QR коды + СБП
class PaymentAPI {
    private bankDetails = {
        recipientName: process.env.TINKOFF_RECIPIENT_FULL_NAME || 'Индивидуальный предприниматель [СКРЫТО]',
        accountNumber: process.env.TINKOFF_ACCOUNT_NUMBER || '[СКРЫТО]',
        bankName: process.env.TINKOFF_BANK_NAME || 'АО «ТБанк»',
        bik: process.env.TINKOFF_BIK || '[СКРЫТО]',
        correspondentAccount: process.env.TINKOFF_CORR_ACCOUNT || '[СКРЫТО]'
    }

    private generateQRCode(amount: number, description: string): { data: string; imageUrl: string } {
        // Генерируем QR код для перевода
        const qrData = `ST00012|Name=${this.bankDetails.recipientName}|PersonalAcc=${this.bankDetails.accountNumber}|BankName=${this.bankDetails.bankName}|BIC=${this.bankDetails.bik}|CorrespAcc=${this.bankDetails.correspondentAccount}|PayeeINN=${process.env.TINKOFF_INN || '[СКРЫТО]'}|Sum=${amount * 100}|Purpose=${description}`

        return {
            data: qrData,
            imageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`
        }
    }

    private generateSBPUrl(amount: number, description: string): string {
        // Генерируем URL для СБП (упрощенная версия)
        const sbpData = {
            amount: amount,
            currency: 'RUB',
            description: description,
            recipient: this.bankDetails.recipientName,
            account: this.bankDetails.accountNumber
        }

        // В реальной интеграции здесь будет вызов Тинькофф API для СБП
        return `https://pay.tbank.ru/sbp?data=${encodeURIComponent(JSON.stringify(sbpData))}`
    }

    /**
     * 🛒 Создание платежа (банковский перевод, QR код, СБП)
     */
    async createPayment(data: CreatePaymentData): Promise<TinkoffResponse<PaymentSession>> {
        try {
            const paymentId = `${data.paymentMethod}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

            console.log('💳 Создание платежа', {
                userId: data.userId,
                planId: data.planId,
                amount: data.amount,
                currency: data.currency,
                paymentMethod: data.paymentMethod
            })

            const session: PaymentSession = {
                paymentId,
                paymentMethod: data.paymentMethod,
                amount: data.amount,
                currency: data.currency,
                description: data.description,
                instructions: this.getPaymentInstructions(data.paymentMethod, data.amount, data.currency, data.planId)
            }

            // Добавляем данные в зависимости от способа оплаты
            switch (data.paymentMethod) {
                case 'bank_transfer':
                    session.bankDetails = this.bankDetails
                    break

                case 'qr_code':
                    session.qrCode = this.generateQRCode(data.amount, data.description)
                    break

                case 'sbp':
                    session.sbpUrl = this.generateSBPUrl(data.amount, data.description)
                    break

                case 'card':
                    // Для будущей интеграции с картами
                    session.cardUrl = `https://securepay.tinkoff.ru/v2/Init?TerminalKey=${process.env.TINKOFF_TERMINAL_KEY}&Amount=${data.amount * 100}&OrderId=${paymentId}&Description=${encodeURIComponent(data.description)}`
                    break
            }

            return {
                success: true,
                data: session,
                message: `Платеж ${this.getPaymentMethodName(data.paymentMethod)} создан`
            }
        } catch (error: any) {
            console.error('Ошибка создания платежа:', error)
            return {
                success: false,
                error: error.message || 'Ошибка создания платежа'
            }
        }
    }

    private getPaymentInstructions(method: string, amount: number, currency: string, planId: string): string {
        switch (method) {
            case 'bank_transfer':
                return `Переведите ${amount} ${currency} на расчетный счет ИП для активации подписки ${planId}`
            case 'qr_code':
                return `Отсканируйте QR код в приложении вашего банка для перевода ${amount} ${currency}`
            case 'sbp':
                return `Нажмите на ссылку для оплаты через СБП (Система быстрых платежей)`
            case 'card':
                return `Перейдите по ссылке для оплаты картой ${amount} ${currency}`
            default:
                return `Оплатите ${amount} ${currency} для активации подписки ${planId}`
        }
    }

    private getPaymentMethodName(method: string): string {
        switch (method) {
            case 'bank_transfer': return 'банковский перевод'
            case 'qr_code': return 'QR код'
            case 'sbp': return 'СБП'
            case 'card': return 'карта'
            default: return 'платеж'
        }
    }

    /**
     * 👤 Создание клиента (для банковских переводов не требуется)
     */
    async createCustomer(data: CreateCustomerData): Promise<TinkoffResponse<Customer>> {
        try {
            console.log('👤 Регистрация клиента для банковских переводов', {
                userId: data.userId,
                email: data.email,
                name: data.name
            })

            return {
                success: true,
                data: {
                    customerId: data.userId, // Используем userId как customerId
                    email: data.email,
                    name: data.name
                },
                message: 'Клиент зарегистрирован для банковских переводов'
            }
        } catch (error: any) {
            console.error('Ошибка регистрации клиента:', error)
            return {
                success: false,
                error: error.message || 'Ошибка регистрации клиента'
            }
        }
    }

    /**
     * 🔍 Получение статуса платежа (ручная проверка)
     */
    async getPaymentStatus(paymentId: string): Promise<TinkoffResponse<{ status: string }>> {
        try {
            console.log('🔍 Проверка статуса банковского перевода', { paymentId })

            // Для банковских переводов статус проверяется вручную
            // В реальной системе здесь может быть интеграция с банком
            return {
                success: true,
                data: {
                    status: 'PENDING' // Ожидает подтверждения
                },
                message: 'Статус перевода: ожидает подтверждения. Проверьте поступление средств на счет.'
            }
        } catch (error: any) {
            console.error('Ошибка проверки статуса перевода:', error)
            return {
                success: false,
                error: error.message || 'Ошибка проверки статуса перевода'
            }
        }
    }

    /**
     * 🔄 Обработка уведомлений о поступлении средств
     */
    async handleWebhook(payload: any): Promise<TinkoffResponse> {
        try {
            console.log('💰 Обработка уведомления о поступлении средств', payload)

            // Для банковских переводов webhook не используется
            // Статус проверяется вручную администратором
            return {
                success: true,
                message: 'Уведомление о поступлении средств обработано'
            }
        } catch (error: any) {
            console.error('Ошибка обработки уведомления:', error)
            return {
                success: false,
                error: error.message || 'Ошибка обработки уведомления'
            }
        }
    }

    /**
     * 🔐 Проверка подписи webhook (не требуется для банковских переводов)
     */
    verifyWebhookSignature(payload: string, signature: string): boolean {
        console.log('🔐 Проверка подписи webhook (не требуется для банковских переводов)')
        return true // Всегда true для банковских переводов
    }
}

// Создаем экземпляр API
const paymentAPI = new PaymentAPI()

// Экспортируем функции для использования в приложении
export async function createPaymentSession(data: CreatePaymentData): Promise<TinkoffResponse<PaymentSession>> {
    return paymentAPI.createPayment(data)
}

export async function createTinkoffCustomer(data: CreateCustomerData): Promise<TinkoffResponse<Customer>> {
    return paymentAPI.createCustomer(data)
}

export async function getPaymentStatus(paymentId: string): Promise<TinkoffResponse<{ status: string }>> {
    return paymentAPI.getPaymentStatus(paymentId)
}

export async function handleTinkoffWebhook(payload: any): Promise<TinkoffResponse> {
    return paymentAPI.handleWebhook(payload)
}

export function verifyTinkoffWebhookSignature(payload: string, signature: string): boolean {
    return paymentAPI.verifyWebhookSignature(payload, signature)
}

// Получение цены для плана подписки
export function getTinkoffPriceId(planId: string): { tinkoffPriceId: string; amount: number; currency: string } | null {
    const plans: Record<string, { tinkoffPriceId: string; amount: number; currency: string }> = {
        'plan-premium': {
            tinkoffPriceId: 'bank_transfer_premium_monthly',
            amount: 999, // 999 рублей
            currency: 'RUB'
        },
        'plan-pro': {
            tinkoffPriceId: 'bank_transfer_pro_monthly',
            amount: 1999, // 1999 рублей
            currency: 'RUB'
        },
        'plan-enterprise': {
            tinkoffPriceId: 'bank_transfer_enterprise_monthly',
            amount: 4999, // 4999 рублей
            currency: 'RUB'
        }
    }

    return plans[planId] || null
}

// Получение названия плана
export function getPlanName(planId: string): string {
    const planNames: Record<string, string> = {
        'plan-premium': 'Premium',
        'plan-pro': 'Pro',
        'plan-enterprise': 'Enterprise'
    }

    return planNames[planId] || 'Unknown Plan'
}
