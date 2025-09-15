// 🧪 Unit тесты для системы подписок
import {
    createSubscription,
    getSubscription,
    getSubscriptionPlan,
    getSubscriptionPlans,
    updateSubscription
} from '@/lib/subscriptions'
import { beforeEach, describe, expect, it } from '@jest/globals'

// Mock Supabase с правильной структурой
const mockSingle = jest.fn()
const mockInsert = jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
        single: mockSingle
    })
})
const mockSelect = jest.fn().mockReturnValue({
    eq: jest.fn().mockReturnValue({
        single: mockSingle
    })
})
const mockUpdate = jest.fn().mockReturnValue({
    eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
            single: mockSingle
        })
    })
})

jest.mock('@/lib/supabase', () => ({
    supabase: {
        from: jest.fn().mockImplementation((table: string) => ({
            insert: mockInsert,
            select: mockSelect,
            update: mockUpdate,
            delete: jest.fn(() => ({
                eq: jest.fn()
            }))
        }))
    }
}))

describe('Subscription Management', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('createSubscription', () => {
        it('должна создавать подписку успешно', async () => {
            const subscriptionData = {
                userId: 'user-123',
                tier: 'premium' as const,
                tinkoffCustomerId: 'customer_123',
                tinkoffPaymentId: 'payment_123',
                currentPeriodStart: new Date('2024-01-01'),
                currentPeriodEnd: new Date('2024-02-01'),
                trialEnd: undefined
            }

            const mockSubscription = {
                id: 'sub-123',
                user_id: 'user-123',
                tier: 'premium',
                status: 'active',
                tinkoff_customer_id: 'customer_123',
                tinkoff_payment_id: 'payment_123',
                current_period_start: '2024-01-01T00:00:00.000Z',
                current_period_end: '2024-02-01T00:00:00.000Z',
                cancel_at_period_end: false,
                trial_end: null,
                created_at: '2024-01-01T00:00:00.000Z',
                updated_at: '2024-01-01T00:00:00.000Z'
            }

            // Настраиваем мок для успешного создания
            mockSingle.mockResolvedValue({
                data: mockSubscription,
                error: null
            })

            const result = await createSubscription(subscriptionData)

            expect(result.success).toBe(true)
            expect(result.subscription).toBeDefined()
            expect(result.subscription?.tier).toBe('premium')
        })

        it('должна обрабатывать ошибки создания подписки', async () => {
            const subscriptionData = {
                userId: 'user-123',
                tier: 'premium' as const,
                tinkoffCustomerId: 'customer_123',
                tinkoffPaymentId: 'payment_123',
                currentPeriodStart: new Date('2024-01-01'),
                currentPeriodEnd: new Date('2024-02-01'),
                trialEnd: undefined
            }

            // Настраиваем мок для ошибки
            mockSingle.mockResolvedValue({
                data: null,
                error: { message: 'Database error' }
            })

            const result = await createSubscription(subscriptionData)

            expect(result.success).toBe(false)
            expect(result.error).toBe('Не удалось создать подписку')
        })
    })

    describe('getSubscription', () => {
        it('должна получать подписку пользователя', async () => {
            const mockSubscription = {
                id: 'sub-123',
                user_id: 'user-123',
                tier: 'premium',
                status: 'active',
                tinkoff_customer_id: 'customer_123',
                tinkoff_payment_id: 'payment_123',
                current_period_start: '2024-01-01T00:00:00.000Z',
                current_period_end: '2024-02-01T00:00:00.000Z',
                cancel_at_period_end: false,
                trial_end: null,
                created_at: '2024-01-01T00:00:00.000Z',
                updated_at: '2024-01-01T00:00:00.000Z'
            }

            // Настраиваем мок для успешного получения
            mockSingle.mockResolvedValue({
                data: mockSubscription,
                error: null
            })

            const result = await getSubscription('user-123')

            expect(result.success).toBe(true)
            expect(result.subscription).toBeDefined()
            expect(result.subscription?.tier).toBe('premium')
        })

        it('должна возвращать free план если подписка не найдена', async () => {
            // Настраиваем мок для отсутствия подписки
            mockSingle.mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' }
            })

            const result = await getSubscription('user-123')

            expect(result.success).toBe(true)
            expect(result.subscription).toBeDefined()
            expect(result.subscription?.tier).toBe('free')
        })
    })

    describe('updateSubscription', () => {
        it('должна обновлять подписку', async () => {
            const updates = {
                status: 'canceled' as const,
                cancelAtPeriodEnd: true
            }

            const mockUpdatedSubscription = {
                id: 'sub-123',
                user_id: 'user-123',
                tier: 'premium',
                status: 'canceled',
                tinkoff_customer_id: 'customer_123',
                tinkoff_payment_id: 'payment_123',
                current_period_start: '2024-01-01T00:00:00.000Z',
                current_period_end: '2024-02-01T00:00:00.000Z',
                cancel_at_period_end: true,
                trial_end: null,
                created_at: '2024-01-01T00:00:00.000Z',
                updated_at: '2024-01-01T00:00:00.000Z'
            }

            // Настраиваем мок для успешного обновления
            mockSingle.mockResolvedValue({
                data: mockUpdatedSubscription,
                error: null
            })

            const result = await updateSubscription('sub-123', updates)

            expect(result.success).toBe(true)
            expect(result.subscription).toBeDefined()
            expect(result.subscription?.status).toBe('canceled')
        })
    })

    describe('getSubscriptionPlans', () => {
        it('должна получать все планы подписок', () => {
            const result = getSubscriptionPlans()

            expect(result).toHaveLength(4) // free, premium, pro, enterprise
            expect(result[0].tier).toBe('free')
            expect(result[1].tier).toBe('premium')
            expect(result[2].tier).toBe('pro')
            expect(result[3].tier).toBe('enterprise')
        })

        it('должна возвращать только активные планы', () => {
            const result = getSubscriptionPlans()

            result.forEach(plan => {
                expect(plan.isActive).toBe(true)
            })
        })

        it('должна иметь правильные цены в копейках', () => {
            const result = getSubscriptionPlans()

            const freePlan = result.find(p => p.tier === 'free')
            const premiumPlan = result.find(p => p.tier === 'premium')
            const proPlan = result.find(p => p.tier === 'pro')
            const enterprisePlan = result.find(p => p.tier === 'enterprise')

            expect(freePlan?.price).toBe(0)
            expect(premiumPlan?.price).toBe(99900) // 999 рублей в копейках
            expect(proPlan?.price).toBe(199900) // 1999 рублей в копейках
            expect(enterprisePlan?.price).toBe(499900) // 4999 рублей в копейках
        })

        it('должна иметь правильные валюты', () => {
            const result = getSubscriptionPlans()

            result.forEach(plan => {
                expect(plan.currency).toBe('RUB')
            })
        })

        it('должна иметь правильные Тинькофф ID', () => {
            const result = getSubscriptionPlans()

            const freePlan = result.find(p => p.tier === 'free')
            const premiumPlan = result.find(p => p.tier === 'premium')
            const proPlan = result.find(p => p.tier === 'pro')
            const enterprisePlan = result.find(p => p.tier === 'enterprise')

            expect(freePlan?.tinkoffPriceId).toBe('')
            expect(premiumPlan?.tinkoffPriceId).toBe('tinkoff_premium_monthly')
            expect(proPlan?.tinkoffPriceId).toBe('tinkoff_pro_monthly')
            expect(enterprisePlan?.tinkoffPriceId).toBe('tinkoff_enterprise_monthly')
        })
    })

    describe('getSubscriptionPlan', () => {
        it('должна получать план по тиру', () => {
            const result = getSubscriptionPlan('premium')

            expect(result).toBeDefined()
            expect(result?.tier).toBe('premium')
            expect(result?.name).toBe('Premium')
            expect(result?.price).toBe(99900) // в копейках
            expect(result?.currency).toBe('RUB')
            expect(result?.tinkoffPriceId).toBe('tinkoff_premium_monthly')
        })

        it('должна получать free план', () => {
            const result = getSubscriptionPlan('free')

            expect(result).toBeDefined()
            expect(result?.tier).toBe('free')
            expect(result?.name).toBe('Free')
            expect(result?.price).toBe(0)
            expect(result?.currency).toBe('RUB')
            expect(result?.tinkoffPriceId).toBe('')
        })

        it('должна получать pro план', () => {
            const result = getSubscriptionPlan('pro')

            expect(result).toBeDefined()
            expect(result?.tier).toBe('pro')
            expect(result?.name).toBe('Pro')
            expect(result?.price).toBe(199900) // в копейках
            expect(result?.currency).toBe('RUB')
            expect(result?.tinkoffPriceId).toBe('tinkoff_pro_monthly')
        })

        it('должна получать enterprise план', () => {
            const result = getSubscriptionPlan('enterprise')

            expect(result).toBeDefined()
            expect(result?.tier).toBe('enterprise')
            expect(result?.name).toBe('Enterprise')
            expect(result?.price).toBe(499900) // в копейках
            expect(result?.currency).toBe('RUB')
            expect(result?.tinkoffPriceId).toBe('tinkoff_enterprise_monthly')
        })

        it('должна возвращать undefined для несуществующего плана', () => {
            const result = getSubscriptionPlan('invalid' as any)

            expect(result).toBeUndefined()
        })
    })
})