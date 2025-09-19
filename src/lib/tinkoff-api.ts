/* eslint-disable @typescript-eslint/no-var-requires */
// 💳 Реальная интеграция с Тинькофф API для тестирования

export interface TinkoffInitRequest {
    TerminalKey: string
    Amount: number // в копейках
    OrderId: string
    Description: string
    CustomerKey?: string
    Recurrent?: 'Y' | 'N'
    PayType?: 'O' | 'T'
    Language?: 'ru' | 'en'
    Email?: string
    Phone?: string
    NotificationURL?: string
    SuccessURL?: string
    FailURL?: string
    Receipt?: {
        Email?: string
        EmailCompany: string
        Taxation: 'osn' | 'usn_income' | 'usn_income_outcome' | 'envd' | 'esn' | 'patent'
        Items: Array<{
            Name: string
            Price: number
            Quantity: number
            Amount: number
            Tax: 'none' | 'vat0' | 'vat10' | 'vat18' | 'vat20'
        }>
    }
}

export interface TinkoffInitResponse {
    Success: boolean
    ErrorCode?: string
    Message?: string
    Details?: string
    TerminalKey?: string
    Status?: string
    PaymentId?: number
    PaymentURL?: string
    OrderId?: string
    Amount?: number
}

export interface TinkoffGetStateRequest {
    TerminalKey: string
    PaymentId: number
}

export interface TinkoffGetStateResponse {
    Success: boolean
    ErrorCode?: string
    Message?: string
    Details?: string
    TerminalKey?: string
    Status?: 'NEW' | 'FORM_SHOWED' | 'DEADLINE_EXPIRED' | 'CANCELED' | 'PREAUTHORIZING' | 'AUTHORIZING' | 'AUTH_FAIL' | 'AUTHED' | 'REVERSING' | 'PARTIAL_REVERSED' | 'REVERSED' | 'CONFIRMED' | 'REFUNDED' | 'PARTIAL_REFUNDED' | 'REJECTED'
    PaymentId?: number
    OrderId?: string
    Amount?: number
    Currency?: string
    Description?: string
    Email?: string
    Phone?: string
    CreationDate?: string
    AuthDateTime?: string
    AuthRefNum?: string
    TestMode?: boolean
    RebillId?: number
    CardId?: number
    CardNumber?: string
    CardExpData?: string
    CardType?: string
    BankName?: string
    BankCountryCode?: string
    BankCountry?: string
    Ip?: string
    Fee?: number
    CardHolder?: string
    Recurrent?: boolean
    RedirectDueDate?: string
    Receipt?: any
    Data?: any
}

export interface TinkoffCancelRequest {
    TerminalKey: string
    PaymentId: number
    Amount?: number // в копейках, опционально
}

export interface TinkoffCancelResponse {
    Success: boolean
    ErrorCode?: string
    Message?: string
    Details?: string
    TerminalKey?: string
    Status?: string
    PaymentId?: number
}

class TinkoffAPI {
    private terminalKey: string
    private secretKey: string
    private baseURL: string
    private isTestMode: boolean

    constructor(isTestMode: boolean = false) {
        this.terminalKey = process.env.TINKOFF_TERMINAL_KEY || ''
        this.secretKey = process.env.TINKOFF_SECRET_KEY || ''
        this.isTestMode = isTestMode

        // Выбор окружения по флагам: явный тестовый режим или переменная окружения
        const shouldUseTestEnv = isTestMode || process.env.TINKOFF_ENV === 'test'
        this.baseURL = shouldUseTestEnv
            ? 'https://rest-api-test.tinkoff.ru/v2/'
            : 'https://securepay.tinkoff.ru/v2/'

        if (!this.terminalKey || !this.secretKey) {
            console.warn('Tinkoff API keys not configured')
        }

        // Если создан тестовый экземпляр и заданы тестовые ключи — применим их
        if (isTestMode && process.env.TINKOFF_TERMINAL_KEY_TEST && process.env.TINKOFF_SECRET_KEY_TEST) {
            this.terminalKey = process.env.TINKOFF_TERMINAL_KEY_TEST
            this.secretKey = process.env.TINKOFF_SECRET_KEY_TEST
        }
    }

    /**
     * Установить ключи API
     */
    setKeys(terminalKey: string, secretKey: string) {
        this.terminalKey = terminalKey
        this.secretKey = secretKey
    }

    /**
     * 🔐 Генерация подписи для запроса согласно документации Тинькофф
     */
    private generateToken(data: Record<string, any>): string {
        const crypto = require('crypto')

        // 1. Создаем массив пар ключ-значение (только корневые ПРИМИТИВНЫЕ параметры — без объектов/массивов)
        const pairs = Object.keys(data)
            .filter(key => key !== 'Token') // Исключаем сам токен
            .filter(key => data[key] !== undefined && data[key] !== null)
            .filter(key => typeof data[key] !== 'object') // Исключаем вложенные объекты/массивы (Receipt, DATA, т.п.)
            .map(key => ({ key, value: String(data[key]) }))

        // 2. Добавляем пароль
        pairs.push({ key: 'Password', value: this.secretKey })

        // 3. Сортируем по алфавиту по ключу
        pairs.sort((a, b) => a.key.localeCompare(b.key))

        // 4. Конкатенируем только значения в одну строку
        const tokenString = pairs.map(pair => pair.value).join('')

        console.log('🔐 Генерация токена Тинькофф:', {
            keys: pairs.map(p => p.key),
            tokenStringPreview: tokenString.substring(0, 32) + '...'
        })

        // 5. Применяем SHA-256 с поддержкой UTF-8
        return crypto.createHash('sha256').update(tokenString, 'utf8').digest('hex')
    }

    /**
     * 🚀 Инициализация платежа
     */
    async initPayment(request: TinkoffInitRequest): Promise<TinkoffInitResponse> {
        try {
            const url = `${this.baseURL}Init`

            // Добавляем подпись
            const token = this.generateToken(request)
            const payload = {
                ...request,
                Token: token
            }

            console.log('💳 Инициализация платежа Тинькофф', {
                TerminalKey: request.TerminalKey,
                Amount: request.Amount,
                OrderId: request.OrderId,
                Description: request.Description
            })

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            })

            // Проверяем тип ответа
            const contentType = response.headers.get('content-type')
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text()
                console.error('Тинькофф API вернул не JSON:', text)
                return {
                    Success: false,
                    ErrorCode: 'INVALID_RESPONSE',
                    Message: `Ожидался JSON, получен: ${contentType}`,
                    Details: text.substring(0, 200) + '...'
                }
            }

            const data = await response.json()

            console.log('💳 Ответ Тинькофф Init:', data)

            return data
        } catch (error: any) {
            console.error('Ошибка инициализации платежа:', error)
            return {
                Success: false,
                ErrorCode: 'NETWORK_ERROR',
                Message: error.message || 'Ошибка сети'
            }
        }
    }

    /**
     * 🔍 Получение статуса платежа
     */
    async getState(request: TinkoffGetStateRequest): Promise<TinkoffGetStateResponse> {
        try {
            const url = `${this.baseURL}GetState`

            // Добавляем подпись
            const token = this.generateToken(request)
            const payload = {
                ...request,
                Token: token
            }

            console.log('🔍 Получение статуса платежа Тинькофф', {
                TerminalKey: request.TerminalKey,
                PaymentId: request.PaymentId
            })

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            })

            // Проверяем тип ответа
            const contentType = response.headers.get('content-type')
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text()
                console.error('Тинькофф API вернул не JSON:', text)
                return {
                    Success: false,
                    ErrorCode: 'INVALID_RESPONSE',
                    Message: `Ожидался JSON, получен: ${contentType}`,
                    Details: text.substring(0, 200) + '...'
                }
            }

            const data = await response.json()

            console.log('🔍 Ответ Тинькофф GetState:', data)

            return data
        } catch (error: any) {
            console.error('Ошибка получения статуса платежа:', error)
            return {
                Success: false,
                ErrorCode: 'NETWORK_ERROR',
                Message: error.message || 'Ошибка сети'
            }
        }
    }

    /**
     * ↩️ Отмена платежа (Cancel)
     */
    async cancelPayment(request: TinkoffCancelRequest): Promise<TinkoffCancelResponse> {
        try {
            const url = `${this.baseURL}Cancel`

            // Добавляем подпись
            const token = this.generateToken(request as unknown as Record<string, any>)
            const payload = {
                ...request,
                Token: token
            }

            console.log('↩️ Отмена платежа Тинькофф', {
                TerminalKey: request.TerminalKey,
                PaymentId: request.PaymentId,
                Amount: request.Amount
            })

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            })

            const contentType = response.headers.get('content-type')
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text()
                console.error('Тинькофф API вернул не JSON (Cancel):', text)
                return {
                    Success: false,
                    ErrorCode: 'INVALID_RESPONSE',
                    Message: `Ожидался JSON, получен: ${contentType}`,
                    Details: text.substring(0, 200) + '...'
                }
            }

            const data = await response.json()
            console.log('↩️ Ответ Тинькофф Cancel:', data)
            return data
        } catch (error: any) {
            console.error('Ошибка отмены платежа:', error)
            return {
                Success: false,
                ErrorCode: 'NETWORK_ERROR',
                Message: error.message || 'Ошибка сети'
            }
        }
    }

    /**
     * 🧾 Создание платежа (общая логика для теста и продакшна)
     */
    async createPayment(amount: number, description: string, orderId: string): Promise<TinkoffInitResponse> {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.taskai.space'

        console.log('💳 Создание платежа через Тинькофф API:', {
            amount,
            description,
            orderId,
            isTestMode: this.isTestMode,
            baseURL: this.baseURL,
            appUrl
        })

        const request: TinkoffInitRequest = {
            TerminalKey: this.terminalKey,
            Amount: Math.round(amount * 100), // в копейках
            OrderId: orderId,
            Description: description,
            CustomerKey: 'customer_auto',
            // PayType умышленно не указываем, оставляем поведение по умолчанию
            Language: 'ru',
            Email: 'payments@taskai.space',
            Phone: '+79001234567',
            NotificationURL: `${appUrl.replace(/\/$/, '')}/api/tinkoff/webhook`,
            SuccessURL: `${appUrl.replace(/\/$/, '')}/planner?payment=success`,
            FailURL: `${appUrl.replace(/\/$/, '')}/planner?payment=failed`,
            Receipt: {
                Email: 'payments@taskai.space',
                EmailCompany: 'support@taskai.space',
                Taxation: 'usn_income',
                Items: [{
                    Name: description,
                    Price: Math.round(amount * 100),
                    Quantity: 1,
                    Amount: Math.round(amount * 100),
                    Tax: 'vat20'
                }]
            }
        }

        return this.initPayment(request)
    }
}

// Создаем экземпляры API
const tinkoffAPI = new TinkoffAPI(false) // Продакшн
const tinkoffTestAPI = new TinkoffAPI(true) // Тест

// Экспортируем функции
export async function initTinkoffPayment(request: TinkoffInitRequest): Promise<TinkoffInitResponse> {
    return tinkoffAPI.initPayment(request)
}

export async function getTinkoffPaymentState(request: TinkoffGetStateRequest): Promise<TinkoffGetStateResponse> {
    return tinkoffAPI.getState(request)
}

export async function createTestTinkoffPayment(amount: number, description: string, orderId: string, terminalKey?: string, secretKey?: string): Promise<TinkoffInitResponse> {
    if (terminalKey && secretKey) {
        // Создаем новый экземпляр с переданными ключами в тестовом режиме
        const customTinkoffAPI = new TinkoffAPI(true) // Тестовый режим
        customTinkoffAPI.setKeys(terminalKey, secretKey)
        return customTinkoffAPI.createPayment(amount, description, orderId)
    }
    return tinkoffTestAPI.createPayment(amount, description, orderId)
}

export async function createLiveTinkoffPayment(amount: number, description: string, orderId: string, terminalKey?: string, secretKey?: string): Promise<TinkoffInitResponse> {
    if (terminalKey && secretKey) {
        // Создаем новый экземпляр с переданными ключами в продакшн режиме
        const customTinkoffAPI = new TinkoffAPI(false) // Продакшн режим
        customTinkoffAPI.setKeys(terminalKey, secretKey)
        return customTinkoffAPI.createPayment(amount, description, orderId)
    }
    return tinkoffAPI.createPayment(amount, description, orderId)
}

// Тестовые данные карты для тестовой среды Тинькофф
export const TEST_CARD_DATA = {
    number: '4300000000000777', // Тест №1 из кабинета Тинькофф
    expiry: '12/30',
    cvv: '111',
    holder: 'TEST USER'
}

export async function cancelTinkoffPayment(paymentId: number, amount?: number): Promise<TinkoffCancelResponse> {
    const api = new TinkoffAPI(process.env.TINKOFF_ENV === 'test')
    api.setKeys(
        process.env.TINKOFF_TERMINAL_KEY_TEST || process.env.TINKOFF_TERMINAL_KEY || '',
        process.env.TINKOFF_SECRET_KEY_TEST || process.env.TINKOFF_SECRET_KEY || ''
    )
    return api.cancelPayment({
        TerminalKey: process.env.TINKOFF_TERMINAL_KEY_TEST || process.env.TINKOFF_TERMINAL_KEY || '',
        PaymentId: paymentId,
        Amount: amount
            ? Math.round(amount) // ожидается в копейках, если уже в копейках — передавайте как есть
            : undefined
    })
}
