// 🧪 Моки для API routes
export const mockApiResponses = {
    // Subscription API
    '/api/subscriptions/status': {
        success: true,
        data: {
            plan: {
                id: 'plan-free',
                name: 'Free',
                tier: 'free',
                price: 0,
                currency: 'RUB'
            },
            subscription: null
        }
    },
    '/api/subscriptions/create-checkout': {
        success: true,
        data: {
            paymentId: 'payment_123',
            paymentMethod: 'bank_transfer',
            amount: 999,
            currency: 'RUB',
            qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            bankDetails: {
                recipient: 'Тестовый ИП',
                account: '12345678901234567890',
                bank: 'АО «ТБанк»',
                bik: '044525225',
                inn: '123456789012'
            }
        }
    },
    '/api/subscriptions/plans': {
        success: true,
        data: [
            {
                id: 'plan-free',
                name: 'Free',
                tier: 'free',
                price: 0,
                currency: 'RUB',
                interval: 'month',
                features: ['Базовые функции'],
                limits: { tasks: 50, aiRequests: 10, storage: 100 },
                tinkoffPriceId: '',
                isActive: true
            },
            {
                id: 'plan-premium',
                name: 'Premium',
                tier: 'premium',
                price: 99900,
                currency: 'RUB',
                interval: 'month',
                features: ['ИИ планировщик', 'Приоритетная поддержка'],
                limits: { tasks: 500, aiRequests: 1000, storage: 1000 },
                tinkoffPriceId: 'tinkoff_premium_monthly',
                isActive: true
            }
        ]
    },
    // Tasks API
    '/api/tasks': {
        success: true,
        data: [
            {
                id: 'task-1',
                title: 'Тестовая задача',
                description: 'Описание задачи',
                priority: 'medium',
                status: 'pending',
                dueDate: '2024-12-31T23:59:59.000Z',
                estimatedMinutes: 60,
                actualMinutes: null,
                source: 'manual',
                userId: 'user-123',
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z'
            }
        ]
    },
    // Auth API
    '/api/auth/profile': {
        success: true,
        data: {
            id: 'user-123',
            email: 'test@example.com',
            name: 'Test User',
            subscription: 'free',
            createdAt: '2024-01-01T00:00:00.000Z',
            lastLoginAt: '2024-01-01T00:00:00.000Z'
        }
    }
}

// Mock fetch function
export const mockFetch = (url: string, options?: RequestInit) => {
    const path = url.replace(/^https?:\/\/[^\/]+/, '')
    const response = mockApiResponses[path as keyof typeof mockApiResponses]
    
    if (response) {
        return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve(response)
        } as Response)
    }
    
    // Default error response
    return Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({
            success: false,
            error: 'Not found'
        })
    } as Response)
}
