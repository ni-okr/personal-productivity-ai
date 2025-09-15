// 🧪 Unit тесты для системы подписок
import {
    createSubscription,
    getSubscription,
    getSubscriptionPlan,
    getSubscriptionPlans,
    updateSubscription
} from '@/lib/subscriptions'
import { beforeEach, describe, expect, it } from '@jest/globals'

// Mock Supabase
const mockSupabase = {
    from: jest.fn(() => ({
        insert: jest.fn(() => ({
            select: jest.fn(() => ({
                single: jest.fn()
            }))
        })),
        select: jest.fn(() => ({
            eq: jest.fn(() => ({
                single: jest.fn()
            }))
        })),
        update: jest.fn(() => ({
            eq: jest.fn(() => ({
                select: jest.fn(() => ({
                    single: jest.fn()
                }))
            }))
        })),
        delete: jest.fn(() => ({
            eq: jest.fn()
        }))
    }))
}

jest.mock('@/lib/supabase', () => ({
    supabase: {
        from: jest.fn(() => ({
            insert: jest.fn(() => ({
                select: jest.fn(() => ({
                    single: jest.fn()
                }))
            })),
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    single: jest.fn()
                }))
            })),
            update: jest.fn(() => ({
                eq: jest.fn(() => ({
                    select: jest.fn(() => ({
                        single: jest.fn()
                    }))
                }))
            })),
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
                status: 'active' as const,
                stripeCustomerId: 'cus_123',
                stripeSubscriptionId: 'sub_123',
                currentPeriodStart: new Date('2024-01-01'),
                currentPeriodEnd: new Date('2024-02-01'),
                cancelAtPeriodEnd: false
            }

            const mockSubscription = { id: 'sub-123', ...subscriptionData }

            mockSupabase.from().insert().select().single.mockResolvedValue({
                data: mockSubscription,
                error: null
            })

            const result = await createSubscription(subscriptionData)

            expect(result.success).toBe(true)
            expect(result.subscription).toEqual(mockSubscription)
            expect(mockSupabase.from).toHaveBeenCalledWith('subscriptions')
        })

        it('должна обрабатывать ошибки создания подписки', async () => {
            const subscriptionData = {
                userId: 'user-123',
                tier: 'premium' as const,
                status: 'active' as const,
                stripeCustomerId: 'cus_123',
                stripeSubscriptionId: 'sub_123',
                currentPeriodStart: new Date('2024-01-01'),
                currentPeriodEnd: new Date('2024-02-01'),
                cancelAtPeriodEnd: false
            }

            mockSupabase.from().insert().select().single.mockResolvedValue({
                data: null,
                error: { message: 'Database error' }
            })

            const result = await createSubscription(subscriptionData)

            expect(result.success).toBe(false)
            expect(result.error).toBe('Database error')
        })
    })

    describe('getSubscription', () => {
        it('должна получать подписку пользователя', async () => {
            const mockSubscription = {
                id: 'sub-123',
                userId: 'user-123',
                tier: 'premium',
                status: 'active'
            }

            mockSupabase.from().select().eq().single.mockResolvedValue({
                data: mockSubscription,
                error: null
            })

            const result = await getSubscription('user-123')

            expect(result.success).toBe(true)
            expect(result.subscription).toEqual(mockSubscription)
        })

        it('должна возвращать null если подписка не найдена', async () => {
            mockSupabase.from().select().eq().single.mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' }
            })

            const result = await getSubscription('user-123')

            expect(result.success).toBe(true)
            expect(result.subscription).toBeNull()
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
                userId: 'user-123',
                tier: 'premium',
                status: 'canceled',
                cancelAtPeriodEnd: true
            }

            mockSupabase.from().update().eq().select().single.mockResolvedValue({
                data: mockUpdatedSubscription,
                error: null
            })

            const result = await updateSubscription('sub-123', updates)

            expect(result.success).toBe(true)
            expect(result.subscription).toEqual(mockUpdatedSubscription)
        })
    })


    describe('getSubscriptionPlans', () => {
        it('должна получать все планы подписок', async () => {
            const mockPlans = [
                {
                    id: 'plan-free',
                    name: 'Free',
                    tier: 'free',
                    price: 0,
                    currency: 'RUB',
                    interval: 'month',
                    features: ['Базовые функции'],
                    limits: { tasks: 50, aiRequests: 10, storage: 100 },
                    stripePriceId: null,
                    isActive: true
                },
                {
                    id: 'plan-premium',
                    name: 'Premium',
                    tier: 'premium',
                    price: 999,
                    currency: 'RUB',
                    interval: 'month',
                    features: ['ИИ планировщик', 'Приоритетная поддержка'],
                    limits: { tasks: 500, aiRequests: 1000, storage: 1000 },
                    stripePriceId: 'price_premium',
                    isActive: true
                }
            ]

            const mockQuery = mockSupabase.from().select().eq() as any
            mockQuery.mockResolvedValue({
                data: mockPlans,
                error: null
            })

            const result = await getSubscriptionPlans()

            expect(result).toEqual(mockPlans)
        })
    })

    describe('getSubscriptionPlan', () => {
        it('должна получать план по тиру', async () => {
            const mockPlan = {
                id: 'plan-premium',
                name: 'Premium',
                tier: 'premium',
                price: 999,
                currency: 'RUB',
                interval: 'month',
                features: ['ИИ планировщик'],
                limits: { tasks: 500, aiRequests: 1000, storage: 1000 },
                stripePriceId: 'price_premium',
                isActive: true
            }

            mockSupabase.from().select().eq().single.mockResolvedValue({
                data: mockPlan,
                error: null
            })

            const result = await getSubscriptionPlan('premium')

            expect(result).toEqual(mockPlan)
        })
    })
})

