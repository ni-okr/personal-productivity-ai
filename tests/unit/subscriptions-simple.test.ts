// 🧪 Unit тесты для системы подписок (упрощенные)
import {
    getSubscriptionPlan,
    getSubscriptionPlans
} from '@/lib/subscriptions'
import { beforeEach, describe, expect, it } from '@jest/globals'

describe('Subscription Management (Simple)', () => {
    beforeEach(() => {
        jest.clearAllMocks()
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
