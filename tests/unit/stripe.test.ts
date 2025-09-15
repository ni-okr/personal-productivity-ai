// 🧪 Unit тесты для Stripe интеграции
import {
    createCheckoutSession,
    createCustomer
} from '@/lib/stripe'
import { beforeEach, describe, expect, it } from '@jest/globals'

// Mock fetch для Node.js окружения
global.fetch = jest.fn()

// Mock Stripe модуль
jest.mock('stripe', () => {
    return jest.fn().mockImplementation(() => ({
        customers: {
            create: jest.fn()
        },
        checkout: {
            sessions: {
                create: jest.fn()
            }
        },
        billingPortal: {
            sessions: {
                create: jest.fn()
            }
        },
        webhooks: {
            constructEvent: jest.fn()
        }
    }))
})

// Получаем мок после импорта
const mockStripe = {
    customers: {
        create: jest.fn()
    },
    checkout: {
        sessions: {
            create: jest.fn()
        }
    },
    billingPortal: {
        sessions: {
            create: jest.fn()
        }
    },
    webhooks: {
        constructEvent: jest.fn()
    }
}

describe('Stripe Integration', () => {
    let mockStripeInstance: any

    beforeEach(() => {
        jest.clearAllMocks()
        // Получаем экземпляр мока
        const Stripe = require('stripe')
        mockStripeInstance = new Stripe()
    })

    describe('createCustomer', () => {
        it('должна создавать клиента Stripe', async () => {
            const customerData = {
                email: 'test@example.com',
                name: 'Test User',
                metadata: { userId: 'user-123' }
            }

            const mockCustomer = {
                id: 'cus_123',
                email: 'test@example.com',
                name: 'Test User'
            }

            mockStripeInstance.customers.create.mockResolvedValue(mockCustomer)

            const result = await createCustomer('user-123', customerData.email, customerData.name)

            expect(result.success).toBe(true)
            expect(result.data).toEqual(mockCustomer)
            expect(mockStripeInstance.customers.create).toHaveBeenCalledWith(customerData)
        })

        it('должна обрабатывать ошибки создания клиента', async () => {
            const customerData = {
                email: 'invalid-email',
                name: 'Test User',
                metadata: { userId: 'user-123' }
            }

            mockStripeInstance.customers.create.mockRejectedValue(new Error('Invalid email'))

            const result = await createCustomer('user-123', customerData.email, customerData.name)

            expect(result.success).toBe(false)
            expect(result.error).toContain('Invalid email')
        })
    })

    describe('createCheckoutSession', () => {
        it('должна создавать checkout сессию', async () => {
            const sessionData = {
                userId: 'user-123',
                planId: 'plan-premium',
                successUrl: 'https://app.com/success',
                cancelUrl: 'https://app.com/cancel',
                trialDays: 7
            }

            const mockSession = {
                id: 'cs_123',
                url: 'https://checkout.stripe.com/c/pay/cs_123'
            }

            mockStripeInstance.checkout.sessions.create.mockResolvedValue(mockSession)

            const result = await createCheckoutSession(sessionData)

            expect(result.success).toBe(true)
            expect(result.data).toEqual(mockSession)
        })

        it('должна обрабатывать ошибки создания сессии', async () => {
            const sessionData = {
                userId: 'user-123',
                planId: 'invalid-plan',
                successUrl: 'https://app.com/success',
                cancelUrl: 'https://app.com/cancel'
            }

            mockStripeInstance.checkout.sessions.create.mockRejectedValue(new Error('Invalid plan'))

            const result = await createCheckoutSession(sessionData)

            expect(result.success).toBe(false)
            expect(result.error).toContain('Invalid plan')
        })
    })

})
