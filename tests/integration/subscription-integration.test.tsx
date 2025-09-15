// 🧪 Integration тесты для системы подписок
import '@testing-library/jest-dom'
import { SubscriptionModal } from '@/components/subscription/SubscriptionModal'
import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus'
import { useSubscription } from '@/hooks/useSubscription'
import { fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from '@jest/globals'

// Mock useSubscription hook
jest.mock('@/hooks/useSubscription', () => ({
    useSubscription: jest.fn()
}))

// Mock fetch
global.fetch = jest.fn()

describe('Subscription Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('SubscriptionModal', () => {
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

        it('должна отображать планы подписок', async () => {
            // Mock fetch для загрузки планов
            ; (global.fetch as any).mockResolvedValueOnce({
                json: () => Promise.resolve({ success: true, data: mockPlans })
            })

            const mockOnSelectPlan = jest.fn()
            const mockOnClose = jest.fn()

            render(
                <SubscriptionModal
                    isOpen={true}
                    onClose={mockOnClose}
                    currentTier="free"
                    onSelectPlan={mockOnSelectPlan}
                />
            )

            // Ждем загрузки планов
            await waitFor(() => {
                expect(screen.getByText('Free')).toBeInTheDocument()
                expect(screen.getByText('Premium')).toBeInTheDocument()
            })

            // Проверяем отображение цен
            expect(screen.getByText('Бесплатно')).toBeInTheDocument()
            expect(screen.getByText('₽999')).toBeInTheDocument()
        })

        it('должна обрабатывать выбор плана', async () => {
            // Mock fetch для загрузки планов
            ; (global.fetch as any).mockResolvedValueOnce({
                json: () => Promise.resolve({ success: true, data: mockPlans })
            })

            const mockOnSelectPlan = jest.fn()
            const mockOnClose = jest.fn()

            render(
                <SubscriptionModal
                    isOpen={true}
                    onClose={mockOnClose}
                    currentTier="free"
                    onSelectPlan={mockOnSelectPlan}
                />
            )

            // Ждем загрузки планов
            await waitFor(() => {
                expect(screen.getByText('Premium')).toBeInTheDocument()
            })

            // Нажимаем на кнопку выбора плана
            const selectButton = screen.getByText('Выбрать план')
            fireEvent.click(selectButton)

            expect(mockOnSelectPlan).toHaveBeenCalledWith('plan-premium')
        })

        it('должна показывать текущий план', async () => {
            // Mock fetch для загрузки планов
            ; (global.fetch as any).mockResolvedValueOnce({
                json: () => Promise.resolve({ success: true, data: mockPlans })
            })

            const mockOnSelectPlan = jest.fn()
            const mockOnClose = jest.fn()

            render(
                <SubscriptionModal
                    isOpen={true}
                    onClose={mockOnClose}
                    currentTier="premium"
                    onSelectPlan={mockOnSelectPlan}
                />
            )

            // Ждем загрузки планов
            await waitFor(() => {
                expect(screen.getByText('Текущий план')).toBeInTheDocument()
            })
        })
    })

    describe('SubscriptionStatus', () => {
        const mockSubscription = {
            id: 'sub-123',
            userId: 'user-123',
            tier: 'premium',
            status: 'active',
            stripeCustomerId: 'cus_123',
            stripeSubscriptionId: 'sub_123',
            currentPeriodStart: new Date('2024-01-01'),
            currentPeriodEnd: new Date('2024-02-01'),
            cancelAtPeriodEnd: false,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01')
        }

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

        it('должна отображать статус активной подписки', async () => {
            // Mock fetch для загрузки статуса
            ; (global.fetch as any).mockResolvedValueOnce({
                json: () => Promise.resolve({
                    success: true,
                    data: {
                        subscription: mockSubscription,
                        plan: mockPlan
                    }
                })
            })

            const mockOnUpgrade = jest.fn()

            render(
                <SubscriptionStatus
                    userId="user-123"
                    onUpgrade={mockOnUpgrade}
                />
            )

            // Ждем загрузки статуса
            await waitFor(() => {
                expect(screen.getByText('Premium')).toBeInTheDocument()
                expect(screen.getByText('Активна')).toBeInTheDocument()
                expect(screen.getByText('₽999')).toBeInTheDocument()
            })
        })

        it('должна показывать кнопку обновления для free плана', async () => {
            const freeSubscription = {
                ...mockSubscription,
                tier: 'free'
            }

            const freePlan = {
                ...mockPlan,
                tier: 'free',
                price: 0
            }

                // Mock fetch для загрузки статуса
                ; (global.fetch as any).mockResolvedValueOnce({
                    json: () => Promise.resolve({
                        success: true,
                        data: {
                            subscription: freeSubscription,
                            plan: freePlan
                        }
                    })
                })

            const mockOnUpgrade = jest.fn()

            render(
                <SubscriptionStatus
                    userId="user-123"
                    onUpgrade={mockOnUpgrade}
                />
            )

            // Ждем загрузки статуса
            await waitFor(() => {
                expect(screen.getByText('Обновить план')).toBeInTheDocument()
            })

            // Нажимаем на кнопку обновления
            const upgradeButton = screen.getByText('Обновить план')
            fireEvent.click(upgradeButton)

            expect(mockOnUpgrade).toHaveBeenCalled()
        })

        it('должна обрабатывать ошибки загрузки', async () => {
            // Mock fetch с ошибкой
            ; (global.fetch as any).mockResolvedValueOnce({
                json: () => Promise.resolve({
                    success: false,
                    error: 'Ошибка загрузки'
                })
            })

            const mockOnUpgrade = jest.fn()

            render(
                <SubscriptionStatus
                    userId="user-123"
                    onUpgrade={mockOnUpgrade}
                />
            )

            // Ждем загрузки статуса
            await waitFor(() => {
                expect(screen.getByText('Нет активной подписки')).toBeInTheDocument()
            })
        })
    })

    describe('useSubscription Hook', () => {
        it('должна загружать статус подписки при инициализации', async () => {
            const mockSubscription = {
                id: 'sub-123',
                userId: 'user-123',
                tier: 'premium',
                status: 'active'
            }

            const mockPlan = {
                id: 'plan-premium',
                name: 'Premium',
                tier: 'premium',
                price: 999
            }

                // Mock fetch для загрузки статуса
                ; (global.fetch as any).mockResolvedValueOnce({
                    json: () => Promise.resolve({
                        success: true,
                        data: {
                            subscription: mockSubscription,
                            plan: mockPlan
                        }
                    })
                })

            const { result } = renderHook(() => useSubscription())

            // Ждем загрузки
            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.subscription).toEqual(mockSubscription)
            expect(result.current.plan).toEqual(mockPlan)
        })

        it('должна создавать checkout сессию', async () => {
            const mockCheckoutSession = {
                id: 'cs_123',
                url: 'https://checkout.stripe.com/c/pay/cs_123'
            }

                // Mock fetch для создания checkout сессии
                ; (global.fetch as any).mockResolvedValueOnce({
                    json: () => Promise.resolve({
                        success: true,
                        data: mockCheckoutSession
                    })
                })

            const { result } = renderHook(() => useSubscription())

            const checkoutResult = await result.current.createCheckoutSession('plan-premium')

            expect(checkoutResult.success).toBe(true)
            expect(checkoutResult.url).toBe(mockCheckoutSession.url)
        })
    })
})
