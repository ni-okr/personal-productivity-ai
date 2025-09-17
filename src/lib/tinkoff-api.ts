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
    NotificationURL?: string
    SuccessURL?: string
    FailURL?: string
    Receipt?: {
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

class TinkoffAPI {
    private terminalKey: string
    private secretKey: string
    private baseURL: string

    constructor() {
        this.terminalKey = process.env.TINKOFF_TERMINAL_KEY || ''
        this.secretKey = process.env.TINKOFF_SECRET_KEY || ''

        // Используем тестовую среду
        this.baseURL = 'https://rest-api-test.tinkoff.ru/v2/'

        if (!this.terminalKey || !this.secretKey) {
            console.warn('Tinkoff API keys not configured')
        }
    }

    /**
     * 🔐 Генерация подписи для запроса согласно документации Тинькофф
     */
    private generateToken(data: Record<string, any>): string {
        const crypto = require('crypto')

        // 1. Создаем массив пар ключ-значение (только корневые параметры)
        const pairs = Object.keys(data)
            .filter(key => key !== 'Token') // Исключаем сам токен
            .map(key => ({
                key,
                value: String(data[key])
            }))

        // 2. Добавляем пароль
        pairs.push({ key: 'Password', value: this.secretKey })

        // 3. Сортируем по алфавиту по ключу
        pairs.sort((a, b) => a.key.localeCompare(b.key))

        // 4. Конкатенируем только значения в одну строку
        const tokenString = pairs.map(pair => pair.value).join('')

        console.log('🔐 Генерация токена Тинькофф:', {
            pairs: pairs.map(p => `${p.key}=${p.value}`),
            tokenString: tokenString.substring(0, 100) + '...',
            secretKey: this.secretKey ? 'SET' : 'NOT_SET',
            length: tokenString.length
        })

        // 5. Применяем SHA-256 с поддержкой UTF-8
        return crypto.createHash('sha256').update(tokenString, 'utf8').digest('hex')
    }

    /**
     * 🚀 Инициализация платежа
     */
    async initPayment(request: TinkoffInitRequest): Promise<TinkoffInitResponse> {
        try {
            const url = `${this.baseUrl}/Init`

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
            const url = `${this.baseUrl}/GetState`

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
     * 🧪 Создание тестового платежа
     */
    async createTestPayment(amount: number, description: string, orderId: string): Promise<TinkoffInitResponse> {
        const request: TinkoffInitRequest = {
            TerminalKey: this.terminalKey,
            Amount: amount * 100, // Конвертируем в копейки
            OrderId: orderId,
            Description: description,
            CustomerKey: 'test_customer',
            PayType: 'T', // Тестовый режим
            Language: 'ru',
            NotificationURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/tinkoff/webhook`,
            SuccessURL: `${process.env.NEXT_PUBLIC_APP_URL}/planner?payment=success`,
            FailURL: `${process.env.NEXT_PUBLIC_APP_URL}/planner?payment=failed`,
            Receipt: {
                EmailCompany: 'support@personal-productivity-ai.vercel.app',
                Taxation: 'usn_income',
                Items: [{
                    Name: description,
                    Price: amount * 100,
                    Quantity: 1,
                    Amount: amount * 100,
                    Tax: 'vat20'
                }]
            }
        }

        return this.initPayment(request)
    }
}

// Создаем экземпляр API
const tinkoffAPI = new TinkoffAPI()

// Экспортируем функции
export async function initTinkoffPayment(request: TinkoffInitRequest): Promise<TinkoffInitResponse> {
    return tinkoffAPI.initPayment(request)
}

export async function getTinkoffPaymentState(request: TinkoffGetStateRequest): Promise<TinkoffGetStateResponse> {
    return tinkoffAPI.getState(request)
}

export async function createTestTinkoffPayment(amount: number, description: string, orderId: string): Promise<TinkoffInitResponse> {
    return tinkoffAPI.createTestPayment(amount, description, orderId)
}

// Тестовые данные карты
export const TEST_CARD_DATA = {
    number: '4300 0000 0000 0777',
    expiry: '12/30',
    cvv: '111'
}
