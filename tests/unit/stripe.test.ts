// 🧪 Unit тесты для Stripe интеграции
import {
    createCheckoutSession,
    createPortalSession,
    createStripeCustomer,
    handleStripeWebhook
} from '@/lib/stripe'
import { beforeEach, describe, expect, it } from '@jest/globals'

// Mock fetch для Node.js окружения
global.fetch = jest.fn()

// Mock Stripe
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

// Mock Stripe модуль
jest.mock('stripe', () => {
    return jest.fn().mockImplementation(() => mockStripe)
})

describe('Stripe Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('createStripeCustomer', () => {
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

            mockStripe.customers.create.mockResolvedValue(mockCustomer)

            const result = await createStripeCustomer(customerData)

            expect(result.success).toBe(true)
            expect(result.data).toEqual(mockCustomer)
            expect(mockStripe.customers.create).toHaveBeenCalledWith(customerData)
        })

        it('должна обрабатывать ошибки создания клиента', async () => {
            const customerData = {
                email: 'invalid-email',
                name: 'Test User',
                metadata: { userId: 'user-123' }
            }

            mockStripe.customers.create.mockRejectedValue(new Error('Invalid email'))

            const result = await createStripeCustomer(customerData)

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

            mockStripe.checkout.sessions.create.mockResolvedValue(mockSession)

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

            mockStripe.checkout.sessions.create.mockRejectedValue(new Error('Invalid plan'))

            const result = await createCheckoutSession(sessionData)

            expect(result.success).toBe(false)
            expect(result.error).toContain('Invalid plan')
        })
    })

    describe('createPortalSession', () => {
        it('должна создавать portal сессию', async () => {
            const portalData = {
                userId: 'user-123',
                returnUrl: 'https://app.com/planner'
            }

            const mockPortalSession = {
                id: 'bps_123',
                url: 'https://billing.stripe.com/session/bps_123'
            }

            mockStripe.billingPortal.sessions.create.mockResolvedValue(mockPortalSession)

            const result = await createPortalSession(portalData)

            expect(result.success).toBe(true)
            expect(result.data).toEqual(mockPortalSession)
        })
    })

    describe('handleStripeWebhook', () => {
        it('должна обрабатывать webhook события', async () => {
            const mockEvent = {
                id: 'evt_123',
                type: 'customer.subscription.created',
                data: {
                    object: {
                        id: 'sub_123',
                        customer: 'cus_123',
                        status: 'active'
                    }
                }
            }

            mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent)

            const result = await handleStripeWebhook('webhook-body', 'stripe-signature')

            expect(result.success).toBe(true)
        })

        it('должна обрабатывать ошибки webhook', async () => {
            mockStripe.webhooks.constructEvent.mockImplementation(() => {
                throw new Error('Invalid signature')
            })

            const result = await handleStripeWebhook('invalid-body', 'invalid-signature')

            expect(result.success).toBe(false)
            expect(result.error).toContain('Invalid signature')
        })
    })
})
