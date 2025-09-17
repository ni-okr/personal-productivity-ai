/**
 * 🧪 Мигрирован с помощью единого фреймворка тестирования
 * 
 * Автоматически мигрирован: 2025-09-16T21:33:45.025Z
 * Оригинальный файл сохранен как: tests/unit/subscriptions-simple.test.ts.backup
 * 
 * ВАЖНО: Все новые тесты должны использовать единый фреймворк!
 * См. документацию: tests/docs/TESTING_FRAMEWORK.md
 */

// 🧪 Unit тесты для системы подписок (упрощенные)
import {
    getSubscriptionPlan,
    getSubscriptionPlans
} from '@/lib/subscriptions'
import { beforeEach, describe, expect, it } from '@jest/globals'
import { testFramework, testLogger, testMocks, testUtils, TEST_CONFIGS, MOCK_CONFIGS } from '../framework'


describe('Subscription Management (Simple)', () => {
    beforeEach(() => {
    // Настройка единого фреймворка тестирования
    testFramework.updateConfig(TEST_CONFIGS.UNIT)
    testMocks.updateConfig(MOCK_CONFIGS.MINIMAL)
    testMocks.setupAllMocks()
    testLogger.startTest('Test Suite')
        jest.clearAllMocks()
    })

    describe('getSubscriptionPlans', () => {
        it('должна получать все планы подписок', () => {
            const result = getSubscriptionPlans()

            expect(result.success).toBe(true)
            expect(result.plans).toHaveLength(4) // free, premium, pro, enterprise
            expect(result.plans![0].tier).toBe('free')
            expect(result.plans![1].tier).toBe('premium')
            expect(result.plans![2].tier).toBe('pro')
            expect(result.plans![3].tier).toBe('enterprise')
        })

        it('должна возвращать только активные планы', () => {
            const result = getSubscriptionPlans()

            result.plans!.forEach(plan => {
                expect(plan.isActive).toBe(true)
            })
        })

        it('должна иметь правильные цены в копейках', () => {
            const result = getSubscriptionPlans()

            const freePlan = result.plans!.find(p => p.tier === 'free')
            const premiumPlan = result.plans!.find(p => p.tier === 'premium')
            const proPlan = result.plans!.find(p => p.tier === 'pro')
            const enterprisePlan = result.plans!.find(p => p.tier === 'enterprise')

            expect(freePlan?.price).toBe(0)
            expect(premiumPlan?.price).toBe(99900) // 999 рублей в копейках
            expect(proPlan?.price).toBe(199900) // 1999 рублей в копейках
            expect(enterprisePlan?.price).toBe(499900) // 4999 рублей в копейках
        })

        it('должна иметь правильные валюты', () => {
            const result = getSubscriptionPlans()

            result.plans!.forEach(plan => {
                expect(plan.currency).toBe('rub')
            })
        })

        it('должна иметь правильные Тинькофф ID', () => {
            const result = getSubscriptionPlans()

            const freePlan = result.plans!.find(p => p.tier === 'free')
            const premiumPlan = result.plans!.find(p => p.tier === 'premium')
            const proPlan = result.plans!.find(p => p.tier === 'pro')
            const enterprisePlan = result.plans!.find(p => p.tier === 'enterprise')

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
            expect(result?.currency).toBe('rub')
            expect(result?.tinkoffPriceId).toBe('tinkoff_premium_monthly')
        })

        it('должна получать free план', () => {
            const result = getSubscriptionPlan('free')

            expect(result).toBeDefined()
            expect(result?.tier).toBe('free')
            expect(result?.name).toBe('Free')
            expect(result?.price).toBe(0)
            expect(result?.currency).toBe('rub')
            expect(result?.tinkoffPriceId).toBe('')
        })

        it('должна получать pro план', () => {
            const result = getSubscriptionPlan('pro')

            expect(result).toBeDefined()
            expect(result?.tier).toBe('pro')
            expect(result?.name).toBe('Pro')
            expect(result?.price).toBe(199900) // в копейках
            expect(result?.currency).toBe('rub')
            expect(result?.tinkoffPriceId).toBe('tinkoff_pro_monthly')
        })

        it('должна получать enterprise план', () => {
            const result = getSubscriptionPlan('enterprise')

            expect(result).toBeDefined()
            expect(result?.tier).toBe('enterprise')
            expect(result?.name).toBe('Enterprise')
            expect(result?.price).toBe(499900) // в копейках
            expect(result?.currency).toBe('rub')
            expect(result?.tinkoffPriceId).toBe('tinkoff_enterprise_monthly')
        })

        it('должна возвращать null для несуществующего плана', () => {
            const result = getSubscriptionPlan('invalid' as any)

            expect(result).toBeNull()
        })
    })
})
